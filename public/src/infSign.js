
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
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // City data for dropdown
        const cities = [
            "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", 
            "Kehancha", "Rongo", "Awendo", " Migori", "Isebania",
            "Thika", "Kitale", "Garissa", "Kakamega", "Kisii",
            "Malindi", "Lamu", "Meru", "Nyeri", "Embu"
        ];

        // City dropdown functionality
        const cityInput = document.getElementById('city');
        const citySuggestions = document.getElementById('city-suggestions');

        cityInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            
            if (value.length < 2) {
                citySuggestions.style.display = 'none';
                return;
            }
            
            const filteredCities = cities.filter(city => 
                city.toLowerCase().includes(value)
            );
            
            if (filteredCities.length > 0) {
                citySuggestions.innerHTML = filteredCities
                    .map(city => `<div class="city-suggestion" data-city="${city}">${city}</div>`)
                    .join('');
                citySuggestions.style.display = 'block';
                
                // Add click event to suggestions
                document.querySelectorAll('.city-suggestion').forEach(suggestion => {
                    suggestion.addEventListener('click', function() {
                        cityInput.value = this.getAttribute('data-city');
                        citySuggestions.style.display = 'none';
                    });
                });
            } else {
                citySuggestions.style.display = 'none';
            }
        });

        // Hide city suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!cityInput.contains(e.target) && !citySuggestions.contains(e.target)) {
                citySuggestions.style.display = 'none';
            }
        });

        // Form submission
        document.getElementById('signup-form-element').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;
            
            // Validate form
            if (!fullName || !email || !password || !phone || !city) {
                showModal('Missing Information', 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== document.getElementById('confirmPassword').value) {
                showModal('Password Mismatch', 'Passwords do not match', 'error');
                return;
            }
            
            // Password strength validation
            const hasCapital = /[A-Z]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            
            if (!hasCapital || !hasSpecial || !hasNumber) {
                showModal('Weak Password', 'Password must contain at least one capital letter, one special character, and one number.', 'error');
                return;
            }
            
            // Create user with Firebase Auth
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // User created successfully
                    const user = userCredential.user;
                    
                    // Save basic user data to Firestore
                    return db.collection('influencers').doc(user.uid).set({
                        fullName: fullName,
                        email: email,
                        phone: phone,
                        city: city,
                        profileCompleted: false, // Flag to check if profile is completed
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    // Show success step
                    document.getElementById('signup-form').classList.remove('active');
                    document.getElementById('success-step').classList.add('active');
                })
                .catch((error) => {
                    console.error('Error creating user:', error);
                    showModal('Signup Error', `Error creating account: ${error.message}`, 'error');
                });
        });

        // Modal functions
        function showModal(title, message, type = 'info') {
            const modal = document.getElementById('notification-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalMessage = document.getElementById('modal-message');
            const modalBtn = document.getElementById('modal-btn');
            
            // Set modal content
            modalTitle.textContent = title;
            modalMessage.innerHTML = message;
            
            // Set modal icon based on type
            let icon = '';
            if (type === 'error') {
                icon = '<i class="fas fa-exclamation-circle error-icon"></i>';
            } else if (type === 'success') {
                icon = '<i class="fas fa-check-circle success-icon"></i>';
            } else {
                icon = '<i class="fas fa-info-circle info-icon"></i>';
            }
            
            modalMessage.innerHTML = icon + message;
            
            // Show modal
            modal.style.display = 'block';
        }

        // Close modal when clicking the close button or OK button
        document.getElementById('modal-close').addEventListener('click', function() {
            document.getElementById('notification-modal').style.display = 'none';
        });

        document.getElementById('modal-btn').addEventListener('click', function() {
            document.getElementById('notification-modal').style.display = 'none';
        });

        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('notification-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Password strength checker
        function checkPasswordStrength() {
            const password = document.getElementById('password').value;
            const strengthBar = document.getElementById('strengthBar');
            const strengthText = document.getElementById('strengthText');
            const capitalCheck = document.getElementById('capital');
            const specialCheck = document.getElementById('special');
            const numberCheck = document.getElementById('number');
            
            let strength = 0;
            let hasCapital = /[A-Z]/.test(password);
            let hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            let hasNumber = /[0-9]/.test(password);
            
            if (hasCapital) {
                strength++;
                capitalCheck.classList.remove('text-gray-500');
                capitalCheck.classList.add('text-green-500');
            } else {
                capitalCheck.classList.remove('text-green-500');
                capitalCheck.classList.add('text-gray-500');
            }
            
            if (hasSpecial) {
                strength++;
                specialCheck.classList.remove('text-gray-500');
                specialCheck.classList.add('text-green-500');
            } else {
                specialCheck.classList.remove('text-green-500');
                specialCheck.classList.add('text-gray-500');
            }
            
            if (hasNumber) {
                strength++;
                numberCheck.classList.remove('text-gray-500');
                numberCheck.classList.add('text-green-500');
            } else {
                numberCheck.classList.remove('text-green-500');
                numberCheck.classList.add('text-gray-500');
            }
            
            if (password.length >= 8) {
                strength++;
            }
            
            const strengthPercentage = (strength / 4) * 100;
            strengthBar.style.width = strengthPercentage + '%';
            
            if (strength === 0) {
                strengthBar.style.backgroundColor = '#e5e7eb';
                strengthText.textContent = '';
            } else if (strength <= 1) {
                strengthBar.style.backgroundColor = '#ef4444';
                strengthText.textContent = 'Weak password';
                strengthText.style.color = '#ef4444';
            } else if (strength === 2) {
                strengthBar.style.backgroundColor = '#f59e0b';
                strengthText.textContent = 'Fair password';
                strengthText.style.color = '#f59e0b';
            } else if (strength === 3) {
                strengthBar.style.backgroundColor = '#3b82f6';
                strengthText.textContent = 'Good password';
                strengthText.style.color = '#3b82f6';
            } else {
                strengthBar.style.backgroundColor = '#10b981';
                strengthText.textContent = 'Strong password';
                strengthText.style.color = '#10b981';
            }
        }

        // Password match checker
        function checkPasswordMatch() {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const matchText = document.getElementById('matchText');
            
            if (confirmPassword === '') {
                matchText.textContent = '';
            } else if (password === confirmPassword) {
                matchText.textContent = '✓ Passwords match';
                matchText.style.color = '#10b981';
            } else {
                matchText.textContent = '✗ Passwords do not match';
                matchText.style.color = '#ef4444';
            }
        }

        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.add('open');
        });

        document.getElementById('close-menu').addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.remove('open');
        });
    