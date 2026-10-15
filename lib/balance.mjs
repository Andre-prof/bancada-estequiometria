import {composition} from './chemistry.mjs';
const gcd=(a,b)=>b?gcd(b,a%b):a<0n?-a:a;
const fraction=(n,d=1n)=>{if(!d)throw Error('Divisão inválida no balanceamento.');if(d<0n){n=-n;d=-d;}const g=gcd(n,d)||1n;return[n/g,d/g];};
const subtract=(a,b)=>fraction(a[0]*b[1]-b[0]*a[1],a[1]*b[1]);
const multiply=(a,b)=>fraction(a[0]*b[0],a[1]*b[1]);
const divide=(a,b)=>fraction(a[0]*b[1],a[1]*b[0]);
export function parseEquation(text){
 if(typeof text!=='string'||text.length>1000)throw Error('Use uma equação com até 1.000 caracteres.');
 const normalized=text.replace(/[₀-₉]/g,c=>String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))),sides=normalized.split(/<->|⇌|⇄|->|=>|→|⇒|⟶|=/);
 if(sides.length!==2)throw Error('Separe reagentes e produtos com ->, → ou =.');
 const parsed=sides.map(side=>{const terms=side.split('+');if(terms.length>6||terms.some(t=>!t.trim()))throw Error('Preencha cada espécie, separando-as por + (até 6 por lado).');
 const seen=new Set();return terms.map(term=>{const state=term.match(/\((aq|s|l|g)\)\s*$/i);const formula=term.replace(/\((aq|s|l|g)\)\s*$/i,'').trim().replace(/^\d+\s*/,'').replace(/\s+/g,'');composition(formula);if(seen.has(formula))throw Error('Há uma espécie repetida no mesmo lado.');seen.add(formula);return{formula,coef:1,phase:state?state[1].toLowerCase():'aq',explicitPhase:!!state};});});
 return{reactants:parsed[0],products:parsed[1]};
}
export function atomCounts(reaction){
 const sides=[reaction.reactants,reaction.products].map(side=>{const total={};for(const s of side){const c=Number.isInteger(s.coef)&&s.coef>0?s.coef:0;for(const[e,n]of Object.entries(composition(s.formula)))total[e]=(total[e]||0)+n*c;}return total;});
 return [...new Set([...Object.keys(sides[0]),...Object.keys(sides[1])])].map(element=>({element,left:sides[0][element]||0,right:sides[1][element]||0,balanced:(sides[0][element]||0)===(sides[1][element]||0)}));
}
export function checkBalance(reaction){
 const species=[...reaction.reactants,...reaction.products];if(species.some(s=>!Number.isInteger(s.coef)||s.coef<1||s.coef>10000))return{balanced:false,simplified:false,divisor:1,message:'Use coeficientes inteiros de 1 a 10.000.',counts:atomCounts(reaction)};
 const counts=atomCounts(reaction),balanced=counts.every(e=>e.balanced),divisor=Number(species.map(s=>BigInt(s.coef)).reduce(gcd,0n)),simplified=divisor===1;
 return{balanced,simplified,divisor,counts,message:!balanced?'Ainda falta conservar '+counts.filter(e=>!e.balanced).map(e=>e.element).join(', ')+'. Compare os dois lados.':!simplified?`Os átomos estão conservados. Divida todos os coeficientes por ${divisor} para obter a menor proporção inteira.`:'Balanceada! Todos os átomos estão conservados na menor proporção inteira.'};
}
export function balanceReaction(reaction){
 const species=[...reaction.reactants,...reaction.products];if(!reaction.reactants.length||!reaction.products.length||species.length>12)throw Error('Informe reagentes e produtos (até 12 espécies).');
 const compositions=species.map(s=>composition(s.formula)),elements=[...new Set(compositions.flatMap(c=>Object.keys(c)))];
 for(const e of elements)if(!compositions.slice(0,reaction.reactants.length).some(c=>c[e])||!compositions.slice(reaction.reactants.length).some(c=>c[e]))throw Error(`O elemento ${e} aparece em apenas um lado. Revise as fórmulas ou as espécies.`);
 const A=elements.map(e=>compositions.map((c,i)=>fraction(BigInt((i<reaction.reactants.length?1:-1)*(c[e]||0))))),pivots=[];let row=0;
 for(let col=0;col<species.length&&row<A.length;col++){const pivot=A.findIndex((r,i)=>i>=row&&r[col][0]!==0n);if(pivot<0)continue;[A[row],A[pivot]]=[A[pivot],A[row]];const value=A[row][col];A[row]=A[row].map(x=>divide(x,value));for(let i=0;i<A.length;i++)if(i!==row&&A[i][col][0]!==0n){const f=A[i][col];A[i]=A[i].map((x,j)=>subtract(x,multiply(f,A[row][j])));}pivots.push(col);row++;}
 const free=species.map((_,i)=>i).filter(i=>!pivots.includes(i));
 if(!free.length)throw Error('Não existe balanceamento com essas espécies. Confira as fórmulas.');
 if(free.length!==1)throw Error('Há mais de uma proporção possível. Informe melhor os produtos ou as condições; o app não escolhe uma reação arbitrariamente.');
 const vector=species.map(()=>fraction(0n));vector[free[0]]=fraction(1n);pivots.forEach((col,i)=>{vector[col]=fraction(-A[i][free[0]][0],A[i][free[0]][1]);});
 let multiple=1n;for(const v of vector)multiple=multiple/gcd(multiple,v[1])*v[1];let ints=vector.map(v=>v[0]*(multiple/v[1]));if(ints.every(n=>n<0n))ints=ints.map(n=>-n);if(ints.some(n=>n<=0n))throw Error('Não há solução com todas essas espécies nos lados indicados. Revise a equação.');const divisor=ints.reduce(gcd,0n);ints=ints.map(n=>n/divisor);if(ints.some(n=>n>10000n))throw Error('O resultado excede 10.000 por coeficiente. Revise a equação.');
 const coefficients=ints.map(Number),out={...reaction,reactants:reaction.reactants.map((s,i)=>({...s,coef:coefficients[i]})),products:reaction.products.map((s,i)=>({...s,coef:coefficients[i+reaction.reactants.length]}))};
 if(!checkBalance(out).balanced)throw Error('Não foi possível confirmar o balanceamento.');return out;
}
