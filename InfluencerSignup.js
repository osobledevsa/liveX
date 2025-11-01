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

// Current step tracking
let currentStep = 1;
const totalSteps = 4;

// Niche selection
const selectedNiches = [];
const maxNiches = 3;

// Social media accounts data
const socialAccounts = {
    instagram: { connected: false, username: '', followers: 0 },
    tiktok: { connected: false, username: '', followers: 0 },
    facebook: { connected: false, username: '', followers: 0 }
};

// Update progress bar
function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
}

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

// Initialize niche tags
document.addEventListener('DOMContentLoaded', function() {
    const nicheTags = document.querySelectorAll('.niche-tag');
    nicheTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const niche = this.getAttribute('data-niche');
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                const index = selectedNiches.indexOf(niche);
                if (index > -1) {
                    selectedNiches.splice(index, 1);
                }
            } else {
                if (selectedNiches.length < maxNiches) {
                    this.classList.add('selected');
                    selectedNiches.push(niche);
                } else {
                    showErrorMessage(`You can only select up to ${maxNiches} niches`);
                }
            }
        });
    });
    
    // Initialize progress bar
    updateProgressBar();
});

// Update country code when country is selected
function updateCountryCode() {
    const countrySelect = document.getElementById('country');
    const countryCodeDisplay = document.getElementById('countryCode');
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const countryCode = selectedOption.getAttribute('data-code');
    
    if (countryCode) {
        countryCodeDisplay.textContent = countryCode;
    } else {
        countryCodeDisplay.textContent = '+';
    }
}

