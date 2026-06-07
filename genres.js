// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize page
    setupFilters();
    setupSearch();
    setupGenreCards();
});

// Setup genre filters
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Filter genres
            filterGenres(btn.dataset.filter);
        });
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchGenres(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchGenres(query);
            }
        }
    });
}

// Setup genre cards
function setupGenreCards() {
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        const genreName = card.querySelector('h3').textContent;
        const browseBtn = card.querySelector('.browse-btn');
        
        browseBtn.addEventListener('click', () => {
            browseGenre(genreName);
        });
    });
}

// Filter genres
function filterGenres(filter) {
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        switch (filter) {
            case 'popular':
                // Show only popular genres (you can add a data attribute for popularity)
                const isPopular = card.dataset.popular === 'true';
                card.style.display = isPopular ? 'block' : 'none';
                break;
            case 'new':
                // Show only new genres (you can add a data attribute for new releases)
                const isNew = card.dataset.new === 'true';
                card.style.display = isNew ? 'block' : 'none';
                break;
            default:
                card.style.display = 'block';
        }
    });
}

// Search genres
async function searchGenres(query) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/genres/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displayGenres(results);
    } catch (error) {
        showNotification('Error searching genres', 'error');
    }
}

// Browse genre
async function browseGenre(genreName) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/genres/${encodeURIComponent(genreName)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load genre');
        }

        const movies = await response.json();
        // Store the movies in localStorage to display on the movies page
        localStorage.setItem('genreMovies', JSON.stringify(movies));
        // Redirect to movies page
        window.location.href = 'movies.html';
    } catch (error) {
        showNotification('Error loading genre', 'error');
    }
}

// Display genres
function displayGenres(genres) {
    const genresGrid = document.querySelector('.genres-grid');
    genresGrid.innerHTML = genres.map(genre => `
        <div class="genre-card">
            <div class="genre-image">
                <img src="${genre.image}" alt="${genre.name}">
            </div>
            <div class="genre-info">
                <h3>${genre.name}</h3>
                <p>${genre.description}</p>
                <button class="browse-btn">Browse ${genre.name}</button>
            </div>
        </div>
    `).join('');

    // Re-setup genre cards after updating the grid
    setupGenreCards();
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
} 