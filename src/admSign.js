
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

        // Form submission
        document.getElementById('admin-signup-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate password requirements
            const hasCapital = /[A-Z]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            
            if (!hasCapital || !hasSpecial || !hasNumber) {
                alert('Password must contain at least one capital letter, one special character, and one number.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            
            try {
                // Create user with Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Save admin data to Firestore
                await db.collection('admins').doc(user.uid).set({
                    email: email,
                    role: 'admin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'active'
                });
                
                // Show success message
                alert('Admin account created successfully!');
                
                // Redirect to admin dashboard
                window.location.href = 'adminDashboard.html';
                
            } catch (error) {
                console.error('Error creating admin account:', error);
                alert('Error creating account: ' + error.message);
            }
        });
    