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
    showErrorMessage("Firebase initialization failed. Please refresh the page and try again.");
}

const auth = firebase.auth();
const db = firebase.firestore();

// Error handling function for messages
function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Error handling function for error IDs
function showError(errorId) {
    if (document.getElementById(errorId)) {
        document.getElementById(errorId).style.display = 'block';
    }
}

// Hide error function
function hideError(errorId) {
    if (document.getElementById(errorId)) {
        document.getElementById(errorId).style.display = 'none';
    }
}

// Password validation function
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
    
    // Update UI for each requirement
    const lengthReq = document.getElementById('length-req');
    if (requirements.length) {
        lengthReq.classList.remove('unmet');
        lengthReq.classList.add('met');
        lengthReq.innerHTML = '<i class="fas fa-check-circle"></i> At least 8 characters';
    } else {
        lengthReq.classList.remove('met');
        lengthReq.classList.add('unmet');
        lengthReq.innerHTML = '<i class="fas fa-times-circle"></i> At least 8 characters';
    }
    
    const uppercaseReq = document.getElementById('uppercase-req');
    if (requirements.uppercase) {
        uppercaseReq.classList.remove('unmet');
        uppercaseReq.classList.add('met');
        uppercaseReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one uppercase letter';
    } else {
        uppercaseReq.classList.remove('met');
        uppercaseReq.classList.add('unmet');
        uppercaseReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one uppercase letter';
    }
    
    const lowercaseReq = document.getElementById('lowercase-req');
    if (requirements.lowercase) {
        lowercaseReq.classList.remove('unmet');
        lowercaseReq.classList.add('met');
        lowercaseReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one lowercase letter';
    } else {
        lowercaseReq.classList.remove('met');
        lowercaseReq.classList.add('unmet');
        lowercaseReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one lowercase letter';
    }
    
    const numberReq = document.getElementById('number-req');
    if (requirements.number) {
        numberReq.classList.remove('unmet');
        numberReq.classList.add('met');
        numberReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one number';
    } else {
        numberReq.classList.remove('met');
        numberReq.classList.add('unmet');
        numberReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one number';
    }
    
    // Return true if all requirements are met
    return requirements.length && requirements.uppercase && requirements.lowercase && requirements.number;
}

// Form validation function
function validateForm() {
    let isValid = true;
    
    // Get form values
    const brandName = document.getElementById('brand-name').value.trim();
    const industry = document.getElementById('industry').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    // Validate brand name
    if (!brandName) {
        document.getElementById('brand-name-error').textContent = 'Brand name is required';
        document.getElementById('brand-name-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate industry
    if (!industry) {
        document.getElementById('industry-error').textContent = 'Please select your industry';
        document.getElementById('industry-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('email-error').textContent = 'Email is invalid';
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        document.getElementById('password-error').textContent = 'Password is required';
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    } else if (!validatePassword(password)) {
        document.getElementById('password-error').textContent = 'Password does not meet requirements';
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Please confirm your password';
        document.getElementById('confirm-password-error').style.display = 'block';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        document.getElementById('confirm-password-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate terms
    if (!terms) {
        document.getElementById('terms-error').textContent = 'You must agree to the terms and conditions';
        document.getElementById('terms-error').style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

// Handle form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Get form values
    const brandName = document.getElementById('brand-name').value.trim();
    const industry = document.getElementById('industry').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    
    // Show loading state
    document.getElementById('button-text').textContent = 'Creating Account...';
    document.getElementById('button-spinner').classList.remove('hidden');
    document.getElementById('submit-button').disabled = true;
    
    try {
        // Create user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save brand data to Firestore
        await db.collection('brands').doc(user.uid).set({
            brandName: brandName,
            industry: industry,
            email: email,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Show success message
        document.getElementById('success-message').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        
    } catch (error) {
        // Handle errors
        console.error('Error creating account:', error);
        
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                document.getElementById('email-error').textContent = errorMessage;
                document.getElementById('email-error').style.display = 'block';
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address is invalid.';
                document.getElementById('email-error').textContent = errorMessage;
                document.getElementById('email-error').style.display = 'block';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak.';
                document.getElementById('password-error').textContent = errorMessage;
                document.getElementById('password-error').style.display = 'block';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                break;
            default:
                errorMessage = error.message;
        }
        
        // Show error message
        showErrorMessage(errorMessage);
        
        // Reset button state
        document.getElementById('button-text').textContent = 'Create Account';
        document.getElementById('button-spinner').classList.add('hidden');
        document.getElementById('submit-button').disabled = false;
    }
});

// Real-time password validation
document.getElementById('password').addEventListener('input', function() {
    validatePassword(this.value);
});

// Check password match in real-time
document.getElementById('confirm-password').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        document.getElementById('confirm-password-error').style.display = 'block';
    } else {
        document.getElementById('confirm-password-error').textContent = '';
        document.getElementById('confirm-password-error').style.display = 'none';
    }
});