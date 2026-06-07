document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userInfo = document.querySelector('.user-info');
    
    if (token) {
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (decodedToken.type === 'admin') {
                userInfo.style.display = 'flex';
            } else {
                userInfo.style.display = 'none';
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            userInfo.style.display = 'none';
        }
    } else {
        userInfo.style.display = 'none';
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add hover effect to genre cards
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Add click event to genre cards
    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            const genre = card.querySelector('h3').textContent;
            // You can add your genre selection logic here
            console.log(`Selected genre: ${genre}`);
        });
    });

    // Add animation to feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}); 