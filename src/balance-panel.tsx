import StoichiometricMass from './stoichiometric-mass';
'use client';
import{useState}from'react';
import{localApi}from'../lib/library.mjs';
import{Plus,Minus,Check,ArrowRight,LoaderCircle,Info,RotateCcw}from'lucide-react';
import{parseEquation,checkBalance}from'../lib/balance.mjs';
import{pretty,equation}from'../lib/chemistry.mjs';
type S={formula:string;coef:number;phase:string;explicitPhase?:boolean};type R={reactants:S[];products:S[]};
const raw=(r:R)=>[r.reactants,r.products].map(side=>side.map(s=>`${s.formula}(${s.phase})`).join(' + ')).join(' -> ');
const displayEquation=(r:R)=>[r.reactants,r.products].map(side=>side.map(s=>(s.coef===1?'':s.coef+' ')+pretty(s.formula)+(s.explicitPhase===false?'':'('+s.phase+')')).join(' + ')).join(' → ');
const reset=(r:R)=>({...r,reactants:r.reactants.map(s=>({...s,coef:1})),products:r.products.map(s=>({...s,coef:1}))});
export default function BalancePanel({initial,onApply,onCreate,allowAuto=false,preserve=false}:{preserve?:boolean;allowAuto?:boolean;initial:R;onApply:(r:R)=>void;onCreate:(r:R)=>void}){
 const[text,setText]=useState(raw(initial)),[loaded,setLoaded]=useState(raw(initial)),[r,setR]=useState<R>(preserve?initial:reset(initial)),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const report=checkBalance(r),valid=report.balanced&&report.simplified&&text===loaded,same=r.reactants.length===initial.reactants.length&&r.products.length===initial.products.length&&r.reactants.every((s,i)=>s.formula===initial.reactants[i].formula)&&r.products.every((s,i)=>s.formula===initial.products[i].formula);
 const load=()=>{try{const p=parseEquation(text);setR(p);setLoaded(text);setError('');setMessage('Ajuste apenas os coeficientes. As fórmulas permanecem iguais.');}catch(e){setError((e as Error).message);}};
 const auto=async()=>{setError('');setBusy(true);try{const data:any=await localApi('/api/balance',{equation:text});setR(data.reaction);setLoaded(text);setMessage('O balanceador encontrou a menor proporção inteira e conferiu cada elemento.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 const change=(side:'reactants'|'products',i:number,n:number)=>{setR(old=>({...old,[side]:old[side].map((s,j)=>i===j?{...s,coef:Math.max(1,Math.min(10000,n))}:s)}));setMessage('');setError('');};
 return <div className="balance-panel"><p className="muted">Digite uma equação e ajuste os coeficientes. A contagem de átomos acompanha cada mudança; as fórmulas permanecem iguais.</p>
 <label className="field"><span>Equação química</span><input className="equation-entry" maxLength={1000} value={text} onChange={e=>{setText(e.target.value);setMessage('');setError('');}} placeholder="Ex.: Fe + O2 -> Fe2O3" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();load();}}}/></label>
 <div className="balance-actions"><button className="secondary" onClick={load} disabled={busy}><RotateCcw size={15}/>Carregar para treinar</button>{allowAuto&&<button className="primary" onClick={auto} disabled={busy}>{busy?<LoaderCircle size={16} className="spin"/>:<Check size={16}/>}Balancear automaticamente</button>}</div>
 {text!==loaded?<div className="notice small"><Info size={16}/><span>A equação foi alterada. Carregue-a para treinar ou use o balanceamento automático.</span></div>:<>
 <div className="coefficient-equation">{(['reactants','products'] as const).map((side,k)=><div className="coefficient-side" key={side}>{k===1&&<span className="equation-arrow">→</span>}{r[side].map((s,i)=><div className="coefficient-term" key={side+i}>{i>0&&<span className="equation-plus">+</span>}<div className="coefficient-control"><button className="icon-button" aria-label={`Diminuir coeficiente de ${s.formula} nos ${side==='reactants'?'reagentes':'produtos'}`} disabled={s.coef<=1} onClick={()=>change(side,i,s.coef-1)}><Minus size={12}/></button><input type="number" min={1} max={10000} step={1} aria-label={`Coeficiente de ${s.formula} nos ${side==='reactants'?'reagentes':'produtos'}`} value={Number.isFinite(s.coef)?s.coef:''} onChange={e=>change(side,i,e.target.value===''?NaN:Number(e.target.value))}/><button className="icon-button" disabled={s.coef>=10000} aria-label={`Aumentar coeficiente de ${s.formula} nos ${side==='reactants'?'reagentes':'produtos'}`} onClick={()=>change(side,i,Number.isFinite(s.coef)?s.coef+1:1)}><Plus size={12}/></button></div><strong>{pretty(s.formula)}</strong></div>)}</div>)}</div>
 <div className="balance-live" aria-live="polite"><div className="table-scroll"><table><thead><tr><th>Elemento</th><th>Reagentes</th><th>Produtos</th><th>Conservação</th></tr></thead><tbody>{report.counts.map(c=><tr key={c.element}><td><strong>{c.element}</strong></td><td>{c.left}</td><td>{c.right}</td><td className={c.balanced?'atoms-ok':'atoms-pending'}>{c.balanced?'✓ Igual':'≠ Ajustar'}</td></tr>)}</tbody></table></div><p className={'balance-feedback '+(valid?'atoms-ok':'atoms-pending')}>{report.message}</p></div>
 {!report.simplified&&report.balanced&&<button className="secondary" onClick={()=>{setR(old=>({...old,reactants:old.reactants.map(s=>({...s,coef:s.coef/report.divisor})),products:old.products.map(s=>({...s,coef:s.coef/report.divisor}))}));setMessage('Coeficientes simplificados.');}}>Simplificar por {report.divisor}</button>}
 </>}
 {message&&<p className="balance-message" role="status">{message}</p>}{error&&<p className="error-message" role="alert">{error}</p>}
 {valid&&<div className="balanced-result"><small>EQUAÇÃO BALANCEADA</small><StoichiometricMass reaction={r}/><button className="primary" onClick={()=>same?onApply(r):onCreate(r)}>{same?'Usar na bancada':'Levar ao cadastro de reação'}<ArrowRight size={15}/></button></div>}
 <p className="balance-limits">Aceita fórmulas neutras, parênteses, colchetes e hidratos, como CuSO₄·5H₂O. O balanceamento conserva átomos; a viabilidade da reação e os estados físicos precisam de revisão. Estados omitidos são preenchidos como aq no cadastro. Equações iônicas não são suportadas.</p>
 </div>;
}


