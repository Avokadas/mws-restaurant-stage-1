import idb from 'idb';

var staticCacheName = 'mws-restaurant-static-v1';
var contentImgsCache = 'mws-restaurant-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

var dbPromise = idb.open('restaurants-db', 3, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore('restaurants', { keypath: 'name' });
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/dist/build.js',
        '/dist/build_restaurant.js',
        '/css/styles.css',
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-restaurant-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  
  // if (requestUrl.origin === location.origin) {
  //   if (requestUrl.pathname.startsWith('/img/')) {
  //     event.respondWith(serveImage(event.request));
  //     return;
  //   }
  // }
  
  if(requestUrl.origin === 'http://localhost:1337') {
    if(requestUrl.pathname === '/restaurants') {

      if(navigator.onLine) {
        event.respondWith(
          fetch(event.request)
          .then(res => {
            let originalResponse = res.clone();
            return res.json()
            .then(restaurants => addRestaurantsToDatabase(restaurants))
            .then(() => {
              return originalResponse
            })
          })
        )
      } else {
        event.respondWith(
          dbPromise.then(db => {
            return db
              .transaction('restaurants')
              .objectStore('restaurants')
              .getAll()
              .then(res => {
                var blob = new Blob([JSON.stringify(res, null, 2)], {type : 'application/json'});

                var init = { "status" : 200 , "statusText" : "SuperSmashingGreat!" };
                return new Response(blob, init);
              });
          })
        )
      }
    }
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }

});

const addRestaurantsToDatabase = (restaurants) => {
  return dbPromise.then(db => {
    var tx = db.transaction('restaurants', 'readwrite');
    var keyValStore = tx.objectStore('restaurants');
    restaurants.forEach(restaurant => {
      keyValStore.put(restaurant, restaurant.name)
    })
    return tx.complete;
  })
}

// function serveImage(request) {
//   var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

//   return caches.open(contentImgsCache).then(function(cache) {
//     return cache.match(storageUrl).then(function(response) {
//       if (response) return response;

//       return fetch(request).then(function(networkResponse) {
//         cache.put(storageUrl, networkResponse.clone());
//         return networkResponse;
//       });
//     });
//   });
// }
