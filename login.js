document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForms = document.querySelectorAll('.login-form');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const userLoginForm = document.getElementById('userLoginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const registerForm = document.getElementById('registerForm');

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (decodedToken.type === 'admin') {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
        }
    }

    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            loginForms.forEach(form => form.classList.remove('active'));

            btn.classList.add('active');
            const formId = btn.dataset.tab === 'admin' ? 'adminLoginForm' : 'userLoginForm';
            document.getElementById(formId).classList.add('active');
        });
    });

    // Show register form
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForms.forEach(form => form.classList.remove('active'));
        registerForm.classList.add('active');
    });

    // Show login form
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForms.forEach(form => form.classList.remove('active'));
        userLoginForm.classList.add('active');
        tabBtns[0].classList.add('active');
        tabBtns[1].classList.remove('active');
    });

    // Form submissions
    userLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = userLoginForm.querySelector('input[type="email"]').value;
        const password = userLoginForm.querySelector('input[type="password"]').value;

        try {
            console.log('Attempting user login...');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                console.log('Login successful, redirecting to main page...');
                window.location.href = 'main.html';
            } else {
                console.error('Login failed:', data.message);
                showError(userLoginForm, data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(userLoginForm, 'An error occurred. Please try again later.');
        }
    });

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = adminLoginForm.querySelector('input[type="text"]').value;
        const password = adminLoginForm.querySelector('input[type="password"]').value;

        try {
            console.log('Attempting admin login...');
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Admin login response status:', response.status);
            const data = await response.json();
            console.log('Admin login response data:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                console.log('Admin login successful, redirecting to main page...');
                window.location.href = 'main.html';
            } else {
                console.error('Admin login failed:', data.message);
                showError(adminLoginForm, data.message || 'Admin login failed. Please try again.');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showError(adminLoginForm, 'An error occurred. Please try again later.');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('input[placeholder="Full Name"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            showError(registerForm, 'Passwords do not match!');
            return;
        }

        try {
            console.log('Attempting registration...');
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            console.log('Registration response status:', response.status);
            const data = await response.json();
            console.log('Registration response data:', data);

            if (response.ok) {
                showSuccess(registerForm, 'Registration successful! Please login.');
                setTimeout(() => {
                    loginForms.forEach(form => form.classList.remove('active'));
                    userLoginForm.classList.add('active');
                }, 2000);
            } else {
                console.error('Registration failed:', data.message);
                showError(registerForm, data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError(registerForm, 'An error occurred. Please try again later.');
        }
    });

    // Helper functions
    function showError(form, message) {
        const errorDiv = form.querySelector('.error-message') || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (!form.querySelector('.error-message')) {
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function showSuccess(form, message) {
        const successDiv = form.querySelector('.success-message') || document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        if (!form.querySelector('.success-message')) {
            form.insertBefore(successDiv, form.firstChild);
        }
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}); 