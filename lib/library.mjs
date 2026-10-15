import{generateTargeted}from'./activities.mjs';
import{SEEDS,validateReaction,calculate,generateQuestions}from'./chemistry.mjs';import{parseEquation,balanceReaction}from'./balance.mjs';
export const KEY='bancada-library-v3';
export function validateQuestion(q){if(!q||typeof q.title!=='string'||q.title.length<5||q.title.length>1000||typeof q.statement!=='string'||q.statement.length>10000||!['string','number'].includes(typeof q.answer)||typeof q.answer==='number'&&!Number.isFinite(q.answer)||String(q.answer).length>1000||typeof q.unit!=='string'||q.unit.length>30||typeof q.explanation!=='string'||q.explanation.length>5000)throw Error('Questão inválida: confira pergunta, resposta, unidade e resolução.');return q;}
export function validateLibrary(data){if(!data||data.version!==3||!Array.isArray(data.reactions)||!Array.isArray(data.questions)||data.reactions.length>200||data.questions.length>1000)throw Error('Biblioteca incompatível ou muito grande. Use um arquivo exportado pela Bancada.');const ids=new Set();for(const r of data.reactions){validateReaction(r);if(typeof r.id!=='string'||SEEDS.some(s=>s.id===r.id)||ids.has(r.id))throw Error('Reação com identificador inválido ou repetido.');ids.add(r.id);if(r.defaults)calculate(r,r.defaults);}for(const q of data.questions){validateQuestion(q);if(typeof q.id!=='string'||ids.has(q.id))throw Error('Questão com identificador inválido ou repetido.');ids.add(q.id);}return data;}
export function readLibrary(storage){const raw=storage.getItem(KEY);return raw?validateLibrary(JSON.parse(raw)):{version:3,reactions:[],questions:[]};}
export function writeLibrary(storage,data){validateLibrary(data);storage.setItem(KEY,JSON.stringify(data));return data;}
export function mergeLibrary(storage,incoming){validateLibrary(incoming);const old=readLibrary(storage);const merge=(a,b)=>Array.from(new Map([...a,...b].map(x=>[x.id,x])).values());return writeLibrary(storage,{version:3,reactions:merge(old.reactions,incoming.reactions),questions:merge(old.questions,incoming.questions)});}
export async function localApi(path,body,method){
 if(path==='/api/calculate')return calculate(body.reaction,body.inputs,body.settings);
 if(path==='/api/generate')return{questions:generateTargeted(body.reaction,body.inputs,body.settings,body.count,body.target??'mixed')};
 if(path==='/api/balance')return{reaction:balanceReaction(body.equation!==undefined?parseEquation(body.equation):body.reaction)};
 const storage=window.localStorage,data=readLibrary(storage);
 if(path.startsWith('/api/catalog')){
 if(method==='DELETE'){const id=new URL(path,window.location.href).searchParams.get('id');writeLibrary(storage,{...data,reactions:data.reactions.filter(r=>r.id!==id),questions:data.questions.filter(q=>q.id!==id)});return{ok:true};}
 if(!body)return{reactions:[...SEEDS,...data.reactions],questions:data.questions,signedIn:true};
 const key=body.kind==='reaction'?'reactions':body.kind==='question'?'questions':null;if(!key)throw Error('Tipo de cadastro inválido.');if(key==='reactions')validateReaction(body.payload);else validateQuestion(body.payload);
 const id=body.id??crypto.randomUUID();if(SEEDS.some(r=>r.id===id))throw Error('Duplique o exemplo para criar sua versão.');const payload={...body.payload,id};writeLibrary(storage,{...data,[key]:[payload,...data[key].filter(x=>x.id!==id)]});return{id};
 }throw Error('Operação local indisponível.');
}
