import DbHelper from './dbhelper';
import lozad from 'lozad';

let restaurants,
  neighborhoods,
  cuisines
var map

const observer = lozad(); // lazy loads elements with default selector as '.lozad'
let loc = {
  lat: 40.722216,
  lng: -73.987501
};
let self = {
  markers: []
};

const registerServiceWorker = () => {
  if(!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/build_sw.js').then(function(reg) {
    if (!navigator.serviceWorker.controller) {
        return;
    }
  });
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DbHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);

    observer.observe();
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DbHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}


/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  DbHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  
  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  observer.observe();
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const image = document.createElement('img');
  image.className = 'restaurant-img lozad';
  image.setAttribute('data-src', DbHelper.imageUrlForRestaurant(restaurant));
  image.alt = `Image of a restaurant called ${restaurant.name}`;
  li.append(image);
  
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DbHelper.urlForRestaurant(restaurant);
  li.append(more)
  
  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DbHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });

  const markers = restaurants.map(restaurant => restaurant.latlng)
  updateMapPicture(markers)
}
const updateMapPicture = (markers) => {
  const url = `https://maps.googleapis.com/maps/api/staticmap?
  center=${loc.lat}, ${loc.lng}
  &zoom=12
  &size=2400x2400
  &maptype=roadmap
  ${markers ? markers.map(marker => `&markers=color:red%7C${marker.lat},${marker.lng}`).join('') : ''}
  &key=AIzaSyAXlOTPzwGrGLlSNT9IpeYO9oTzeFPZ7a0`

  let img = document.createElement('img');
  img.src = url
  img.style['height']='100%'
  img.style['width']='100%'
  img.style['object-fit']='cover'

  const map = document.querySelector('#map')
  map.innerHTML = ''
  map.appendChild(img)
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  
  // self.map = new google.maps.Map(document.getElementById('map'), {
  //   zoom: 12,
  //   center: loc,
  //   scrollwheel: false
  // });
  setTimeout(() => {
    updateMapPicture();
  
    updateRestaurants();
  }, 0);
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  window.updateRestaurants = updateRestaurants;
  registerServiceWorker();
  fetchNeighborhoods();
  fetchCuisines();
  
  observer.observe();
});