!function i(u,o,l){function c(t,e){if(!o[t]){if(!u[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(s)return s(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var a=o[t]={exports:{}};u[t][0].call(a.exports,function(e){return c(u[t][1][e]||e)},a,a.exports,i,u,o,l)}return o[t].exports}for(var s="function"==typeof require&&require,e=0;e<l.length;e++)c(l[e]);return c}({1:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();var a=function(){function u(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,u)}return r(u,null,[{key:"fetchRestaurants",value:function(t){fetch(u.DATABASE_URL+"/restaurants").then(function(e){return e.json()}).then(function(e){t(null,e)}).catch(function(e){t("Request failed. Returned status of "+e,null)})}},{key:"fetchRestaurantById",value:function(e,n){fetch(u.DATABASE_URL+"/restaurants/"+e).then(function(e){return e.json()}).then(function(t){fetch(u.DATABASE_URL+"/reviews/?restaurant_id="+e).then(function(e){return e.json()}).then(function(e){console.log(e),t.reviews=e,n(null,t)})}).catch(function(){n("Restaurant does not exist",null)})}},{key:"fetchRestaurantByCuisine",value:function(r,a){u.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});a(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,a){u.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});a(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,a,i){u.fetchRestaurants(function(e,t){if(e)i(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=a&&(n=n.filter(function(e){return e.neighborhood==a})),i(null,n)}})}},{key:"fetchNeighborhoods",value:function(a){u.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});a(null,t)}})}},{key:"fetchCuisines",value:function(a){u.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});a(null,t)}})}},{key:"setRestaurantFavoriteIndicator",value:function(e,t){return fetch(u.DATABASE_URL+"/restaurants/"+e+"/?is_favorite="+t,{method:"PUT"}).then(function(e){return console.log(e),e.json()}).then(function(e){console.log(e,"<- favorited")}).catch(function(){callback("Restaurant does not exist",null)})}},{key:"postReviewOnRestaurant",value:function(e,t){return fetch(u.DATABASE_URL+"/reviews",{method:"POST",body:JSON.stringify(e)}).then(function(e){return console.log(e),e.json()}).then(function(e){console.log(e,"<- posted")}).catch(function(){t("Review failed to save",null)})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){return"/dist/images/"+e.photograph+".webp"}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:u.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337"}}]),u}();n.default=a},{}],2:[function(e,t,n){"use strict";var r,a=e("./dbhelper"),d=(r=a)&&r.__esModule?r:{default:r};var i=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant;document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;var t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=d.default.imageUrlForRestaurant(e),t.alt="Image of a restaurant called "+e.name,document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&u();var n=document.querySelector(".switch input");n.checked="true"===e.is_favorite,n.addEventListener("change",function(){d.default.setRestaurantFavoriteIndicator(e.id,"false"===e.is_favorite?"true":"false")}),o()},u=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);var i=document.createElement("td");i.innerHTML=e[n],r.appendChild(i),t.appendChild(r)}},o=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.reviews,t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),e){var r=document.getElementById("reviews-list");e.forEach(function(e){r.appendChild(f(e))}),t.appendChild(r)}else{var a=document.createElement("p");a.innerHTML="No reviews yet!",t.appendChild(a)}var i=document.createElement("form");i.classList.add("reviews--form");var u=document.createElement("h2");u.textContent="Write a review:";var o=document.createElement("input");o.type="text",o.placeholder="Reviewer name";var l=document.createElement("input");l.type="text",l.placeholder="Restaurant rating 1-5";var c=document.createElement("textarea");c.placeholder="Comments";var s=document.createElement("button");s.textContent="Submit Review",s.addEventListener("click",function(e){e.preventDefault(),d.default.postReviewOnRestaurant({restaurant_id:self.restaurant.id,name:o.value,rating:l.value,comment:c.value})}),i.appendChild(u),i.appendChild(o),i.appendChild(l),i.appendChild(c),i.appendChild(s),t.appendChild(i)},f=function(e){var t=document.createElement("li"),n=document.createElement("div");n.classList.add("review__review-information");var r=document.createElement("p");r.classList.add("review__reviewer-name"),r.innerHTML=e.name,n.appendChild(r);var a=document.createElement("p");r.classList.add("review__review-date"),a.innerHTML=e.date,n.appendChild(a);var i=document.createElement("p");i.innerHTML="Rating: "+e.rating,i.classList.add("review__review-rating"),n.appendChild(i);var u=document.createElement("p");return u.classList.add("review__review-comment"),u.innerHTML=e.comments,t.appendChild(n),t.appendChild(u),t},l=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null};window.initMap=function(){!function(n){if(self.restaurant)n(null,self.restaurant);else{var e=l("id");e?d.default.fetchRestaurantById(e,function(e,t){console.log(t),(self.restaurant=t)?(i(),n(null,t)):console.error(e)}):(error="No restaurant id in URL",n(error,null))}}(function(e,t){e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}(),d.default.mapMarkerForRestaurant(self.restaurant,self.map))})}},{"./dbhelper":1}]},{},[2]);
//# sourceMappingURL=build_restaurant.js.map