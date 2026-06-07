document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // Verify token
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decodedToken);
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
            console.log('Token expired');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
        
        // Update admin indicator based on user type
        const adminIndicator = document.querySelector('.admin-indicator');
        if (decodedToken.type === 'admin') {
            adminIndicator.style.display = 'flex';
        } else {
            adminIndicator.style.display = 'none';
        }
    } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });

    // Genre card click handlers
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            const genre = card.querySelector('h3').textContent;
            filterMoviesByGenre(genre);
        });
    });

    // Feature button click handlers
    const featureBtns = document.querySelectorAll('.feature-btn');
    featureBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const feature = btn.parentElement.querySelector('h3').textContent;
            handleFeatureClick(feature);
        });
    });

    // Load recently watched movies
    loadRecentlyWatched();
});

// Search movies function
async function searchMovies(query) {
    try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const movies = await response.json();
            displaySearchResults(movies);
        } else {
            showError('Failed to search movies');
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        showError('An error occurred while searching');
    }
}

// Filter movies by genre
async function filterMoviesByGenre(genre) {
    try {
        const response = await fetch(`/api/movies/genre/${encodeURIComponent(genre)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const movies = await response.json();
            displayGenreResults(movies);
        } else {
            showError('Failed to filter movies');
        }
    } catch (error) {
        console.error('Error filtering movies:', error);
        showError('An error occurred while filtering');
    }
}

// Handle feature button clicks
function handleFeatureClick(feature) {
    switch (feature) {
        case 'Your Ratings':
            window.location.href = 'ratings.html';
            break;
        case 'Watchlist':
            window.location.href = 'watchlist.html';
            break;
        case 'Recommendations':
            window.location.href = 'recommendations.html';
            break;
    }
}

// Load recently watched movies
async function loadRecentlyWatched() {
    try {
        const response = await fetch('/api/movies/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const movies = await response.json();
            displayRecentlyWatched(movies);
        } else {
            showError('Failed to load recently watched movies');
        }
    } catch (error) {
        console.error('Error loading recently watched movies:', error);
        showError('An error occurred while loading movies');
    }
}

// Display search results
function displaySearchResults(movies) {
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

// Display genre results
function displayGenreResults(movies) {
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

// Display recently watched movies
function displayRecentlyWatched(movies) {
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>${movie.year}</p>
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                <span>${movie.rating}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
} 