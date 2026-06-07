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
    loadWatchlist();
});

// Setup watchlist filters
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Filter watchlist
            filterWatchlist(btn.dataset.filter);
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
            searchWatchlist(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchWatchlist(query);
            }
        }
    });
}

// Load user's watchlist
async function loadWatchlist() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/watchlist', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load watchlist');
        }

        const watchlist = await response.json();
        displayWatchlist(watchlist);
        updateStats(watchlist);
    } catch (error) {
        showNotification('Error loading watchlist', 'error');
    }
}

// Display watchlist items
function displayWatchlist(watchlist) {
    const watchlistGrid = document.querySelector('.watchlist-grid');
    
    if (watchlist.length === 0) {
        watchlistGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h2>Your Watchlist is Empty</h2>
                <p>Start adding movies and TV shows to your watchlist</p>
                <button class="browse-btn">Browse Movies</button>
            </div>
        `;
        return;
    }

    watchlistGrid.innerHTML = watchlist.map(item => `
        <div class="watchlist-item">
            <div class="status-badge ${getStatusClass(item.status)}">${item.status}</div>
            <div class="watchlist-poster">
                <img src="${item.movie.poster}" alt="${item.movie.title}">
            </div>
            <div class="watchlist-info">
                <div class="watchlist-header">
                    <h3 class="watchlist-title">${item.movie.title}</h3>
                    <div class="watchlist-rating">
                        <i class="fas fa-star"></i>
                        <span>${item.movie.rating}/10</span>
                    </div>
                </div>
                <div class="watchlist-meta">
                    <span>${item.movie.year}</span>
                    <span>${item.movie.genre}</span>
                </div>
                <div class="watchlist-actions">
                    <button class="watchlist-btn watch-btn" onclick="markAsWatched(${item.id})">
                        <i class="fas fa-check"></i> Watched
                    </button>
                    <button class="watchlist-btn remove-btn" onclick="removeFromWatchlist(${item.id})">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get status class for badge
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'upcoming':
            return 'status-upcoming';
        case 'watching':
            return 'status-watching';
        case 'watched':
            return 'status-watched';
        default:
            return '';
    }
}

// Update statistics
function updateStats(watchlist) {
    const totalItems = watchlist.length;
    const upcomingItems = watchlist.filter(item => item.status === 'upcoming').length;
    const watchTime = calculateWatchTime(watchlist);

    document.querySelector('.total-items .stat-value').textContent = totalItems;
    document.querySelector('.upcoming .stat-value').textContent = upcomingItems;
    document.querySelector('.watch-time .stat-value').textContent = watchTime;
}

// Calculate total watch time
function calculateWatchTime(watchlist) {
    const totalMinutes = watchlist.reduce((sum, item) => sum + (item.movie.runtime || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h`;
}

// Filter watchlist
function filterWatchlist(filter) {
    const watchlistItems = document.querySelectorAll('.watchlist-item');
    watchlistItems.forEach(item => {
        switch (filter) {
            case 'movies':
                const type = item.querySelector('.watchlist-meta span:last-child').textContent;
                item.style.display = type === 'Movie' ? 'block' : 'none';
                break;
            case 'tv-shows':
                const showType = item.querySelector('.watchlist-meta span:last-child').textContent;
                item.style.display = showType === 'TV Show' ? 'block' : 'none';
                break;
            case 'upcoming':
                const status = item.querySelector('.status-badge').textContent;
                item.style.display = status === 'Upcoming' ? 'block' : 'none';
                break;
            default:
                item.style.display = 'block';
        }
    });
}

// Search watchlist
async function searchWatchlist(query) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/watchlist/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displayWatchlist(results);
    } catch (error) {
        showNotification('Error searching watchlist', 'error');
    }
}

// Mark item as watched
async function markAsWatched(itemId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/watchlist/${itemId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'watched' })
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        showNotification('Marked as watched', 'success');
        loadWatchlist();
    } catch (error) {
        showNotification('Error updating status', 'error');
    }
}

// Remove from watchlist
async function removeFromWatchlist(itemId) {
    if (!confirm('Are you sure you want to remove this from your watchlist?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/watchlist/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove from watchlist');
        }

        showNotification('Removed from watchlist', 'success');
        loadWatchlist();
    } catch (error) {
        showNotification('Error removing from watchlist', 'error');
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