// Step navigation
function nextStep(step) {
    if (validateStep(step)) {
        document.getElementById(`section${step}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.add('completed');
        
        currentStep = step + 1;
        document.getElementById(`section${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        updateProgressBar();
        
        if (currentStep === 4) {
            populateReview();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep(step) {
    document.getElementById(`section${step}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.remove('active');
    
    currentStep = step - 1;
    document.getElementById(`section${currentStep}`).classList.add('active');
    document.getElementById(`section${currentStep}`).classList.remove('completed');
    
    updateProgressBar();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Connect social media account (simulated API call)
function connectSocial(platform) {
    // Simulate API call to connect social media account
    // In a real implementation, this would open OAuth flow
    
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
        // Simulated data
        const mockData = {
            instagram: { username: '@influencer_demo', followers: 12500 },
            tiktok: { username: '@tiktok_demo', followers: 8700 },
            facebook: { username: 'Demo Page', followers: 5300 }
        };
        
        // Update UI
        document.getElementById(`${platform}-connect`).style.display = 'none';
        document.getElementById(`${platform}-info`).style.display = 'block';
        document.getElementById(`${platform}-username`).textContent = mockData[platform].username;
        document.getElementById(`${platform}-followers`).textContent = `${mockData[platform].followers.toLocaleString()} followers`;
        document.getElementById(`${platform}-platform`).classList.add('connected');
        
        // Store data
        socialAccounts[platform].connected = true;
        socialAccounts[platform].username = mockData[platform].username;
        socialAccounts[platform].followers = mockData[platform].followers;
    }, 1000);
}

// Disconnect social media account
function disconnectSocial(platform) {
    document.getElementById(`${platform}-connect`).style.display = 'flex';
    document.getElementById(`${platform}-info`).style.display = 'none';
    document.getElementById(`${platform}-platform`).classList.remove('connected');
    
    // Clear data
    socialAccounts[platform].connected = false;
    socialAccounts[platform].username = '';
    socialAccounts[platform].followers = 0;
}

// Password validation functions
function checkPasswordRequirements() {
    const password = document.getElementById('password').value;
    
    // Check length
    const lengthReq = document.getElementById('length-req');
    if (password.length >= 8) {
        lengthReq.classList.remove('unmet');
        lengthReq.classList.add('met');
        lengthReq.innerHTML = '<i class="fas fa-check-circle"></i> At least 8 characters';
    } else {
        lengthReq.classList.remove('met');
        lengthReq.classList.add('unmet');
        lengthReq.innerHTML = '<i class="fas fa-times-circle"></i> At least 8 characters';
    }
    
    // Check uppercase
    const uppercaseReq = document.getElementById('uppercase-req');
    if (/[A-Z]/.test(password)) {
        uppercaseReq.classList.remove('unmet');
        uppercaseReq.classList.add('met');
        uppercaseReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one uppercase letter';
    } else {
        uppercaseReq.classList.remove('met');
        uppercaseReq.classList.add('unmet');
        uppercaseReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one uppercase letter';
    }
    
    // Check lowercase
    const lowercaseReq = document.getElementById('lowercase-req');
    if (/[a-z]/.test(password)) {
        lowercaseReq.classList.remove('unmet');
        lowercaseReq.classList.add('met');
        lowercaseReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one lowercase letter';
    } else {
        lowercaseReq.classList.remove('met');
        lowercaseReq.classList.add('unmet');
        lowercaseReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one lowercase letter';
    }
    
    // Check number
    const numberReq = document.getElementById('number-req');
    if (/[0-9]/.test(password)) {
        numberReq.classList.remove('unmet');
        numberReq.classList.add('met');
        numberReq.innerHTML = '<i class="fas fa-check-circle"></i> At least one number';
    } else {
        numberReq.classList.remove('met');
        numberReq.classList.add('unmet');
        numberReq.innerHTML = '<i class="fas fa-times-circle"></i> At least one number';
    }
    
    // Check if confirm password field has a value and update match status
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword) {
        checkPasswordMatch();
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (password !== confirmPassword) {
        confirmPasswordError.style.display = 'block';
        return false;
    } else {
        confirmPasswordError.style.display = 'none';
        return true;
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    
    // Check all requirements
    const isLengthValid = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return isLengthValid && hasUppercase && hasLowercase && hasNumber;
}

// Validation functions
function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        // Validate personal information
        const country = document.getElementById('country').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const dob = document.getElementById('dob').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!country) {
            showError('countryError');
            isValid = false;
        } else {
            hideError('countryError');
        }
        
        if (!firstName) {
            showError('firstNameError');
            isValid = false;
        } else {
            hideError('firstNameError');
        }
        
        if (!lastName) {
            showError('lastNameError');
            isValid = false;
        } else {
            hideError('lastNameError');
        }
        
        if (!email || !validateEmail(email)) {
            showError('emailError');
            isValid = false;
        } else {
            hideError('emailError');
        }
        
        if (!phone) {
            showError('phoneError');
            isValid = false;
        } else {
            hideError('phoneError');
        }
        
        if (!dob || !validateAge(dob)) {
            showError('dobError');
            isValid = false;
        } else {
            hideError('dobError');
        }
        
        if (!password) {
            showError('passwordError');
            isValid = false;
        } else if (!validatePassword()) {
            showError('passwordError');
            isValid = false;
        } else {
            hideError('passwordError');
        }
        
        if (!confirmPassword) {
            showError('confirmPasswordError');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError');
            isValid = false;
        } else {
            hideError('confirmPasswordError');
        }
    } else if (step === 2) {
        // Validate at least one social media account
        const hasSocial = 
            socialAccounts.instagram.connected ||
            socialAccounts.tiktok.connected ||
            socialAccounts.facebook.connected;
        
        if (!hasSocial) {
            showErrorMessage('Please connect at least one social media account');
            isValid = false;
        }
    } else if (step === 3) {
        // Validate niche and bio
        const bio = document.getElementById('bio').value;
        
        if (selectedNiches.length === 0) {
            showErrorMessage('Please select at least one niche');
            isValid = false;
        }
        
        if (!bio) {
            showError('bioError');
            isValid = false;
        } else {
            hideError('bioError');
        }
    }
    
    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 18;
}

// Populate review section
function populateReview() {
    // Get country code for phone display
    const countryCode = document.getElementById('countryCode').textContent;
    
    // Personal information
    const personalHtml = `
        <p><strong>Name:</strong> ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}</p>
        <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
        <p><strong>Phone:</strong> ${countryCode} ${document.getElementById('phone').value}</p>
        <p><strong>Country:</strong> ${document.getElementById('country').value}</p>
    `;
    document.getElementById('reviewPersonal').innerHTML = personalHtml;
    
    // Social media
    let socialHtml = '';
    if (socialAccounts.instagram.connected) {
        socialHtml += `<p><strong>Instagram:</strong> ${socialAccounts.instagram.username} (${socialAccounts.instagram.followers.toLocaleString()} followers)</p>`;
    }
    if (socialAccounts.tiktok.connected) {
        socialHtml += `<p><strong>TikTok:</strong> ${socialAccounts.tiktok.username} (${socialAccounts.tiktok.followers.toLocaleString()} followers)</p>`;
    }
    if (socialAccounts.facebook.connected) {
        socialHtml += `<p><strong>Facebook:</strong> ${socialAccounts.facebook.username} (${socialAccounts.facebook.followers.toLocaleString()} followers)</p>`;
    }
    document.getElementById('reviewSocial').innerHTML = socialHtml || '<p>No social media accounts added</p>';
    
    // Niche and content
    const contentTypes = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.value !== 'on') {
            contentTypes.push(checkbox.value);
        }
    });
    
    const nicheHtml = `
        <p><strong>Niches:</strong> ${selectedNiches.join(', ')}</p>
        <p><strong>Content Types:</strong> ${contentTypes.join(', ') || 'None selected'}</p>
    `;
    document.getElementById('reviewNiche').innerHTML = nicheHtml;
}

// Form submission
document.getElementById('influencer-signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate terms acceptance
    const termsAccepted = document.getElementById('terms').checked;
    if (!termsAccepted) {
        showError('termsError');
        return;
    } else {
        hideError('termsError');
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    
    // Get country code for saving
    const countryCode = document.getElementById('countryCode').textContent;
    
    // Process phone number - remove leading 0 if present
    let phoneNumber = document.getElementById('phone').value;
    if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
    }
    const fullPhoneNumber = countryCode + phoneNumber;
    
    // Get user-provided password
    const password = document.getElementById('password').value;
    
    // Collect form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: fullPhoneNumber,
        dob: document.getElementById('dob').value,
        country: document.getElementById('country').value,
        socialMedia: {
            instagram: socialAccounts.instagram,
            tiktok: socialAccounts.tiktok,
            facebook: socialAccounts.facebook
        },
        niches: selectedNiches,
        bio: document.getElementById('bio').value,
        contentTypes: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
        newsletter: document.getElementById('newsletter').checked,
        status: 'pending_verification',
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Create user in Firebase Auth
    auth.createUserWithEmailAndPassword(formData.email, password)
        .then(function(userCredential) {
            const user = userCredential.user;
            console.log("User created with UID:", user.uid);
            
            // Save influencer data to Firestore
            return db.collection('influencers').doc(user.uid).set(formData);
        })
        .then(function() {
            console.log("Influencer profile created successfully");
            
            // Send verification email
            return auth.currentUser.sendEmailVerification();
        })
        .then(function() {
            console.log("Verification email sent");
            
            // Hide loading and show success
            document.getElementById('loading').style.display = 'none';
            document.getElementById('section4').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            
            // Reset form
            document.getElementById('influencer-signup-form').reset();
            selectedNiches.length = 0;
            document.querySelectorAll('.niche-tag').forEach(tag => {
                tag.classList.remove('selected');
            });
            document.getElementById('countryCode').textContent = '+254';
            
            // Reset password requirements
            document.querySelectorAll('.requirement').forEach(req => {
                req.classList.remove('met');
                req.classList.add('unmet');
            });
            
            // Reset social accounts
            Object.keys(socialAccounts).forEach(platform => {
                disconnectSocial(platform);
            });
        })
        .catch(function(error) {
            console.error("Error creating influencer profile: ", error);
            document.getElementById('loading').style.display = 'none';
            
            // Handle specific errors
            if (error.code === 'auth/email-already-in-use') {
                showErrorMessage('This email is already registered. Please use a different email or login to your existing account.');
            } else if (error.code === 'auth/weak-password') {
                showErrorMessage('The password is too weak. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                showErrorMessage('The email address is not valid. Please enter a valid email address.');
            } else if (error.code === 'auth/password-does-not-meet-requirements') {
                showErrorMessage('Password does not meet requirements. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
            } else {
                showErrorMessage('There was an error submitting your application: ' + error.message);
            }
        });
});