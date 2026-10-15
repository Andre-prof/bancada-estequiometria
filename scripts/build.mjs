import{build}from'vite';import{readdir,readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
await build();
const assets=(await readdir('docs/assets')).sort().map(x=>'assets/'+x),hash=createHash('sha256').update(assets.join('|')).update(await readFile('docs/index.html')).update(await readFile('docs/manifest.webmanifest')).update(await readFile('docs/favicon.svg')).digest('hex').slice(0,12),files=['./','index.html','favicon.svg','manifest.webmanifest',...assets];
await writeFile('docs/.nojekyll','');
await writeFile('docs/sw.js',`const PREFIX='bancada-'+self.registration.scope,CACHE=PREFIX+'${hash}',FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(async()=>await caches.match(e.request)||(e.request.mode==='navigate'?await caches.match(new URL('index.html',self.registration.scope).href):Response.error())));});
`);
console.log('GitHub Pages pronto em docs/; cache offline:',hash);

