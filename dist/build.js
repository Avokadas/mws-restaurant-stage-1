(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DbHelper = function () {
  function DbHelper() {
    _classCallCheck(this, DbHelper);
  }

  _createClass(DbHelper, null, [{
    key: 'fetchRestaurants',


    /**
     * Fetch all restaurants.
     */
    value: function fetchRestaurants(callback) {
      fetch(DbHelper.DATABASE_URL).then(function (res) {
        return res.json();
      }).then(function (restaurants) {
        callback(null, restaurants);
      }).catch(function (e) {
        var error = 'Request failed. Returned status of ' + e;
        callback(error, null);
      });
    }

    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: 'fetchRestaurantById',
    value: function fetchRestaurantById(id, callback) {
      // fetch all restaurants with proper error handling.
      fetch(DbHelper.DATABASE_URL + '/' + id).then(function (res) {
        return res.json();
      }).then(function (restaurant) {
        callback(null, restaurant);
      }).catch(function () {
        callback('Restaurant does not exist', null);
      });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisine',
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DbHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByNeighborhood',
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DbHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisineAndNeighborhood',
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DbHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }
          callback(null, results);
        }
      });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */

  }, {
    key: 'fetchNeighborhoods',
    value: function fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DbHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          var neighborhoods = restaurants.map(function (v, i) {
            return restaurants[i].neighborhood;
          });
          // Remove duplicates from neighborhoods
          var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
            return neighborhoods.indexOf(v) == i;
          });
          callback(null, uniqueNeighborhoods);
        }
      });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */

  }, {
    key: 'fetchCuisines',
    value: function fetchCuisines(callback) {
      // Fetch all restaurants
      DbHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          var cuisines = restaurants.map(function (v, i) {
            return restaurants[i].cuisine_type;
          });
          // Remove duplicates from cuisines
          var uniqueCuisines = cuisines.filter(function (v, i) {
            return cuisines.indexOf(v) == i;
          });
          callback(null, uniqueCuisines);
        }
      });
    }

    /**
     * Restaurant page URL.
     */

  }, {
    key: 'urlForRestaurant',
    value: function urlForRestaurant(restaurant) {
      return './restaurant.html?id=' + restaurant.id;
    }

    /**
     * Restaurant image URL.
     */

  }, {
    key: 'imageUrlForRestaurant',
    value: function imageUrlForRestaurant(restaurant) {
      return '/dist/images/' + restaurant.photograph + '.jpg';
    }

    /**
     * Map marker for a restaurant.
     */

  }, {
    key: 'mapMarkerForRestaurant',
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DbHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP });
      return marker;
    }
  }, {
    key: 'DATABASE_URL',


    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    get: function get() {
      var port = 1337; // Change this to your server port
      return 'http://localhost:' + port + '/restaurants';
    }
  }]);

  return DbHelper;
}();

