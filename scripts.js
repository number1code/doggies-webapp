// ==========================================================================
        // 1. APPLICATION SETUP & STATE MANAGEMENT
        // "Full-stack" thinking starts here. We define our state and get references
        // to the DOM elements we'll be manipulating (our "Views").
        // ==========================================================================
        document.addEventListener('DOMContentLoaded', () => {

            // --- DOM Element References ---
            const breedSelect = document.getElementById('breed-select');
            const galleryContainer = document.getElementById('gallery-container');
            const galleryTitle = document.getElementById('gallery-title');
            const imageGrid = document.getElementById('image-grid');
            const favoritesGrid = document.getElementById('favorites-grid');
            const backgroundContainer = document.getElementById('background-animation-container');
            
            // --- Application State ---
            // We load our favorites from localStorage. This is our "database".
            // If nothing is there, we start with an empty array.
            let favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];

            // ==========================================================================
            // 2. API LAYER
            // These functions are like our backend. Their only job is to communicate
            // with external services and return clean data. They don't touch the DOM.
            // ==========================================================================

            async function fetchAllBreeds() {
                try {
                    const response = await fetch('https://dog.ceo/api/breeds/list/all');
                    if (!response.ok) throw new Error('Network response was not ok.');
                    const data = await response.json();
                    
                    // The API returns a complex object. We need to "wrangle" it into a
                    // simple, flat array of breed names. This is a crucial skill.
                    const breeds = [];
                    for (const breed in data.message) {
                        if (data.message[breed].length === 0) {
                            breeds.push(breed);
                        } else {
                            // This handles sub-breeds (e.g., "bulldog/boston")
                            for (const subBreed of data.message[breed]) {
                                breeds.push(`${breed}/${subBreed}`);
                            }
                        }
                    }
                    return breeds;
                } catch (error) {
                    console.error("Failed to fetch breeds:", error);
                    return []; // Return an empty array on failure
                }
            }

            async function fetchBreedImages(breed, count = 9) {
                try {
                    const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/${count}`);
                    if (!response.ok) throw new Error('Network response was not ok.');
                    const data = await response.json();
                    return data.message; // Returns an array of image URLs
                } catch (error) {
                    console.error(`Failed to fetch images for ${breed}:`, error);
                    return [];
                }
            }

            async function fetchPronunciation(word) {
                try {
                    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                    if (!response.ok) return null; // Word not found is not a critical error
                    const data = await response.json();
                    
                    // The API response is complex. We must safely search for the audio URL.
                    // This is peak data wrangling!
                    if (data[0] && data[0].phonetics) {
                        for (const phonetic of data[0].phonetics) {
                            if (phonetic.audio) {
                                return phonetic.audio; // Return the first audio URL we find
                            }
                        }
                    }
                    return null; // No audio found
                } catch (error) {
                    console.error(`Failed to fetch pronunciation for ${word}:`, error);
                    return null;
                }
            }
            
            // ==========================================================================
            // 3. VIEW / RENDERING LAYER
            // These functions are responsible for taking data and drawing it to the
            // screen. They are the "frontend" part of our logic.
            // ==========================================================================
            
            function populateBreedDropdown(breeds) {
                breedSelect.innerHTML = '<option value="">Select a breed...</option>'; // Clear loading text
                breeds.forEach(breed => {
                    const option = document.createElement('option');
                    option.value = breed;
                    // Capitalize the first letter for better display
                    option.textContent = breed.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                    breedSelect.appendChild(option);
                });
            }

            function displayImages(imageUrls, gridElement, breedName = '') {
                gridElement.innerHTML = ''; // Clear previous images
                imageUrls.forEach(url => {
                    const card = document.createElement('div');
                    card.className = 'image-card';
                    card.innerHTML = `
                        <img src="${url}" alt="A cute dog">
                        <div class="overlay">
                            <button class="fav-button" title="Favorite">♥</button>
                        </div>
                    `;
                    gridElement.appendChild(card);
                    
                    // --- CONTROLLER LOGIC: Attach event handlers here ---
                    card.querySelector('.fav-button').addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent click from triggering pronunciation
                        toggleFavorite(url);
                    });
                    
                    card.addEventListener('click', () => {
                        // Use the breed name associated with the gallery, or parse from URL for favorites
                        const nameToPronounce = breedName || getBreedFromUrl(url);
                        playPronunciation(nameToPronounce.split('/')[0]); // Only use the main breed name
                    });
                });
            }

            function displayFavorites() {
                if (favorites.length === 0) {
                    favoritesGrid.innerHTML = '<p>You have no favorite dogs yet!</p>';
                } else {
                    displayImages(favorites, favoritesGrid);
                }
            }

            // ==========================================================================
            // 4. CONTROLLER / HANDLER LAYER
            // These functions react to user input and orchestrate the app's logic.
            // They connect the API layer to the View layer.
            // ==========================================================================

            async function handleBreedSelect(event) {
                const selectedBreed = event.target.value;

                // If the user selects the default "--Select--" option...
                if (!selectedBreed) {
                    // Hide the gallery view.
                    galleryContainer.style.display = 'none';
                    // AND explicitly show the background animation view again.
                    backgroundContainer.style.display = 'block'; 
                    return;
                }
                
                // If a valid breed is selected...
                // Hide the background animation view.
                backgroundContainer.style.display = 'none';
                // AND explicitly show the gallery view.
                galleryContainer.style.display = 'block';
                
                galleryTitle.textContent = `Showing images for: ${selectedBreed.replace('/', ' ')}`;
                imageGrid.innerHTML = '<p>Fetching doggos...</p>';
                
                const imageUrls = await fetchBreedImages(selectedBreed);
                displayImages(imageUrls, imageGrid, selectedBreed);
            }
            
            async function playPronunciation(breedName) {
                const audioUrl = await fetchPronunciation(breedName);
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.play();
                } else {
                    alert(`Sorry, no pronunciation found for "${breedName}".`);
                }
            }
            
            function toggleFavorite(imageUrl) {
                const index = favorites.indexOf(imageUrl);
                if (index > -1) {
                    favorites.splice(index, 1); // Remove if it exists
                } else {
                    favorites.push(imageUrl); // Add if it doesn't
                }
                // Persist the change to our "database" (localStorage)
                localStorage.setItem('dogFavorites', JSON.stringify(favorites));
                // Re-render the favorites view
                displayFavorites();
            }

            // ==========================================================================
            // 5. ANIMATIONS & UTILITIES
            // ==========================================================================

            async function startBackgroundAnimation() {
                const randomImages = await fetchBreedImages('retriever/golden', 10);
                randomImages.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'bg-dog-image';
                    backgroundContainer.appendChild(img);

                    // Animate each image with Anime.js
                    anime({
                        targets: img,
                        translateX: () => anime.random(0, window.innerWidth - 150),
                        translateY: () => anime.random(0, window.innerHeight - 150),
                        scale: [0, () => anime.random(0.2, 0.6)],
                        rotate: () => anime.random(-30, 30),
                        opacity: [0, 0.5, 0],
                        duration: () => anime.random(10000, 20000),
                        easing: 'easeInOutSine',
                        loop: true,
                        direction: 'alternate',
                    });
                });
            }
            
            // Helper function to extract breed name from URL for favorites
            function getBreedFromUrl(url) {
                const parts = url.split('/');
                return parts[parts.length - 2];
            }


            // ==========================================================================
            // 6. INITIALIZATION (The "Main" function)
            // This is the entry point of our application. It orchestrates the
            // initial setup and API calls.
            // ==========================================================================
            
            async function init() {
                // Kick off multiple independent tasks at once
                startBackgroundAnimation();
                displayFavorites(); // Render favorites from localStorage on load

                const breeds = await fetchAllBreeds();
                populateBreedDropdown(breeds);
                
                // Set up the main event listener after everything is loaded
                breedSelect.addEventListener('change', handleBreedSelect);
            }

            // Run the application!
            init();
        });