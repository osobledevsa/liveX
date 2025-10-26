
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDummyKeyForDemo",
            authDomain: "livex-demo.firebaseapp.com",
            projectId: "livex-demo",
            storageBucket: "livex-demo.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456"
        };
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        
        // Mobile menu functionality
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const closeMenuButton = document.getElementById('close-menu');
            
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.add('open');
            });
            
            closeMenuButton.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
            });
            
            // Close mobile menu when clicking on a link
            const mobileMenuLinks = mobileMenu.querySelectorAll('a');
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('open');
                });
            });
            
            // Demo modal functionality
            const bookDemoBtn = document.getElementById('book-demo-btn');
            const mobileBookDemoBtn = document.getElementById('mobile-book-demo');
            const heroBookDemoBtn = document.getElementById('hero-book-demo');
            const demoModal = document.getElementById('demo-modal');
            const closeModalBtn = document.getElementById('close-modal');
            const demoForm = document.getElementById('demo-form');
            const successMessage = document.getElementById('success-message');
            
            function openDemoModal() {
                demoModal.classList.add('open');
                successMessage.classList.remove('show');
            }
            
            function closeDemoModal() {
                demoModal.classList.remove('open');
            }
            
            bookDemoBtn.addEventListener('click', openDemoModal);
            mobileBookDemoBtn.addEventListener('click', openDemoModal);
            heroBookDemoBtn.addEventListener('click', openDemoModal);
            closeModalBtn.addEventListener('click', closeDemoModal);
            
            // Close modal when clicking outside the content
            demoModal.addEventListener('click', function(e) {
                if (e.target === demoModal) {
                    closeDemoModal();
                }
            });
            
            // Form submission to Firebase
            demoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const userType = document.getElementById('user-type').value;
                const date = document.getElementById('date').value;
                
                // Save to Firebase
                db.collection('demoRequests').add({
                    name: name,
                    email: email,
                    phone: phone,
                    userType: userType,
                    preferredDate: date,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(function(docRef) {
                    console.log("Demo request saved with ID: ", docRef.id);
                    
                    // Show success message
                    successMessage.classList.add('show');
                    
                    // Reset form
                    demoForm.reset();
                    
                    // Close modal after 2 seconds
                    setTimeout(function() {
                        closeDemoModal();
                    }, 2000);
                })
                .catch(function(error) {
                    console.error("Error adding demo request: ", error);
                    alert('There was an error submitting your request. Please try again.');
                });
            });
            
            // GSAP Animations
            gsap.registerPlugin(ScrollTrigger);
            
            // Animate elements on scroll
            gsap.utils.toArray('.card-hover, .tier-card, .dashboard-preview, .step-card, .testimonial-card').forEach(element => {
                gsap.from(element, {
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
            
            // Animate stats counters
            const counters = document.querySelectorAll('.stats-counter');
            counters.forEach(counter => {
                const targetText = counter.innerText;
                let target;
                
                if (targetText.includes('Ksh')) {
                    target = 1500000; // Ksh1.5M
                } else if (targetText.includes('K')) {
                    target = 10000; // 10K
                } else if (targetText.includes('%')) {
                    target = 95; // 95%
                } else {
                    target = 10; // 10+
                }
                
                const increment = target / 100;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        
                        if (targetText.includes('Ksh')) {
                            counter.innerText = 'Ksh' + Math.ceil(current/1000000) + 'M+';
                        } else if (targetText.includes('K')) {
                            counter.innerText = Math.ceil(current/1000) + 'K+';
                        } else if (targetText.includes('%')) {
                            counter.innerText = Math.ceil(current) + '%';
                        } else {
                            counter.innerText = Math.ceil(current) + '+';
                        }
                        
                        setTimeout(updateCounter, 20);
                    } else {
                        counter.innerText = targetText;
                    }
                };
                
                ScrollTrigger.create({
                    trigger: counter,
                    start: "top 80%",
                    onEnter: updateCounter,
                    once: true
                });
            });
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
    
