import DbHelper from './dbhelper'

let restaurant;
var map;

if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/build_sw.js')
  .then(function(reg) {
    if (!navigator.serviceWorker.controller) {
        return;
    }
  });

  navigator.serviceWorker.ready
    .then(() => {
      if (!navigator.serviceWorker.controller || !navigator.onLine) {
          return;
      }
      navigator.serviceWorker.controller.postMessage('sync');
    });
  
  };
  
/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DbHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DbHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image of a restaurant called ${restaurant.name}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;


  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  const checkbox = document.querySelector('.switch input');

  checkbox.checked = restaurant.is_favorite === 'true';

  checkbox.addEventListener("change", () => {
    DbHelper
      .setRestaurantFavoriteIndicator(
        restaurant.id, 
        restaurant.is_favorite === 'false' 
          ? 'true'
          : 'false'
      )
      .then(savedRestaurant => {
        restaurant.is_favorite = savedRestaurant.is_favorite;
      })
  })

  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
  } else {
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  const reviewForm = document.createElement('form');
  reviewForm.classList.add('reviews--form')
  reviewForm.setAttribute('role', 'form');

  const reviewFormHeader = document.createElement('h3');
  reviewFormHeader.textContent = 'Write a review:';

  const restaurantNameInput = document.createElement('input');
  restaurantNameInput.type = 'text';
  restaurantNameInput.placeholder = 'Name';
  const restaurantNameInputLabel = document.createElement('label');
  restaurantNameInputLabel.textContent = 'Reviewer name:';
  restaurantNameInputLabel.appendChild(restaurantNameInput);
  restaurantNameInputLabel.classList.add('review--label');

  const restaurantRatingInput = document.createElement('input');
  restaurantRatingInput.type = 'text';
  restaurantRatingInput.placeholder = 'Rating';
  const restaurantRatingInputLabel = document.createElement('label');
  restaurantRatingInputLabel.textContent = 'Restaurant rating 1-5:';
  restaurantRatingInputLabel.appendChild(restaurantRatingInput);
  restaurantRatingInputLabel.classList.add('review--label');

  const restaurantCommentTextArea = document.createElement('textarea');
  restaurantCommentTextArea.placeholder = 'Comments';
  const restaurantCommentTextAreaLabel = document.createElement('label');
  restaurantCommentTextAreaLabel.textContent = 'Comments:';
  restaurantCommentTextAreaLabel.appendChild(restaurantCommentTextArea);
  restaurantCommentTextAreaLabel.classList.add('review--label');

  const reviewFormSubmitButton = document.createElement('button');
  reviewFormSubmitButton.textContent = 'Submit Review';
  reviewFormSubmitButton.setAttribute('aria-label', 'Submit')
  reviewFormSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();

    DbHelper
      .postReviewOnRestaurant({
        restaurant_id: self.restaurant.id,
        name: restaurantNameInput.value,
        rating: restaurantRatingInput.value,
        comments: restaurantCommentTextArea.value
      })
      .then(review => {
        const ul = document.getElementById('reviews-list');
        ul.appendChild(createReviewHTML(review));
      });


  })

  reviewForm.appendChild(reviewFormHeader);
  reviewForm.appendChild(restaurantNameInputLabel);
  reviewForm.appendChild(restaurantRatingInputLabel);
  reviewForm.appendChild(restaurantCommentTextAreaLabel);
  reviewForm.appendChild(reviewFormSubmitButton);

  container.appendChild(reviewForm);

}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const reviewInformationContainer = document.createElement('div');
  reviewInformationContainer.classList.add('review__review-information');

  const name = document.createElement('p');
  name.classList.add('review__reviewer-name');
  name.innerHTML = review.name;
  reviewInformationContainer.appendChild(name);


  const date = document.createElement('p');
  name.classList.add('review__review-date');
  date.innerHTML = new Date(review.createdAt).toDateString();
  reviewInformationContainer.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.classList.add('review__review-rating');
  reviewInformationContainer.appendChild(rating);

  const comments = document.createElement('p');
  comments.classList.add('review__review-comment');
  comments.innerHTML = review.comments;

  li.appendChild(reviewInformationContainer);
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DbHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}
