const nombreCache = 'apv-v1';
const archivos = [
   '/',
   '/index.html',
   '/error.html',
   '/css/bootstrap.css',
   '/css/styles.css',
   '/js/app.js',
   '/js/apv.js',
];

// Evento que sucede al instalarse el SW
self.addEventListener('install', e => {
    console.log('Instalado el Service Worker...');
    e.waitUntil(
        caches.open(nombreCache)
            .then(cache => {
                console.log('Cacheando');
                return cache.addAll(archivos);
            })
    );
});

// Evento para activar el SW
self.addEventListener('activate', e => {
    console.log('Service Worker Activado...');
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(cache => {
                    if (cache !== nombreCache) {
                        console.log('Eliminando cache antigua', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Evento fetch para manejar las solicitudes
self.addEventListener('fetch', e => {
    console.log('Registrando fetch...', e);
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Si la respuesta es válida, retornarla
                if (response.ok) {
                    return response;
                }
                // Si la respuesta no es válida, retornar la página de error
                return caches.match('/error.html');
            })
            .catch(() => {
                // Si hay un problema de red, intentar servir desde la caché
                return caches.match(e.request)
                    .then(respuestaCache => {
                        return respuestaCache || caches.match('/error.html');
                    });
            })
    );
});
