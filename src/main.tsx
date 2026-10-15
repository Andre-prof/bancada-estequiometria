import React from 'react';import{createRoot}from'react-dom/client';
import Lab from './lab';import './globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Lab/></React.StrictMode>);
if(import.meta.env.PROD&&'serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});}