exports.default = DbHelper;

},{}],2:[function(require,module,exports){
'use strict';

var _dbhelper = require('./dbhelper');

var _dbhelper2 = _interopRequireDefault(_dbhelper);

var _lozad = require('lozad');

var _lozad2 = _interopRequireDefault(_lozad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var restaurants = void 0,
    neighborhoods = void 0,
    cuisines = void 0;
var map;

var observer = (0, _lozad2.default)(); // lazy loads elements with default selector as '.lozad'
var loc = {
  lat: 40.722216,
  lng: -73.987501
};
var self = {
  markers: []
};

var registerServiceWorker = function registerServiceWorker() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/build_sw.js').then(function (reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
  });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = function fetchNeighborhoods() {
  _dbhelper2.default.fetchNeighborhoods(function (error, neighborhoods) {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);

    observer.observe();
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = function fetchCuisines() {
  _dbhelper2.default.fetchCuisines(function (error, cuisines) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

  var select = document.getElementById('cuisines-select');

  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = function updateRestaurants() {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;

  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;
  _dbhelper2.default.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(function (m) {
    return m.setMap(null);
  });
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var ul = document.getElementById('restaurants-list');
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });
  observer.observe();
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = function createRestaurantHTML(restaurant) {
  var li = document.createElement('li');

  var image = document.createElement('img');
  image.className = 'restaurant-img lozad';
  image.setAttribute('data-src', _dbhelper2.default.imageUrlForRestaurant(restaurant));
  image.alt = 'Image of a restaurant called ' + restaurant.name;
  li.append(image);

  var name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  var neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  var address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  var more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = _dbhelper2.default.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = function addMarkersToMap() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = _dbhelper2.default.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', function () {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });

  var markers = restaurants.map(function (restaurant) {
    return restaurant.latlng;
  });
  updateMapPicture(markers);
};
var updateMapPicture = function updateMapPicture(markers) {
  console.log(markers);
  var url = 'https://maps.googleapis.com/maps/api/staticmap?\n  center=' + loc.lat + ', ' + loc.lng + '\n  &zoom=12\n  &size=2400x2400\n  &maptype=roadmap\n  ' + (markers ? markers.map(function (marker) {
    return '&markers=color:red%7C' + marker.lat + ',' + marker.lng;
  }).join('') : '') + '\n  &key=AIzaSyAXlOTPzwGrGLlSNT9IpeYO9oTzeFPZ7a0';

  var img = document.createElement('img');
  img.src = url;
  img.style['height'] = '100%';
  img.style['width'] = '100%';
  img.style['object-fit'] = 'cover';

  var map = document.querySelector('#map');
  map.innerHTML = '';
  map.appendChild(img);
};
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {

  // self.map = new google.maps.Map(document.getElementById('map'), {
  //   zoom: 12,
  //   center: loc,
  //   scrollwheel: false
  // });

  updateMapPicture();

  updateRestaurants();
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function (event) {
  window.updateRestaurants = updateRestaurants;
  registerServiceWorker();
  fetchNeighborhoods();
  fetchCuisines();

  observer.observe();
});

},{"./dbhelper":1,"lozad":3}],3:[function(require,module,exports){
/*! lozad.js - v1.4.0 - 2018-04-22
* https://github.com/ApoorvSaxena/lozad.js
* Copyright (c) 2018 Apoorv Saxena; Licensed MIT */


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.lozad = factory());
}(this, (function () { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Detect IE browser
 * @const {boolean}
 * @private
 */
var isIE = document.documentMode;

var defaultConfig = {
  rootMargin: '0px',
  threshold: 0,
  load: function load(element) {
    if (element.nodeName.toLowerCase() === 'picture') {
      var img = document.createElement('img');
      if (isIE && element.getAttribute('data-iesrc')) {
        img.src = element.getAttribute('data-iesrc');
      }
      element.appendChild(img);
    }
    if (element.getAttribute('data-src')) {
      element.src = element.getAttribute('data-src');
    }
    if (element.getAttribute('data-srcset')) {
      element.srcset = element.getAttribute('data-srcset');
    }
    if (element.getAttribute('data-background-image')) {
      element.style.backgroundImage = 'url(\'' + element.getAttribute('data-background-image') + '\')';
    }
  },
  loaded: function loaded() {}
};

function markAsLoaded(element) {
  element.setAttribute('data-loaded', true);
}

var isLoaded = function isLoaded(element) {
  return element.getAttribute('data-loaded') === 'true';
};

var onIntersection = function onIntersection(load, loaded) {
  return function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);

        if (!isLoaded(entry.target)) {
          load(entry.target);
          markAsLoaded(entry.target);
          loaded(entry.target);
        }
      }
    });
  };
};

var getElements = function getElements(selector) {
  if (selector instanceof Element) {
    return [selector];
  }
  if (selector instanceof NodeList) {
    return selector;
  }
  return document.querySelectorAll(selector);
};

var lozad = function () {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.lozad';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _defaultConfig$option = _extends({}, defaultConfig, options),
      rootMargin = _defaultConfig$option.rootMargin,
      threshold = _defaultConfig$option.threshold,
      load = _defaultConfig$option.load,
      loaded = _defaultConfig$option.loaded;

  var observer = void 0;

  if (window.IntersectionObserver) {
    observer = new IntersectionObserver(onIntersection(load, loaded), {
      rootMargin: rootMargin,
      threshold: threshold
    });
  }

  return {
    observe: function observe() {
      var elements = getElements(selector);

      for (var i = 0; i < elements.length; i++) {
        if (isLoaded(elements[i])) {
          continue;
        }
        if (observer) {
          observer.observe(elements[i]);
          continue;
        }
        load(elements[i]);
        markAsLoaded(elements[i]);
        loaded(elements[i]);
      }
    },
    triggerLoad: function triggerLoad(element) {
      if (isLoaded(element)) {
        return;
      }

      load(element);
      markAsLoaded(element);
      loaded(element);
    }
  };
};

return lozad;

})));

},{}]},{},[2])

//# sourceMappingURL=build.js.map
