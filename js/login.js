document.addEventListener('DOMContentLoaded', function () {

        const firebaseConfig = {
  apiKey: "AIzaSyBrVZa9LRKYURVw8t7sqWGbQYuqlrnfEZ8",
  authDomain: "test-ecommerce-a7d42.firebaseapp.com",
  projectId: "test-ecommerce-a7d42",
  storageBucket: "test-ecommerce-a7d42.appspot.com",
  messagingSenderId: "202120303178",
  appId: "1:202120303178:web:a80663199b8a4a78808cb3",
  measurementId: "G-FYPBLT6XDH"
};
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const ADMIN_EMAIL = 'admin@pixelport.com';
    const ADMIN_PASSWORD = 'PixelPort2025!';

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

            if (this.dataset.form === 'login') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
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


    
    signupForm.addEventListener('submit', function (e) {
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

        const signupBtn = this.querySelector('button[type="submit"]');
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;

        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                showNotification('Account created! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            })
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.style.display = 'block';
                signupBtn.classList.remove('loading');
                signupBtn.disabled = false;
            });
    });

    
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        loginError.style.display = 'none';

        
        if (!email || !password) {
            loginError.textContent = 'Please enter both email and password.';
            loginError.style.display = 'block';
            return;
        }

        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                
                localStorage.setItem('user', JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                }));
                window.location.href = 'index.html';
            })
            .catch((error) => {
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            });
    });

    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            
        }
    });


    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#134E5E' : '#e74c3c'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(11, 48, 55, 0.2);
        `;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }

    
    function addPasswordToggle(passwordInput) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; display: flex; align-items: center;';
        
        
        passwordInput.parentNode.insertBefore(wrapper, passwordInput);
        wrapper.appendChild(passwordInput);
        
        
        const toggleBtn = document.createElement('span');
        toggleBtn.innerHTML = '👁️';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 12px;
            cursor: pointer;
            font-size: 18px;
            color: #666;
            user-select: none;
            z-index: 1;
        `;
        
        wrapper.appendChild(toggleBtn);
        
        
        toggleBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.innerHTML = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleBtn.innerHTML = '👁️';
            }
        });
    }

    
    addPasswordToggle(loginPassword);
    addPasswordToggle(signupPassword);


    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        loginEmail.value = rememberedEmail;
        rememberMe.checked = true;
    }

});