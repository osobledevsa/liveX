
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

        // Form navigation
        let currentStep = 1;
        const totalSteps = 4;

        // Update progress bar
        function updateProgress() {
            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
            
            // Update step indicators
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                const stepNumber = index + 1;
                indicator.classList.remove('active', 'completed');
                
                if (stepNumber < currentStep) {
                    indicator.classList.add('completed');
                    indicator.innerHTML = '<i class="fas fa-check"></i>';
                } else if (stepNumber === currentStep) {
                    indicator.classList.add('active');
                    indicator.textContent = stepNumber;
                } else {
                    indicator.textContent = stepNumber;
                }
            });
        }

        // Show step
        function showStep(stepNumber) {
            document.querySelectorAll('.step-container').forEach(container => {
                container.classList.remove('active');
            });
            document.getElementById(`step-${stepNumber}`).classList.add('active');
            currentStep = stepNumber;
            updateProgress();
        }

        // Next and Back button event listeners
        document.getElementById('next-to-step2').addEventListener('click', function() {
            if (validateStep1()) {
                showStep(2);
            }
        });

        document.getElementById('back-to-step1').addEventListener('click', function() {
            showStep(1);
        });

        document.getElementById('next-to-step3').addEventListener('click', function() {
            if (validateStep2()) {
                showStep(3);
            }
        });

        document.getElementById('back-to-step2').addEventListener('click', function() {
            showStep(2);
        });

        document.getElementById('next-to-step4').addEventListener('click', function() {
            if (validateStep3()) {
                updateReview();
                showStep(4);
            }
        });

        document.getElementById('back-to-step3').addEventListener('click', function() {
            showStep(3);
        });

        // Form validation functions
        function validateStep1() {
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const phone = document.getElementById('phone').value;
            
            if (!fullName || !email || !password || !confirmPassword || !phone) {
                alert('Please fill in all fields');
                return false;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return false;
            }
            
            // Password strength validation
            const hasCapital = /[A-Z]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            
            if (!hasCapital || !hasSpecial || !hasNumber) {
                alert('Password must contain at least one capital letter, one special character, and one number.');
                return false;
            }
            
            return true;
        }

        function validateStep2() {
            const instagram = document.getElementById('instagram').value;
            const instagramFollowers = document.getElementById('instagramFollowers').value;
            const instagramUrl = document.getElementById('instagramUrl').value;
            
            const facebook = document.getElementById('facebook').value;
            const facebookFollowers = document.getElementById('facebookFollowers').value;
            const facebookUrl = document.getElementById('facebookUrl').value;
            
            const tiktok = document.getElementById('tiktok').value;
            const tiktokFollowers = document.getElementById('tiktokFollowers').value;
            const tiktokUrl = document.getElementById('tiktokUrl').value;
            
            // Instagram is required
            if (!instagram || !instagramFollowers || !instagramUrl) {
                alert('Please fill in all Instagram fields (required)');
                return false;
            }
            
            // At least one other platform (Facebook or TikTok) is required
            const hasFacebook = facebook && facebookFollowers && facebookUrl;
            const hasTikTok = tiktok && tiktokFollowers && tiktokUrl;
            
            if (!hasFacebook && !hasTikTok) {
                alert('Please provide at least one additional social media platform (Facebook or TikTok)');
                return false;
            }
            
            // If Facebook is partially filled, all fields must be filled
            if (facebook || facebookFollowers || facebookUrl) {
                if (!hasFacebook) {
                    alert('Please fill in all Facebook fields or leave them all empty');
                    return false;
                }
            }
            
            // If TikTok is partially filled, all fields must be filled
            if (tiktok || tiktokFollowers || tiktokUrl) {
                if (!hasTikTok) {
                    alert('Please fill in all TikTok fields or leave them all empty');
                    return false;
                }
            }
            
            return true;
        }

        function validateStep3() {
            const checkboxes = document.querySelectorAll('input[name="niches"]:checked');
            
            if (checkboxes.length === 0) {
                document.getElementById('nichesError').classList.remove('hidden');
                return false;
            }
            
            document.getElementById('nichesError').classList.add('hidden');
            return true;
        }

        // Update review section
        function updateReview() {
            document.getElementById('review-fullName').textContent = document.getElementById('fullName').value;
            document.getElementById('review-email').textContent = document.getElementById('email').value;
            document.getElementById('review-phone').textContent = document.getElementById('phone').value;
            
            // Clear previous social media review
            const socialMediaReview = document.getElementById('social-media-review');
            socialMediaReview.innerHTML = '';
            
            // Add Instagram to review
            const instagram = document.getElementById('instagram').value;
            const instagramFollowers = document.getElementById('instagramFollowers').value;
            const instagramUrl = document.getElementById('instagramUrl').value;
            
            if (instagram && instagramFollowers && instagramUrl) {
                const instagramDiv = document.createElement('div');
                instagramDiv.innerHTML = `
                    <p class="text-sm text-gray-600">Instagram</p>
                    <p class="font-medium text-gray-800">${instagram}</p>
                    <p class="text-xs text-gray-600">${parseInt(instagramFollowers).toLocaleString()} followers</p>
                    <a href="${instagramUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">View Profile</a>
                `;
                socialMediaReview.appendChild(instagramDiv);
            }
            
            // Add Facebook to review if provided
            const facebook = document.getElementById('facebook').value;
            const facebookFollowers = document.getElementById('facebookFollowers').value;
            const facebookUrl = document.getElementById('facebookUrl').value;
            
            if (facebook && facebookFollowers && facebookUrl) {
                const facebookDiv = document.createElement('div');
                facebookDiv.innerHTML = `
                    <p class="text-sm text-gray-600">Facebook</p>
                    <p class="font-medium text-gray-800">${facebook}</p>
                    <p class="text-xs text-gray-600">${parseInt(facebookFollowers).toLocaleString()} followers</p>
                    <a href="${facebookUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">View Profile</a>
                `;
                socialMediaReview.appendChild(facebookDiv);
            }
            
            // Add TikTok to review if provided
            const tiktok = document.getElementById('tiktok').value;
            const tiktokFollowers = document.getElementById('tiktokFollowers').value;
            const tiktokUrl = document.getElementById('tiktokUrl').value;
            
            if (tiktok && tiktokFollowers && tiktokUrl) {
                const tiktokDiv = document.createElement('div');
                tiktokDiv.innerHTML = `
                    <p class="text-sm text-gray-600">TikTok</p>
                    <p class="font-medium text-gray-800">${tiktok}</p>
                    <p class="text-xs text-gray-600">${parseInt(tiktokFollowers).toLocaleString()} followers</p>
                    <a href="${tiktokUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">View Profile</a>
                `;
                socialMediaReview.appendChild(tiktokDiv);
            }
            
            document.getElementById('review-total-followers').textContent = document.getElementById('totalFollowers').textContent;
            document.getElementById('review-category').textContent = document.getElementById('category').textContent;
            
            // Update niches
            const nichesContainer = document.getElementById('review-niches');
            nichesContainer.innerHTML = '';
            const selectedNiches = document.querySelectorAll('input[name="niches"]:checked');
            
            selectedNiches.forEach(checkbox => {
                const nicheTag = document.createElement('span');
                nicheTag.className = 'niche-tag';
                nicheTag.textContent = checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1);
                nichesContainer.appendChild(nicheTag);
            });
        }

        // Form submission
        document.getElementById('submit-form').addEventListener('click', function() {
            // Collect form data
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value;
            
            const instagram = document.getElementById('instagram').value;
            const instagramFollowers = parseInt(document.getElementById('instagramFollowers').value) || 0;
            const instagramUrl = document.getElementById('instagramUrl').value;
            
            const facebook = document.getElementById('facebook').value;
            const facebookFollowers = parseInt(document.getElementById('facebookFollowers').value) || 0;
            const facebookUrl = document.getElementById('facebookUrl').value;
            
            const tiktok = document.getElementById('tiktok').value;
            const tiktokFollowers = parseInt(document.getElementById('tiktokFollowers').value) || 0;
            const tiktokUrl = document.getElementById('tiktokUrl').value;
            
            const totalFollowers = parseInt(document.getElementById('totalFollowers').textContent.replace(/,/g, ''));
            const category = document.getElementById('category').textContent;
            
            const selectedNiches = Array.from(document.querySelectorAll('input[name="niches"]:checked')).map(cb => cb.value);
            
            // Create user with Firebase Auth
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // User created successfully
                    const user = userCredential.user;
                    
                    // Prepare social media data
                    const socialMedia = {
                        instagram: {
                            username: instagram,
                            followers: instagramFollowers,
                            url: instagramUrl
                        }
                    };
                    
                    // Add Facebook if provided
                    if (facebook && facebookFollowers && facebookUrl) {
                        socialMedia.facebook = {
                            username: facebook,
                            followers: facebookFollowers,
                            url: facebookUrl
                        };
                    }
                    
                    // Add TikTok if provided
                    if (tiktok && tiktokFollowers && tiktokUrl) {
                        socialMedia.tiktok = {
                            username: tiktok,
                            followers: tiktokFollowers,
                            url: tiktokUrl
                        };
                    }
                    
                    // Save additional user data to Firestore
                    return db.collection('influencers').doc(user.uid).set({
                        fullName: fullName,
                        email: email,
                        phone: phone,
                        socialMedia: socialMedia,
                        totalFollowers: totalFollowers,
                        category: category,
                        niches: selectedNiches,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'pending' // pending, approved, rejected
                    });
                })
                .then(() => {
                    // Show success step
                    document.getElementById('step-4').classList.remove('active');
                    document.getElementById('success-step').classList.add('active');
                })
                .catch((error) => {
                    console.error('Error creating user:', error);
                    alert('Error creating account: ' + error.message);
                });
        });

        // Password strength checker (from original code)
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

        // Password match checker (from original code)
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

        // Calculate total followers and determine category (from original code)
        function calculateTotalFollowers() {
            const instagramFollowers = parseInt(document.getElementById('instagramFollowers').value) || 0;
            const facebookFollowers = parseInt(document.getElementById('facebookFollowers').value) || 0;
            const tiktokFollowers = parseInt(document.getElementById('tiktokFollowers').value) || 0;
            
            const total = instagramFollowers + facebookFollowers + tiktokFollowers;
            document.getElementById('totalFollowers').textContent = total.toLocaleString();
            
            let category = '';
            if (total >= 500000) {
                category = 'Mega Influencer';
            } else if (total >= 100001) {
                category = 'Macro Influencer';
            } else if (total >= 10001) {
                category = 'Micro Influencer';
            } else if (total >= 1000) {
                category = 'Nano Influencer';
            } else {
                category = 'Below minimum threshold';
            }
            
            document.getElementById('category').textContent = category;
        }

        // Update niches selection (from original code)
        function updateNiches() {
            const checkboxes = document.querySelectorAll('input[name="niches"]:checked');
            const nichesError = document.getElementById('nichesError');
            
            if (checkboxes.length > 3) {
                // Uncheck the last checkbox
                const lastChecked = checkboxes[checkboxes.length - 1];
                lastChecked.checked = false;
                nichesError.textContent = 'Maximum 3 niches allowed';
                nichesError.classList.remove('hidden');
                setTimeout(() => {
                    nichesError.classList.add('hidden');
                }, 3000);
            } else if (checkboxes.length === 0) {
                nichesError.textContent = 'Please select at least one niche';
                nichesError.classList.remove('hidden');
            } else {
                nichesError.classList.add('hidden');
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            calculateTotalFollowers();
            updateProgress();
        });
    