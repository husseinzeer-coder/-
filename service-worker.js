/* Halaqaty PWA: cache the app shell, prefer fresh pages when online. */
const CACHE='halaqaty-shell-v2';
const SHELL=[
 './','./index.html','./style.css','./meeting.css',
 './students.js','./templates.js','./report.js','./app.js','./meeting.js','./workspace.js',
 './manifest.webmanifest',
 './bakgrounds/icon-192.png','./bakgrounds/icon-512.png',
 './bakgrounds/background.png','./bakgrounds/background-12.png',
 './bakgrounds/meeting-background.png',
 './bakgrounds/quran_template_01_turquoise_navy.png',
 './bakgrounds/quran_template_02_emerald_gold.png',
 './bakgrounds/quran_template_03_burgundy_gold.png'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(SHELL.map(path=>cache.add(new Request(path,{cache:'reload'}))));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('halaqaty-shell-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const request=event.request;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   try{return await fetch(request)}catch(err){
    return await caches.match('./index.html')||Response.error();
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response.ok&&new URL(request.url).pathname.startsWith(new URL(self.registration.scope).pathname)){
    const cache=await caches.open(CACHE);
    cache.put(request,response.clone()).catch(()=>{});
   }
   return response;
  }catch(err){return Response.error()}
 })());
});
