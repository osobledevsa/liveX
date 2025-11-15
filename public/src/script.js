
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
        const db = firebase.firestore();

        // Splash Screen Animation
        document.addEventListener('DOMContentLoaded', function() {
            const logoFlip = document.getElementById('logoFlip');
            const jobText = document.getElementById('jobText');
            const splashScreen = document.getElementById('splashScreen');
            const mainContent = document.getElementById('mainContent');
            
            // Animation sequence - 1.4 seconds total
            setTimeout(() => {
                // Step 1: Start the flip animation (1.2 seconds)
                logoFlip.classList.add('flipped');
                
                // Step 2: Show job text after flip is mostly complete (0.8 seconds)
                setTimeout(() => {
                    jobText.classList.add('fade-in');
                    
                    // Step 3: Slide up splash screen (0.4 seconds)
                    setTimeout(() => {
                        splashScreen.classList.add('slide-up');
                        
                        // Show main content
                        setTimeout(() => {
                            mainContent.classList.add('show');
                            
                            // Initialize landing page functionality
                            initLandingPage();
                        }, 400);
                    }, 1400);
                }, 900);
            }, 200);
        });

        // Landing Page Functionality
        function initLandingPage() {
            // Mobile menu toggle
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const closeMenu = document.getElementById('close-menu');
            
            if (mobileMenuButton) {
                mobileMenuButton.addEventListener('click', function() {
                    mobileMenu.classList.add('open');
                });
            }
            
            if (closeMenu) {
                closeMenu.addEventListener('click', function() {
                    mobileMenu.classList.remove('open');
                });
            }

            // Instant scroll to sections (no smooth scrolling)
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    // Only handle internal page anchors, not external links
                    if (this.getAttribute('href').startsWith('#') && 
                        !this.getAttribute('href').includes('.html')) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            // Instant jump to section
                            window.scrollTo({
                                top: target.offsetTop - 80,
                                behavior: 'auto'
                            });
                        }
                    }
                });
            });

            // FAQ Accordion
            const faqQuestions = document.querySelectorAll('.faq-question');
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    const isActive = answer.classList.contains('active');
                    
                    // Close all answers
                    document.querySelectorAll('.faq-answer').forEach(ans => {
                        ans.classList.remove('active');
                    });
                    document.querySelectorAll('.faq-question').forEach(q => {
                        q.classList.remove('active');
                    });
                    
                    // Open clicked answer if it wasn't active
                    if (!isActive) {
                        answer.classList.add('active');
                        question.classList.add('active');
                    }
                });
            });

            // Contact Popup
            const contactLink = document.getElementById('contact-link');
            const contactPopup = document.getElementById('contact-popup');
            const closePopup = document.getElementById('close-popup');
            
            if (contactLink) {
                contactLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    contactPopup.classList.add('active');
                });
            }
            
            if (closePopup) {
                closePopup.addEventListener('click', function() {
                    contactPopup.classList.remove('active');
                });
            }
            
            // Close popup when clicking outside
            contactPopup.addEventListener('click', function(e) {
                if (e.target === contactPopup) {
                    contactPopup.classList.remove('active');
                }
            });

            // Demo Booking Modal
            const bookDemoBtn = document.getElementById('book-demo-btn');
            const demoModal = document.getElementById('demo-modal');
            const closeModal = document.getElementById('close-modal');
            const demoForm = document.getElementById('demo-form');
            const successMessage = document.getElementById('success-message');
            
            if (bookDemoBtn) {
                bookDemoBtn.addEventListener('click', function() {
                    demoModal.classList.add('active');
                });
            }
            
            if (closeModal) {
                closeModal.addEventListener('click', function() {
                    demoModal.classList.remove('active');
                });
            }
            
            // Close modal when clicking outside
            demoModal.addEventListener('click', function(e) {
                if (e.target === demoModal) {
                    demoModal.classList.remove('active');
                }
            });
            
            // Handle form submission
            if (demoForm) {
                demoForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Get form values
                    const name = document.getElementById('name').value;
                    const email = document.getElementById('email').value;
                    const contact = document.getElementById('contact').value;
                    const reason = document.getElementById('reason').value;
                    
                    // Save to Firebase
                    db.collection('demoRequests').add({
                        name: name,
                        email: email,
                        contact: contact,
                        reason: reason,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(function(docRef) {
                        console.log("Document written with ID: ", docRef.id);
                        
                        // Show success message
                        successMessage.style.display = 'block';
                        
                        // Reset form
                        demoForm.reset();
                        
                        // Close modal after 3 seconds
                        setTimeout(function() {
                            demoModal.classList.remove('active');
                            successMessage.style.display = 'none';
                        }, 3000);
                    })
                    .catch(function(error) {
                        console.error("Error adding document: ", error);
                        alert("There was an error submitting your request. Please try again.");
                    });
                });
            }

            // GSAP Animations (if available)
            if (typeof gsap !== 'undefined') {
                // Register ScrollTrigger
                gsap.registerPlugin(ScrollTrigger);
                
                // Animate elements on scroll
                gsap.utils.toArray('.card-hover').forEach(card => {
                    gsap.fromTo(card, 
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 80%",
                                end: "bottom 20%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });
                
                // Animate roadmap steps
                gsap.utils.toArray('.roadmap-step').forEach(step => {
                    gsap.fromTo(step, 
                        { x: step.classList.contains('roadmap-step') && step.style.flexDirection === 'row-reverse' ? -100 : 100, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            scrollTrigger: {
                                trigger: step,
                                start: "top 80%",
                                end: "bottom 20%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });
                
                // Animate stats counters
                gsap.utils.toArray('.stats-counter').forEach(counter => {
                    const targetValue = counter.innerText;
                    const isMoney = targetValue.includes('Ksh');
                    const isPercentage = targetValue.includes('%');
                    let numericValue = parseFloat(targetValue.replace(/[^0-9.]/g, ''));
                    
                    gsap.fromTo(counter, 
                        { innerText: 0 },
                        {
                            innerText: numericValue,
                            duration: 2,
                            ease: "power1.out",
                            scrollTrigger: {
                                trigger: counter,
                                start: "top 80%"
                            },
                            snap: { innerText: 1 },
                            onUpdate: function() {
                                const currentValue = parseFloat(counter.innerText);
                                if (isMoney) {
                                    counter.innerText = 'Ksh' + (currentValue < 1000 ? currentValue : (currentValue/1000).toFixed(1) + 'M');
                                } else if (isPercentage) {
                                    counter.innerText = currentValue + '%';
                                } else {
                                    counter.innerText = Math.floor(currentValue) + (targetValue.includes('+') ? '+' : '');
                                }
                            }
                        }
                    );
                });
            }
        }
    