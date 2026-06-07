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
    loadRecommendations();
});

// Setup recommendation filters
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Filter recommendations
            filterRecommendations(btn.dataset.filter);
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
            searchRecommendations(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchRecommendations(query);
            }
        }
    });
}

// Load user's recommendations
async function loadRecommendations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/recommendations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load recommendations');
        }

        const recommendations = await response.json();
        displayRecommendations(recommendations);
        updateStats(recommendations);
    } catch (error) {
        showNotification('Error loading recommendations', 'error');
    }
}

// Display recommendations in the grid
function displayRecommendations(recommendations) {
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-magic"></i>
                <h2>No Recommendations Yet</h2>
                <p>Rate more movies to get personalized recommendations</p>
                <button class="rate-btn">Rate Movies</button>
            </div>
        `;
        return;
    }

    recommendationsGrid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="match-score">${rec.matchScore}% Match</div>
            <div class="recommendation-poster">
                <img src="${rec.movie.poster}" alt="${rec.movie.title}">
            </div>
            <div class="recommendation-info">
                <div class="recommendation-header">
                    <h3 class="recommendation-title">${rec.movie.title}</h3>
                    <div class="recommendation-score">
                        <i class="fas fa-star"></i>
                        <span>${rec.movie.rating}/10</span>
                    </div>
                </div>
                <div class="recommendation-meta">
                    <span>${rec.movie.year}</span>
                    <span>${rec.movie.genre}</span>
                </div>
                <div class="recommendation-actions">
                    <button class="recommendation-btn watch-btn" onclick="addToWatchlist(${rec.movie.id})">
                        <i class="fas fa-plus"></i> Watchlist
                    </button>
                    <button class="recommendation-btn watchlist-btn" onclick="rateMovie(${rec.movie.id})">
                        <i class="fas fa-star"></i> Rate
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats(recommendations) {
    const totalRecommendations = recommendations.length;
    const averageMatchScore = recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / totalRecommendations;
    const similarUsers = recommendations[0]?.similarUsers || 0;

    document.querySelector('.recommendation-score .stat-value').textContent = `${averageMatchScore.toFixed(1)}%`;
    document.querySelector('.movies-matched .stat-value').textContent = totalRecommendations;
    document.querySelector('.similar-users .stat-value').textContent = similarUsers;
}

// Filter recommendations
function filterRecommendations(filter) {
    const recommendations = document.querySelectorAll('.recommendation-item');
    recommendations.forEach(rec => {
        switch (filter) {
            case 'based-on-ratings':
                // Filter by rating-based recommendations
                const matchScore = parseInt(rec.querySelector('.match-score').textContent);
                rec.style.display = matchScore >= 80 ? 'block' : 'none';
                break;
            case 'similar-users':
                // Filter by similar users recommendations
                const source = rec.dataset.source;
                rec.style.display = source === 'similar-users' ? 'block' : 'none';
                break;
            case 'trending':
                // Filter by trending recommendations
                const trending = rec.dataset.trending === 'true';
                rec.style.display = trending ? 'block' : 'none';
                break;
            default:
                rec.style.display = 'block';
        }
    });
}

// Search recommendations
async function searchRecommendations(query) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/recommendations/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displayRecommendations(results);
    } catch (error) {
        showNotification('Error searching recommendations', 'error');
    }
}

// Add movie to watchlist
async function addToWatchlist(movieId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movieId })
        });

        if (!response.ok) {
            throw new Error('Failed to add to watchlist');
        }

        showNotification('Added to watchlist', 'success');
    } catch (error) {
        showNotification('Error adding to watchlist', 'error');
    }
}

// Rate movie
async function rateMovie(movieId) {
    try {
        const score = prompt('Enter your rating (1-10):');
        if (!score || isNaN(score) || score < 1 || score > 10) {
            showNotification('Invalid rating', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch('/api/ratings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movieId, score: parseFloat(score) })
        });

        if (!response.ok) {
            throw new Error('Failed to rate movie');
        }

        showNotification('Rating submitted successfully', 'success');
        loadRecommendations(); // Refresh recommendations
    } catch (error) {
        showNotification('Error rating movie', 'error');
    }
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