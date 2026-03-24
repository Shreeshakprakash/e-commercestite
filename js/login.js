import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const rememberMe = document.getElementById('remember');

    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupError = document.getElementById('signup-error');
    const passwordStrength = document.getElementById('password-strength');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroTitle = document.querySelector('.hero-title');
            
            if (this.dataset.form === 'login') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                if (heroSubtitle) heroSubtitle.textContent = 'Log in to unlock exclusive collections, curated for the modern lifestyle.';
                if (heroTitle) heroTitle.innerHTML = 'Experience <br>Premium <span>Tech.</span>';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                if (heroSubtitle) heroSubtitle.textContent = 'Sign up to create your account and unlock exclusive collections tailored for you.';
                if (heroTitle) heroTitle.innerHTML = 'Join the <br>Premium <span>Club.</span>';
            }
        });
    });

    signupPassword.addEventListener('input', function () {
        const password = this.value;
        if (password.length === 0) {
            passwordStrength.textContent = '';
        } else if (password.length < 6) {
            passwordStrength.textContent = 'Weak password';
            passwordStrength.style.color = '#e74c3c';
        } else if (password.length < 10) {
            passwordStrength.textContent = 'Medium strength';
            passwordStrength.style.color = '#f1c40f';
        } else {
            passwordStrength.textContent = 'Strong password';
            passwordStrength.style.color = '#2ecc71';
        }
    });

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;

        signupError.style.display = 'none';

        if (name.length < 2) {
            signupError.textContent = 'Name must be at least 2 characters long';
            signupError.style.display = 'block';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            signupError.textContent = 'Please enter a valid email address';
            signupError.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters long';
            signupError.style.display = 'block';
            return;
        }

        const signupBtn = this.querySelector('button[type=''submit'']');
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;

        if (!supabase) {
            signupError.textContent = 'Supabase client is not initialized. Please set your Supabase URL and Key in js/supabase.js.';
            signupError.style.display = 'block';
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) {
            signupError.textContent = error.message;
            signupError.style.display = 'block';
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
        } else {
            showNotification('Account created!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        loginError.style.display = 'none';

        if (!email || !password) {
            loginError.textContent = 'Please enter both email and password.';
            loginError.style.display = 'block';
            return;
        }
        
        const loginBtn = this.querySelector('button[type=''submit'']');
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;

        if (!supabase) {
            loginError.textContent = 'Supabase client is not initialized. Please set your Supabase URL and Key in js/supabase.js.';
            loginError.style.display = 'block';
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        } else {
            localStorage.setItem('user', JSON.stringify({
                uid: data.user.id,
                email: data.user.email
            }));
            window.location.href = 'index.html';
        }
    });

    if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (session && session.user) {
                localStorage.setItem('user', JSON.stringify({
                    uid: session.user.id,
                    email: session.user.email
                }));
            } else {
                localStorage.removeItem('user');
            }
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = \
            position: fixed;
            top: 20px;
            right: 20px;
            background: \;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(11, 48, 55, 0.2);
        \;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = \
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        \;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
});
