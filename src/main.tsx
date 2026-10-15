import React from 'react';import{createRoot}from'react-dom/client';
import Lab from './lab';import './globals.css';
function App(){const[session,setSession]=React.useState(0);return <Lab key={session} onNewSession={()=>{setSession(s=>s+1);window.scrollTo(0,0);requestAnimationFrame(()=>document.querySelector<HTMLSelectElement>('select[aria-label="Escolher reação"]')?.focus({preventScroll:true}));}}/>;}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if(import.meta.env.PROD&&'serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});}
