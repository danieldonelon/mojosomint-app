var C="mm-v4",A=["./","index.html","styles.css","data.js","schedule.js","voice.js","app.js","manifest.json","fonts/inter-tight-600-700.woff2","icons/logo.png","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(A);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(r){return r||fetch(e.request).catch(function(){return caches.match("index.html");});}));});
