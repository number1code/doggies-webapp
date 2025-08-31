# Dog Breed Explorer

A dynamic and interactive web application for exploring various dog breeds, built with modern front-end technologies. This project showcases the use of multiple public APIs, asynchronous JavaScript for data fetching, and dynamic DOM manipulation to create a seamless user experience.

---

### ✨ Features

*   **Dynamic Breed Dropdown:** On page load, the application fetches a complete list of all dog breeds from the Dog CEO API and populates a searchable dropdown menu.
*   **Image Gallery:** Selecting a breed makes a new API call to fetch a 3x3 grid of high-quality images for that specific breed.
*   **Audio Pronunciation:** Clicking on any dog image in the gallery triggers an API call to a dictionary service to play an audio clip of the breed's name being pronounced.
*   **Favorites System:** Users can "favorite" any dog image. These favorites are saved to the browser's `localStorage`, persisting even after the page is closed.
*   **Animated Background:** A subtle, ambient background animation using Anime.js showcases random dog images on the initial load screen.

### 🛠️ Technologies Used

*   **HTML5**
*   **CSS3** (with CSS Grid for responsive layouts)
*   **JavaScript (ES6+)**
    *   Async/Await and Promises for handling API calls
    *   `localStorage` for state management (Favorites)
    *   Dynamic DOM manipulation
*   **Anime.js:** For the background animations.
*   **APIs:**
    *   [Dog CEO API](https://dog.ceo/dog-api/): For all breed data and images.
    *   [Free Dictionary API](https://dictionaryapi.dev/): For audio pronunciations.

### 🚀 How to Run Locally

1.  Clone this repository to your local machine.
2.  Open the `index.html` (or your main HTML file) in any modern web browser.
3.  No special build steps or installations are required.
