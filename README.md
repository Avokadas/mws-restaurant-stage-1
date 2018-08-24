# Mobile Web Specialist Certification Course

#### _Course Material Project - Restaurant Reviews_

## Final project:

node version: 10.4

To Start the project:
1. Fire up MWS restaurant back-end server
2. `npm i`
3. `gulp`

Application should open up in the browser automatically.

## Notes:

### Service Worker

I've got my project rejected, because the offline mode does not work. I cannot reproduce this behavior because in my case it works.

Please, review the steps I'm using to achieve successful offline review save. 
If any of them should behave any different, please let me know and I will adjust how the app works.
Thank you, you're great! Reviews really helped me push this project forward and get better.

Example with saving an offline review:
1. Start the project with `gulp`.
2. Open up a latest chrome incognito new tab, enter `localhost:3000`.
3. Open up devtools - application section. Inspect state:
  - Service worker #0 is activated and running
  - IndexedDB has 3 tables: `restaurantReviews`, `restaurants` & `restaurantDetails`. All of them are empty.
      That's expected because service worker installs the first time page loads.
  - Cache storage has `mws-restaurant-static-v1` table with basic page resources `.html`, `.js` & `.css` files for main page and details page.
  - Turning off network at this point should return page skeletons but no data since none has loaded yet.
4. Open up any restaurant, e.g. `HOMETOWN BBQ`
  - IndexedDB `details` and `reviews` boards should have populated with specified restaurant's data.
  - `mws-restaurant-imgs-v1` cache storage table should have appeared with the respective image in cache.
5. Turn off the network for the page.
6. Scroll to the review form and enter data into the fields. Press `Submit Review`.
7. A new review should have appeared on the list with specified data.
  - Check IndexedDB `reviews` table - respective restaurant's review list should have expanded by 1 review.
  - the created review has the `isOffline` property set to `true`.
8. Turn network for the tab back on and refresh the page.
  - The same review created in 6th step is visible on the screen.
  - If it's inspected in the IndexedDB `reviews` table - `isOffline` property is gone.
  - Page can be refreshed as many times as needed - the review persists.


### Tab Indexes
Tab indexes are not used on landmarks as mentioned by one of the reviewers. Article Below:
https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex#Accessibility_concerns

