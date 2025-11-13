
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyBT3OWo_bdJtcnmqVVX_tNndSCe9gyEA_k",
            authDomain: "livex-b1c25.firebaseapp.com",
            projectId: "livex-b1c25",
            storageBucket: "livex-b1c25.firebasestorage.app",
            messagingSenderId: "1025075596453",
            appId: "1:1025075596453:web:686be2ebffa5c0f723114c",
            measurementId: "G-GNQLPMEJWX"
        };
        
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // DOM Elements
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('password');
        const togglePasswordBtn = document.getElementById('togglePassword');
        const submitBtn = document.getElementById('submitBtn');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        // Forgot Password Modal Elements
        const forgotPasswordModal = document.getElementById('forgotPasswordModal');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const closeBtn = document.querySelector('.close');
        const cancelReset = document.getElementById('cancelReset');
        const sendResetEmail = document.getElementById('sendResetEmail');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const resetEmail = document.getElementById('resetEmail');
        const resetSuccess = document.getElementById('resetSuccess');
        const resetError = document.getElementById('resetError');
        const resetErrorText = document.getElementById('resetErrorText');
        
        // Toggle password visibility
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = togglePasswordBtn.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
        
        // Form submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Hide any previous error messages
            errorMessage.classList.add('hidden');
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing In...';
            
            try {
                // Sign in with Firebase Auth
                const userCredential = await auth.signInWithEmailAndPassword(
                    document.getElementById('email').value,
                    passwordInput.value
                );
                
                const user = userCredential.user;
                
                // Check user role and redirect accordingly
                await checkUserRoleAndRedirect(user.uid);
                
            } catch (error) {
                console.error("Error signing in:", error);
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right ml-2"></i>';
                
                // Show error message
                errorText.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        });
        
        // Function to check user role and redirect
        async function checkUserRoleAndRedirect(userId) {
            try {
                // Check if user is an admin
                const adminDoc = await db.collection('admins').doc(userId).get();
                if (adminDoc.exists) {
                    window.location.href = 'adminDashboard.html';
                    return;
                }
                
                // Check if user is an influencer
                const influencerDoc = await db.collection('influencers').doc(userId).get();
                if (influencerDoc.exists) {
                    window.location.href = 'InfluencerDashboard.html';
                    return;
                }
                
                // Check if user is a brand
                const brandDoc = await db.collection('brands').doc(userId).get();
                if (brandDoc.exists) {
                    window.location.href = 'BrandDashboard.html';
                    return;
                }
                
                // If user is not found in any collection
                throw new Error('User role not found. Please contact support.');
                
            } catch (error) {
                console.error("Error checking user role:", error);
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right ml-2"></i>';
                
                // Show error message
                errorText.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        }
        
        // Forgot Password Modal Functionality
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.style.display = 'block';
            // Pre-fill email if already entered in login form
            const loginEmail = document.getElementById('email').value;
            if (loginEmail) {
                resetEmail.value = loginEmail;
            }
        });
        
        closeBtn.addEventListener('click', () => {
            forgotPasswordModal.style.display = 'none';
            resetSuccess.classList.remove('show');
            resetError.classList.remove('show');
        });
        
        cancelReset.addEventListener('click', () => {
            forgotPasswordModal.style.display = 'none';
            resetSuccess.classList.remove('show');
            resetError.classList.remove('show');
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = 'none';
                resetSuccess.classList.remove('show');
                resetError.classList.remove('show');
            }
        });
        
        // Send password reset email
        sendResetEmail.addEventListener('click', async () => {
            const email = resetEmail.value;
            
            if (!email) {
                resetErrorText.textContent = 'Please enter your email address';
                resetError.classList.add('show');
                return;
            }
            
            // Disable button and show loading state
            sendResetEmail.disabled = true;
            sendResetEmail.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
            
            try {
                await auth.sendPasswordResetEmail(email);
                
                // Show success message
                resetSuccess.classList.add('show');
                resetError.classList.remove('show');
                
                // Reset button state
                sendResetEmail.disabled = false;
                sendResetEmail.innerHTML = 'Send Reset Link';
                
                // Clear form
                forgotPasswordForm.reset();
                
                // Close modal after a delay
                setTimeout(() => {
                    forgotPasswordModal.style.display = 'none';
                    resetSuccess.classList.remove('show');
                }, 3000);
                
            } catch (error) {
                console.error("Error sending password reset email:", error);
                
                // Show error message
                resetErrorText.textContent = error.message;
                resetError.classList.add('show');
                resetSuccess.classList.remove('show');
                
                // Reset button state
                sendResetEmail.disabled = false;
                sendResetEmail.innerHTML = 'Send Reset Link';
            }
        });
        
        // Mobile menu functionality
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeMenuButton = document.getElementById('close-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('open');
        });
        
        closeMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
   