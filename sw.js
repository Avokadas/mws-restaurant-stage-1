import idb from 'idb';

var staticCacheName = 'mws-restaurant-static-v1';
var contentImgsCache = 'mws-restaurant-imgs-v1';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

var dbPromise = idb.open('restaurants-db', 4, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore('restaurants', { keypath: 'name' });
    case 1:
      upgradeDb.createObjectStore('restaurantDetails', { keypath: 'id' });
    case 2:
      upgradeDb.createObjectStore('restaurantReviews', { keypath: 'restaurantId' });
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/dist/build.js',
        '/dist/build_restaurant.js',
        '/css/styles.css',
        '/css/styles-details.css',
        '/css/styles-wide.css',
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) => cacheName.startsWith('mws-restaurant-') && !allCaches.includes(cacheName)
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-reviews') {
    
    event.waitUntil(dbPromise.then(db => {
      return db
        .transaction('restaurantReviews')
        .objectStore('restaurantReviews')
        .getAll()
        .then(reviewsByRestaurant => {
          const reviews = reviewsByRestaurant
            .reduce((allReviews, reviewsBySingleRestaurant) => allReviews.concat(reviewsBySingleRestaurant),
              []);

          if(reviews.length === 0) return;

          let offlineReviews = reviews
            .filter(r => r.isOffline);

          Promise.all(
          offlineReviews.map(offlineReview => {
            fetch('http://localhost:1337/reviews/', {
              method: 'post',
              body: JSON.stringify({
                restaurant_id: offlineReview.restaurant_id,
                name: offlineReview.name,
                rating: offlineReview.rating,
                comments: offlineReview.comments
              })
            })
              .then(res => res.json())
              .then(review => {
                dbPromise
                .then(db => {
                  var tx = db.transaction('restaurantReviews', 'readwrite');
                  var keyValStore = tx.objectStore('restaurantReviews');
              
                  keyValStore.get('' + review.restaurant_id)
                    .then(reviewsForRestaurant => {
                      reviewsForRestaurant.push(review);
                      keyValStore.put(reviewsForRestaurant, review.restaurant_id)
                    })
                  return tx.complete;
                })
                })
            }))
            .then(() => {
              db
                .transaction('restaurantReviews')
                .objectStore('restaurantReviews')
                .getAllKeys()
                .then(restaurantId => {
                  dbPromise
                    .then(db => {
                      var tx = db.transaction('restaurantReviews', 'readwrite');
                      var keyValStore = tx.objectStore('restaurantReviews');
                  
                      keyValStore.get('' + restaurantId)
                        .then(reviewsForRestaurant => {
                          reviewsForRestaurant = reviewsForRestaurant.filter(r => !r.isOffline);
                          keyValStore.put(reviewsForRestaurant, restaurantId)
                        })
                      return tx.complete;
                    })
                })
            })
          });
    }));
  }
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  const handleServeImage = (request) => {
    var storageUrl = request.url.replace(/-\d+px\.webp$/, '');
    console.log(storageUrl);
    return caches.open(contentImgsCache)
      .then((cache) => {
        return cache.match(storageUrl)
          .then((response) => {
            if (response) return response;
            return fetch(request)
              .then((networkResponse) => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
              });
          });
      });
  }

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/dist/images/')) {
      event.respondWith(handleServeImage(event.request));
      return;
    }
  }

  const handleRestaurantsQuery = () => {
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

  const handleRestaurantDetailsQuery = (restaurantId) => {
      if(navigator.onLine) {
        event.respondWith(
          fetch(event.request)
          .then(res => {
            let originalResponse = res.clone();
            return res.json()
            .then(restaurantDetails => addRestaurantDetailsToDatabase(restaurantDetails, restaurantId))
            .then(() => {
              return originalResponse
            })
          })
        )
      } else {
        event.respondWith(
          dbPromise.then(db => {
            return db
              .transaction('restaurantDetails')
              .objectStore('restaurantDetails')
              .getAll()
              .then(res => {
                console.log(res);
                let restaurantDetails = res.find(r => r.id === parseInt(restaurantId));

                console.log('returning when offline!!!', restaurantDetails)
                var blob = new Blob([JSON.stringify(restaurantDetails, null, 2)], {type : 'application/json'});
  
                var init = { "status" : 200 , "statusText" : "SuperSmashingGreat!" };
                return new Response(blob, init);
              });
          })
        )
      }
  }

  const handleRestaurantReviewsQuery = (restaurantId) => {
    if(navigator.onLine) {
      event.respondWith(
        fetch(event.request)
        .then(res => {
          let originalResponse = res.clone();
          return res.json()
            .then(reviews => addRestaurantReviewsToDatabase(reviews, restaurantId))
            .then(() => {
              return originalResponse
            })
        })
      )
    } else {
      event.respondWith(
        dbPromise.then(db => {
          return db
            .transaction('restaurantReviews')
            .objectStore('restaurantReviews')
            .getAll()
            .then(reviewsByRestaurant => {
              const reviews = reviewsByRestaurant.reduce((allReviews, reviewsBySingleRestaurant) => allReviews.concat(reviewsBySingleRestaurant), []);
              console.log(reviews);
              let restaurantReviews = reviews
                .filter(r => r.restaurant_id === parseInt(restaurantId));

              console.log('returning when offline!!!', restaurantReviews)
              var blob = new Blob([JSON.stringify(restaurantReviews, null, 2)], {type : 'application/json'});

              var init = { "status" : 200 , "statusText" : "SuperSmashingGreat!" };
              return new Response(blob, init);
            });
        })
      )
    }
}

  const handleQueryRequests = () => {
    console.log(requestUrl.pathname);
    if(requestUrl.pathname === '/restaurants') {
      handleRestaurantsQuery();
    } else if (requestUrl.pathname.match(/restaurants\/\d+/)) {
      const restaurantRegex = /restaurants\/(\d+)/;
      const matches = requestUrl.pathname.match(restaurantRegex);
      const restaurantId = matches[matches.index];

      handleRestaurantDetailsQuery(restaurantId);
    } else if (requestUrl.pathname.match(/reviews\//)) {
      handleRestaurantReviewsQuery(requestUrl.searchParams.get('restaurant_id'));
    } else {
      event.respondWith(
        caches
          .match(event.request)
          .then((response) => response || fetch(event.request))
      );
    }
  }

  const handleCommandRequests = () => {
    if (navigator.onLine) {
      fetch(event.request);
    } else {
      const matches = requestUrl.pathname.match(/reviews/);
      console.log(matches, requestUrl.pathname);
      if (matches) {
        event.request.json()
        .then(res => {
          addOfflineReviewToDatabase(res)
        })
      }
    }
  }

  if(requestUrl.origin === 'http://localhost:1337') {
    event.request.method === "GET"
      ? handleQueryRequests()
      : handleCommandRequests();
  } else {
    event.respondWith(
      caches
      .match(event.request, { ignoreSearch: true })
      .then((response) => response || fetch(event.request))
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

const addRestaurantDetailsToDatabase = (restaurantDetails, restaurantId) => {
  return dbPromise.then(db => {
    var tx = db.transaction('restaurantDetails', 'readwrite');
    var keyValStore = tx.objectStore('restaurantDetails');
    keyValStore.put(restaurantDetails, restaurantId)
    return tx.complete;
  })
}

const addRestaurantReviewsToDatabase = (restaurantReviews, restaurantId) => {
  return dbPromise.then(db => {
    var tx = db.transaction('restaurantReviews', 'readwrite');
    var keyValStore = tx.objectStore('restaurantReviews');
    keyValStore.put(restaurantReviews, restaurantId)
    return tx.complete;
  })
}

const addOfflineReviewToDatabase = (review) => {
  return dbPromise.then(db => {
    var tx = db.transaction('restaurantReviews', 'readwrite');
    var keyValStore = tx.objectStore('restaurantReviews');

    keyValStore.get('' + review.restaurant_id)
      .then(reviewsForRestaurant => {
        console.log(reviewsForRestaurant)
        review.isOffline = true;
        reviewsForRestaurant.push(review);
        keyValStore.put(reviewsForRestaurant, review.restaurant_id)
      })
    return tx.complete;
  })
}
