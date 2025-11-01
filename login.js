// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBT3OWo_bdJtcnmqVVX_tNndSCe9gyEA_k",
    authDomain: "livex-b1c25.firebaseapp.com",
    projectId: "livex-b1c25",
    storageBucket: "livex-b1c25.firebasestorage.app",
    messagingSenderId: "1025075596453",
    appId: "1:1025075596453:web:686be2ebffa5c0f723114c",
    measurementId: "G-GNQLPMEJWX"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    showError("Firebase initialization failed. Please refresh the page and try again.");
}

const auth = firebase.auth();

// Form validation function
function validateLoginForm() {
    let isValid = true;
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    // Validate email
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('email-error').textContent = 'Email is invalid';
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        document.getElementById('password-error').textContent = 'Password is required';
        isValid = false;
    }
    
    return isValid;
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
        return;
    }
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Show loading state
    document.getElementById('button-text').textContent = 'Signing In...';
    document.getElementById('button-spinner').classList.remove('hidden');
    document.getElementById('submit-button').disabled = true;
    
    try {
        // Set persistence based on remember me checkbox
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if email is verified
        if (!user.emailVerified) {
            // Show error message
            document.getElementById('error-text').textContent = 'Please verify your email before signing in. Check your inbox for the verification link.';
            document.getElementById('error-message').classList.remove('hidden');
            
            // Reset button state
            document.getElementById('button-text').textContent = 'Sign In';
            document.getElementById('button-spinner').classList.add('hidden');
            document.getElementById('submit-button').disabled = false;
            
            return;
        }
        
        // Show success message
        document.getElementById('success-text').textContent = 'You have successfully logged in. Redirecting...';
        document.getElementById('success-message').classList.remove('hidden');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        // Handle errors
        console.error('Error signing in:', error);
        
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                document.getElementById('email-error').textContent = errorMessage;
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                document.getElementById('password-error').textContent = errorMessage;
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address is invalid.';
                document.getElementById('email-error').textContent = errorMessage;
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed login attempts. Please try again later.';
                break;
            default:
                errorMessage = error.message;
        }
        
        // Show error message
        document.getElementById('error-text').textContent = errorMessage;
        document.getElementById('error-message').classList.remove('hidden');
        
        // Reset button state
        document.getElementById('button-text').textContent = 'Sign In';
        document.getElementById('button-spinner').classList.add('hidden');
        document.getElementById('submit-button').disabled = false;
    }
});

// Password visibility toggle
document.getElementById('password-toggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
});

// Show/hide password reset form
document.getElementById('forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('reset-form').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
});

document.getElementById('back-to-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('reset-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
});

// Handle password reset form submission
document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    
    // Reset error messages
    document.getElementById('reset-email-error').textContent = '';
    
    // Validate email
    if (!email) {
        document.getElementById('reset-email-error').textContent = 'Email is required';
        return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('reset-email-error').textContent = 'Email is invalid';
        return;
    }
    
    // Show loading state
    document.getElementById('reset-button-text').textContent = 'Sending...';
    document.getElementById('reset-button-spinner').classList.remove('hidden');
    document.getElementById('reset-button').disabled = true;
    
    try {
        // Send password reset email
        await auth.sendPasswordResetEmail(email);
        
        // Show success message
        document.getElementById('success-text').textContent = 'Password reset email sent! Please check your inbox.';
        document.getElementById('success-message').classList.remove('hidden');
        
        // Reset form
        document.getElementById('reset-form').reset();
        
        // Reset button state
        document.getElementById('reset-button-text').textContent = 'Send Reset Email';
        document.getElementById('reset-button-spinner').classList.add('hidden');
        document.getElementById('reset-button').disabled = false;
        
    } catch (error) {
        console.error('Error sending password reset email:', error);
        
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                document.getElementById('reset-email-error').textContent = errorMessage;
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address is invalid.';
                document.getElementById('reset-email-error').textContent = errorMessage;
                break;
            default:
                errorMessage = error.message;
        }
        
        // Show error message
        document.getElementById('error-text').textContent = errorMessage;
        document.getElementById('error-message').classList.remove('hidden');
        
        // Reset button state
        document.getElementById('reset-button-text').textContent = 'Send Reset Email';
        document.getElementById('reset-button-spinner').classList.add('hidden');
        document.getElementById('reset-button').disabled = false;
    }
});

// Function to show error messages
function showError(message) {
    document.getElementById('error-text').textContent = message;
    document.getElementById('error-message').classList.remove('hidden');
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide error after 5 seconds
    setTimeout(() => {
        document.getElementById('error-message').classList.add('hidden');
    }, 5000);
}