import { supabase } from './supabase.js';

let isRedirecting = false;

document.addEventListener('DOMContentLoaded', async () => {

	const loginForm = document.getElementById('loginForm');
	const signupForm = document.getElementById('signupForm');
	const toggleBtns = document.querySelectorAll('.toggle-btn');

	const loginEmail = document.getElementById('login-email');
	const loginPassword = document.getElementById('login-password');
	const loginError = document.getElementById('login-error');

	const signupName = document.getElementById('signup-name');
	const signupEmail = document.getElementById('signup-email');
	const signupPassword = document.getElementById('signup-password');
	const signupError = document.getElementById('signup-error');
	const passwordStrength = document.getElementById('password-strength');


	// ======================
	// TOGGLE LOGIN / SIGNUP
	// ======================

	toggleBtns.forEach(btn => {

		btn.addEventListener('click', function () {

			toggleBtns.forEach(b => b.classList.remove('active'));
			this.classList.add('active');

			const heroSubtitle = document.querySelector('.hero-subtitle');
			const heroTitle = document.querySelector('.hero-title');

			if (this.dataset.form === 'login') {

				loginForm.style.display = 'block';
				signupForm.style.display = 'none';

				if (heroSubtitle)
					heroSubtitle.textContent =
						'Log in to unlock exclusive collections, curated for the modern lifestyle.';

				if (heroTitle)
					heroTitle.innerHTML =
						'Experience <br>Premium <span>Tech.</span>';

			} else {

				loginForm.style.display = 'none';
				signupForm.style.display = 'block';

				if (heroSubtitle)
					heroSubtitle.textContent =
						'Sign up to create your account and unlock exclusive collections tailored for you.';

				if (heroTitle)
					heroTitle.innerHTML =
						'Join the <br>Premium <span>Club.</span>';
			}

		});

	});


	// ======================
	// PASSWORD STRENGTH
	// ======================

	if (signupPassword) {

		signupPassword.addEventListener('input', function () {

			const password = this.value;

			if (password.length === 0) {
				passwordStrength.textContent = '';
			}
			else if (password.length < 6) {
				passwordStrength.textContent = 'Weak password';
				passwordStrength.style.color = '#e74c3c';
			}
			else if (password.length < 10) {
				passwordStrength.textContent = 'Medium strength';
				passwordStrength.style.color = '#f1c40f';
			}
			else {
				passwordStrength.textContent = 'Strong password';
				passwordStrength.style.color = '#2ecc71';
			}

		});

	}

	const googleBtn = document.getElementById('googleLoginBtn');

	if (googleBtn) {
		googleBtn.addEventListener('click', async (event) => {
			event.preventDefault();

			loginError.style.display = 'none';
			googleBtn.disabled = true;
			googleBtn.classList.add('loading');

			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: window.location.origin + window.location.pathname
				}
			});

			if (error) {
				loginError.textContent = error.message;
				loginError.style.display = 'block';
				googleBtn.disabled = false;
				googleBtn.classList.remove('loading');
			}
		});
	}

	const { data } = await supabase.auth.getUser();
	if (data && data.user) {
		await redirectBasedOnProfile(data.user);
		return;
	}

	// ======================
	// SIGNUP
	// ======================

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
			signupError.textContent = 'Enter a valid email address';
			signupError.style.display = 'block';
			return;
		}

		if (password.length < 6) {
			signupError.textContent = 'Password must be at least 6 characters';
			signupError.style.display = 'block';
			return;
		}

		const signupBtn = this.querySelector("button[type='submit']");
		signupBtn.classList.add('loading');
		signupBtn.disabled = true;


		const { error } = await supabase.auth.signUp({
			email,
			password,
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
			const { data: postSignup } = await supabase.auth.getUser();
			if (postSignup && postSignup.user) {
				await redirectBasedOnProfile(postSignup.user);
				return;
			}

			showNotification(
				"Account created! Check your email to confirm.",
				"success"
			);

			signupBtn.classList.remove('loading');
			signupBtn.disabled = false;

		}

	});


	// ======================
	// LOGIN
	// ======================

	loginForm.addEventListener('submit', async function (e) {

		e.preventDefault();

		const email = loginEmail.value.trim();
		const password = loginPassword.value.trim();

		loginError.style.display = 'none';

		if (!email || !password) {

			loginError.textContent = 'Enter email and password';
			loginError.style.display = 'block';
			return;
		}

		const loginBtn = this.querySelector("button[type='submit']");
		loginBtn.classList.add('loading');
		loginBtn.disabled = true;


		const { error } =
			await supabase.auth.signInWithPassword({
				email,
				password
			});


		if (error) {

			loginError.textContent = error.message;
			loginError.style.display = 'block';

			loginBtn.classList.remove('loading');
			loginBtn.disabled = false;

		} else {

			showNotification("Welcome back!", "success");
			const { data: loginData } = await supabase.auth.getUser();
			if (loginData && loginData.user) {
				await redirectBasedOnProfile(loginData.user);
			} else {
				window.location.href = "index.html";
			}

		}

	});
    


	// ======================
	// AUTH STATE LISTENER
	// ======================

	supabase.auth.onAuthStateChange(async (event, session) => {

		if (session && session.user) {
			await redirectBasedOnProfile(session.user);
		} else {
			// stay on login
		}

	});

});



// ======================
// LOGOUT FUNCTION (USE ANYWHERE)
// ======================

export async function logout() {

	await supabase.auth.signOut();
	window.location.href = "login.html";

}



// ======================
// GET CURRENT USER
// ======================

export async function getCurrentUser() {

	const { data } = await supabase.auth.getUser();
	return data.user;

}

async function redirectBasedOnProfile(user) {
	if (!user || isRedirecting) return;
	isRedirecting = true;

	const { data: profile } =
		await supabase
		.from("profiles")
		.select("id")
		.eq("id", user.id)
		.maybeSingle();

	if (!profile) {
		window.location.href = "profile.html";
	} else {
		window.location.href = "index.html";
	}
}

// ======================
// NOTIFICATION UI
// ======================

function showNotification(message, type) {

	const notification = document.createElement('div');

	const bg =
		type === 'success'
			? '#16a34a'
			: '#dc2626';

	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		background: ${bg};
		color: #fff;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: 500;
		z-index: 10000;
		box-shadow: 0 4px 12px rgba(0,0,0,0.2);
	`;

	notification.textContent = message;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 3000);

}