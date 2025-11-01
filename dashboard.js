 // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.add('open');
        });
        
        document.getElementById('close-menu').addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.remove('open');
        });
        
        // Notification form submission
        document.getElementById('notify-form').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('success-message').classList.add('show');
            this.reset();
            
            // Hide success message after 5 seconds
            setTimeout(function() {
                document.getElementById('success-message').classList.remove('show');
            }, 5000);
        });
        
        // Countdown Timer
        function updateCountdown() {
            // Set the date we're counting down to (30 days from now)
            const countDownDate = new Date();
            countDownDate.setDate(countDownDate.getDate() + 30);
            
            // Update the count down every 1 second
            const x = setInterval(function() {
                // Get today's date and time
                const now = new Date().getTime();
                
                // Find the distance between now and the count down date
                const distance = countDownDate - now;
                
                // Time calculations for days, hours, minutes and seconds
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                // Display the result in the elements
                document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
                document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
                document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
                document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
                
                // If the count down is finished, write some text
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("days").innerHTML = "00";
                    document.getElementById("hours").innerHTML = "00";
                    document.getElementById("minutes").innerHTML = "00";
                    document.getElementById("seconds").innerHTML = "00";
                }
            }, 1000);
        }
        
        // Initialize countdown
        updateCountdown();
        
        // GSAP Animations
        gsap.from(".dashboard-icon", {duration: 1, y: -50, opacity: 0, ease: "power2.out"});
        gsap.from(".coming-soon-title", {duration: 1, y: 50, opacity: 0, delay: 0.2, ease: "power2.out"});
        gsap.from(".coming-soon-subtitle", {duration: 1, y: 50, opacity: 0, delay: 0.4, ease: "power2.out"});
        gsap.from(".countdown-item", {duration: 0.8, y: 30, opacity: 0, delay: 0.6, stagger: 0.1, ease: "power2.out"});
        gsap.from(".notify-form", {duration: 1, y: 30, opacity: 0, delay: 0.8, ease: "power2.out"});
        gsap.from(".feature-card", {duration: 0.8, y: 30, opacity: 0, delay: 1, stagger: 0.1, ease: "power2.out"});