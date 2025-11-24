
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
        const storage = firebase.storage();

        // Global variables
        let currentUser = null;
        let currentProfile = null;
        let allCampaigns = [];
        let selectedCampaign = null;
        let myCampaigns = [];
        let mySubmissions = [];
        let profileCompletionStep = 1;

        // Check authentication on page load
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadProfile();
                
                // Check if profile is completed
                if (currentProfile && currentProfile.profileCompleted === false) {
                    // Show profile completion overlay
                    document.getElementById('profile-completion-overlay').style.display = 'flex';
                    document.getElementById('loading-screen').style.display = 'none';
                } else {
                    // Profile is completed, load dashboard
                    await loadCampaigns();
                    await loadMyCampaigns();
                    document.getElementById('loading-screen').style.display = 'none';
                }
            } else {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            }
        });

        // Load influencer profile
        async function loadProfile() {
            try {
                const docRef = db.collection('influencers').doc(currentUser.uid);
                const docSnap = await docRef.get();
                
                if (docSnap.exists) {
                    currentProfile = docSnap.data();
                    // Ensure required fields exist with defaults
                    currentProfile.fullName = currentProfile.fullName || 'Influencer';
                    currentProfile.phone = currentProfile.phone || '';
                    currentProfile.city = currentProfile.city || '';
                    currentProfile.profileCompleted = currentProfile.profileCompleted || false;
                    currentProfile.socialMedia = currentProfile.socialMedia || {};
                    currentProfile.socialMedia.instagram = currentProfile.socialMedia.instagram || {};
                    currentProfile.socialMedia.instagram.username = currentProfile.socialMedia.instagram.username || 'username';
                    currentProfile.socialMedia.facebook = currentProfile.socialMedia.facebook || {};
                    currentProfile.socialMedia.facebook.username = currentProfile.socialMedia.facebook.username || 'username';
                    currentProfile.socialMedia.tiktok = currentProfile.socialMedia.tiktok || {};
                    currentProfile.socialMedia.tiktok.username = currentProfile.socialMedia.tiktok.username || 'username';
                    currentProfile.niches = currentProfile.niches || [];
                    currentProfile.totalFollowers = currentProfile.totalFollowers || 0;
                    currentProfile.category = currentProfile.category || 'Nano';
                    
                    displayProfile();
                } else {
                    console.error('No profile found for user');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                window.location.href = 'login.html';
            }
        }

        // Generate social media links HTML
        function generateSocialMediaLinks(socialMedia) {
            if (!socialMedia) return '';

            const platforms = [
                { name: 'instagram', icon: 'fab fa-instagram', color: 'text-pink-600' },
                { name: 'facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
                { name: 'tiktok', icon: 'fab fa-tiktok', color: 'text-gray-800' }
            ];

            let html = '';
            platforms.forEach(platform => {
                const data = socialMedia[platform.name];
                if (data && data.url) {
                    html += `
                        <a href="${data.url}" target="_blank" class="social-link ${platform.color} hover:underline">
                            <i class="${platform.icon}"></i>
                            <span>${data.username}</span>
                        </a>
                    `;
                }
            });

            return html;
        }

        // Display profile information
        function displayProfile() {
            // Use fullName instead of name
            document.getElementById('profile-name').textContent = currentProfile.fullName || 'Influencer';
            document.getElementById('profile-city').textContent = currentProfile.city || 'Unknown';
            
            // Display social media links
            const socialMediaContainer = document.getElementById('social-media-links');
            socialMediaContainer.innerHTML = generateSocialMediaLinks(currentProfile.socialMedia);
            
            document.getElementById('profile-category').textContent = (currentProfile.category || 'Nano');
            document.getElementById('total-followers').textContent = (currentProfile.totalFollowers || 0).toLocaleString();
            
            // Calculate joined date (approximate)
            const joinedDate = new Date();
            if (currentProfile.createdAt) {
                joinedDate.setTime(currentProfile.createdAt.toDate().getTime());
            } else {
                joinedDate.setDate(joinedDate.getDate() - Math.floor(Math.random() * 90) + 30);
            }
            document.getElementById('profile-joined').textContent = joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            // Display niches
            const nichesContainer = document.getElementById('profile-niches');
            nichesContainer.innerHTML = '';
            
            const niches = currentProfile.niches || [];
            niches.forEach(niche => {
                const nicheTag = document.createElement('span');
                nicheTag.className = 'niche-tag';
                nicheTag.textContent = niche.charAt(0).toUpperCase() + niche.slice(1);
                nichesContainer.appendChild(nicheTag);
            });

            // Load profile picture if exists
            if (currentProfile.profilePictureUrl) {
                const profilePic = document.getElementById('profile-picture');
                profilePic.style.backgroundImage = `url(${currentProfile.profilePictureUrl})`;
                profilePic.style.backgroundSize = 'cover';
                profilePic.style.backgroundPosition = 'center';
                profilePic.innerHTML = '';
            }
        }

        // Profile completion step navigation
        function showProfileCompletionStep(stepNumber) {
            document.querySelectorAll('#profile-completion-form .step-container').forEach(container => {
                container.classList.remove('active');
            });
            document.getElementById(`profile-step-${stepNumber}`).classList.add('active');
            profileCompletionStep = stepNumber;
            
            // Update progress bar
            const progressPercentage = ((stepNumber - 1) / 2) * 100;
            document.getElementById('profile-progress-fill').style.width = `${progressPercentage}%`;
            
            // Update step indicators
            document.querySelectorAll('#profile-completion-form .step-indicator').forEach((indicator, index) => {
                const stepNum = index + 1;
                indicator.classList.remove('active', 'completed');
                
                if (stepNum < stepNumber) {
                    indicator.classList.add('completed');
                    indicator.innerHTML = '<i class="fas fa-check"></i>';
                } else if (stepNum === stepNumber) {
                    indicator.classList.add('active');
                    indicator.textContent = stepNum;
                } else {
                    indicator.textContent = stepNum;
                }
            });
        }

        // Profile completion form navigation
        document.getElementById('profile-next-to-step2').addEventListener('click', function() {
            if (validateProfileStep1()) {
                showProfileCompletionStep(2);
            }
        });

        document.getElementById('profile-back-to-step1').addEventListener('click', function() {
            showProfileCompletionStep(1);
        });

        document.getElementById('profile-next-to-step3').addEventListener('click', function() {
            if (validateProfileStep2()) {
                updateProfileReview();
                showProfileCompletionStep(3);
            }
        });

        document.getElementById('profile-back-to-step2').addEventListener('click', function() {
            showProfileCompletionStep(2);
        });

        // Profile completion form validation
        function validateProfileStep1() {
            const instagram = document.getElementById('profile-instagram').value;
            const instagramFollowers = document.getElementById('profile-instagramFollowers').value;
            const instagramUrl = document.getElementById('profile-instagramUrl').value;
            
            const facebook = document.getElementById('profile-facebook').value;
            const facebookFollowers = document.getElementById('profile-facebookFollowers').value;
            const facebookUrl = document.getElementById('profile-facebookUrl').value;
            
            const tiktok = document.getElementById('profile-tiktok').value;
            const tiktokFollowers = document.getElementById('profile-tiktokFollowers').value;
            const tiktokUrl = document.getElementById('profile-tiktokUrl').value;
            
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

        function validateProfileStep2() {
            const checkboxes = document.querySelectorAll('input[name="profile-niches"]:checked');
            
            if (checkboxes.length === 0) {
                document.getElementById('profile-nichesError').classList.remove('hidden');
                return false;
            }
            
            document.getElementById('profile-nichesError').classList.add('hidden');
            return true;
        }

        // Update profile review section
        function updateProfileReview() {
            // Clear previous social media review
            const socialMediaReview = document.getElementById('profile-social-media-review');
            socialMediaReview.innerHTML = '';
            
            // Add Instagram to review
            const instagram = document.getElementById('profile-instagram').value;
            const instagramFollowers = document.getElementById('profile-instagramFollowers').value;
            const instagramUrl = document.getElementById('profile-instagramUrl').value;
            
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
            const facebook = document.getElementById('profile-facebook').value;
            const facebookFollowers = document.getElementById('profile-facebookFollowers').value;
            const facebookUrl = document.getElementById('profile-facebookUrl').value;
            
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
            const tiktok = document.getElementById('profile-tiktok').value;
            const tiktokFollowers = document.getElementById('profile-tiktokFollowers').value;
            const tiktokUrl = document.getElementById('profile-tiktokUrl').value;
            
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
            
            document.getElementById('profile-review-total-followers').textContent = document.getElementById('profile-totalFollowers').textContent;
            document.getElementById('profile-review-category').textContent = document.getElementById('profile-category').textContent;
            
            // Update niches
            const nichesContainer = document.getElementById('profile-review-niches');
            nichesContainer.innerHTML = '';
            const selectedNiches = document.querySelectorAll('input[name="profile-niches"]:checked');
            
            selectedNiches.forEach(checkbox => {
                const nicheTag = document.createElement('span');
                nicheTag.className = 'niche-tag';
                nicheTag.textContent = checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1);
                nichesContainer.appendChild(nicheTag);
            });
        }

        // Calculate total followers and determine category for profile completion
        function calculateProfileTotalFollowers() {
            const instagramFollowers = parseInt(document.getElementById('profile-instagramFollowers').value) || 0;
            const facebookFollowers = parseInt(document.getElementById('profile-facebookFollowers').value) || 0;
            const tiktokFollowers = parseInt(document.getElementById('profile-tiktokFollowers').value) || 0;
            
            const total = instagramFollowers + facebookFollowers + tiktokFollowers;
            document.getElementById('profile-totalFollowers').textContent = total.toLocaleString();
            
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
            
            document.getElementById('profile-category').textContent = category;
        }

        // Update niches selection for profile completion
        function updateProfileNiches() {
            const checkboxes = document.querySelectorAll('input[name="profile-niches"]:checked');
            const nichesError = document.getElementById('profile-nichesError');
            
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

        // Submit profile completion form
        document.getElementById('profile-submit-form').addEventListener('click', async function() {
            try {
                // Collect form data
                const instagram = document.getElementById('profile-instagram').value;
                const instagramFollowers = parseInt(document.getElementById('profile-instagramFollowers').value) || 0;
                const instagramUrl = document.getElementById('profile-instagramUrl').value;
                
                const facebook = document.getElementById('profile-facebook').value;
                const facebookFollowers = parseInt(document.getElementById('profile-facebookFollowers').value) || 0;
                const facebookUrl = document.getElementById('profile-facebookUrl').value;
                
                const tiktok = document.getElementById('profile-tiktok').value;
                const tiktokFollowers = parseInt(document.getElementById('profile-tiktokFollowers').value) || 0;
                const tiktokUrl = document.getElementById('profile-tiktokUrl').value;
                
                const totalFollowers = parseInt(document.getElementById('profile-totalFollowers').textContent.replace(/,/g, ''));
                const category = document.getElementById('profile-category').textContent;
                
                const selectedNiches = Array.from(document.querySelectorAll('input[name="profile-niches"]:checked')).map(cb => cb.value);
                
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
                
                // Update user profile in Firestore
                await db.collection('influencers').doc(currentUser.uid).update({
                    socialMedia: socialMedia,
                    totalFollowers: totalFollowers,
                    category: category,
                    niches: selectedNiches,
                    profileCompleted: true,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update current profile object
                currentProfile.socialMedia = socialMedia;
                currentProfile.totalFollowers = totalFollowers;
                currentProfile.category = category;
                currentProfile.niches = selectedNiches;
                currentProfile.profileCompleted = true;
                
                // Hide profile completion overlay
                document.getElementById('profile-completion-overlay').style.display = 'none';
                
                // Load dashboard data
                await loadCampaigns();
                await loadMyCampaigns();
                
                // Display updated profile
                displayProfile();
                
                alert('Profile completed successfully! You now have access to all dashboard features.');
            } catch (error) {
                console.error('Error completing profile:', error);
                alert('Error completing profile. Please try again.');
            }
        });

        // Open edit profile modal
        function openEditProfile() {
            // Populate form with current profile data
            document.getElementById('edit-fullName').value = currentProfile.fullName || '';
            document.getElementById('edit-phone').value = currentProfile.phone || '';
            document.getElementById('edit-city').value = currentProfile.city || '';
            
            // Populate social media data
            if (currentProfile.socialMedia && currentProfile.socialMedia.instagram) {
                document.getElementById('edit-instagram').value = currentProfile.socialMedia.instagram.username || '';
                document.getElementById('edit-instagramFollowers').value = currentProfile.socialMedia.instagram.followers || 0;
                document.getElementById('edit-instagramUrl').value = currentProfile.socialMedia.instagram.url || '';
            }
            
            if (currentProfile.socialMedia && currentProfile.socialMedia.facebook) {
                document.getElementById('edit-facebook').value = currentProfile.socialMedia.facebook.username || '';
                document.getElementById('edit-facebookFollowers').value = currentProfile.socialMedia.facebook.followers || 0;
                document.getElementById('edit-facebookUrl').value = currentProfile.socialMedia.facebook.url || '';
            }
            
            if (currentProfile.socialMedia && currentProfile.socialMedia.tiktok) {
                document.getElementById('edit-tiktok').value = currentProfile.socialMedia.tiktok.username || '';
                document.getElementById('edit-tiktokFollowers').value = currentProfile.socialMedia.tiktok.followers || 0;
                document.getElementById('edit-tiktokUrl').value = currentProfile.socialMedia.tiktok.url || '';
            }
            
            // Calculate total followers
            calculateEditTotalFollowers();
            
            // Populate niches
            const nicheCheckboxes = document.querySelectorAll('input[name="edit-niches"]');
            nicheCheckboxes.forEach(checkbox => {
                checkbox.checked = currentProfile.niches && currentProfile.niches.includes(checkbox.value);
            });
            
            // Show modal
            document.getElementById('edit-profile-modal').classList.add('active');
        }

        // Close edit profile modal
        function closeEditProfileModal() {
            document.getElementById('edit-profile-modal').classList.remove('active');
        }

        // Calculate total followers for edit profile
        function calculateEditTotalFollowers() {
            const instagramFollowers = parseInt(document.getElementById('edit-instagramFollowers').value) || 0;
            const facebookFollowers = parseInt(document.getElementById('edit-facebookFollowers').value) || 0;
            const tiktokFollowers = parseInt(document.getElementById('edit-tiktokFollowers').value) || 0;
            
            const total = instagramFollowers + facebookFollowers + tiktokFollowers;
            document.getElementById('edit-totalFollowers').textContent = total.toLocaleString();
            
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
            
            document.getElementById('edit-category').textContent = category;
        }

        // Submit edit profile form
        document.getElementById('edit-profile-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // Collect form data
                const fullName = document.getElementById('edit-fullName').value;
                const phone = document.getElementById('edit-phone').value;
                const city = document.getElementById('edit-city').value;
                
                const instagram = document.getElementById('edit-instagram').value;
                const instagramFollowers = parseInt(document.getElementById('edit-instagramFollowers').value) || 0;
                const instagramUrl = document.getElementById('edit-instagramUrl').value;
                
                const facebook = document.getElementById('edit-facebook').value;
                const facebookFollowers = parseInt(document.getElementById('edit-facebookFollowers').value) || 0;
                const facebookUrl = document.getElementById('edit-facebookUrl').value;
                
                const tiktok = document.getElementById('edit-tiktok').value;
                const tiktokFollowers = parseInt(document.getElementById('edit-tiktokFollowers').value) || 0;
                const tiktokUrl = document.getElementById('edit-tiktokUrl').value;
                
                const totalFollowers = parseInt(document.getElementById('edit-totalFollowers').textContent.replace(/,/g, ''));
                const category = document.getElementById('edit-category').textContent;
                
                const selectedNiches = Array.from(document.querySelectorAll('input[name="edit-niches"]:checked')).map(cb => cb.value);
                
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
                
                // Update user profile in Firestore
                await db.collection('influencers').doc(currentUser.uid).update({
                    fullName: fullName,
                    phone: phone,
                    city: city,
                    socialMedia: socialMedia,
                    totalFollowers: totalFollowers,
                    category: category,
                    niches: selectedNiches,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update current profile object
                currentProfile.fullName = fullName;
                currentProfile.phone = phone;
                currentProfile.city = city;
                currentProfile.socialMedia = socialMedia;
                currentProfile.totalFollowers = totalFollowers;
                currentProfile.category = category;
                currentProfile.niches = selectedNiches;
                
                // Close modal
                closeEditProfileModal();
                
                // Display updated profile
                displayProfile();
                
                // Reload campaigns to reflect any changes in matching
                await loadCampaigns();
                
                alert('Profile updated successfully!');
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Error updating profile. Please try again.');
            }
        });

        // Load available campaigns
        async function loadCampaigns() {
            try {
                console.log('Loading available campaigns...');
                
                // Load all active campaigns
                const snapshot = await db.collection('campaigns')
                    .where('status', '==', 'active')
                    .get();
                
                allCampaigns = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log('Loaded campaigns:', allCampaigns.length);
                displayAvailableCampaigns();
            } catch (error) {
                console.error('Error loading campaigns:', error);
                // Try without the where clause if the query fails
                try {
                    const snapshot = await db.collection('campaigns').get();
                    allCampaigns = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    
                    // Filter for active campaigns manually
                    allCampaigns = allCampaigns.filter(campaign => campaign.status === 'active');
                    
                    console.log('Loaded campaigns (fallback):', allCampaigns.length);
                    displayAvailableCampaigns();
                } catch (fallbackError) {
                    console.error('Error loading campaigns (fallback):', fallbackError);
                    document.getElementById('available-campaigns').innerHTML = `
                        <div class="text-center py-12">
                            <i class="fas fa-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
                            <p class="text-gray-500 mb-2">Error loading campaigns</p>
                            <p class="text-sm text-gray-400">Please refresh the page or try again later</p>
                        </div>
                    `;
                }
            }
        }

        // Load my campaigns (campaigns the influencer has joined)
        async function loadMyCampaigns() {
            try {
                console.log('Loading my campaigns...');
                
                // Try the collection group query first
                const submissionsSnapshot = await db.collectionGroup('submissions')
                    .where('influencerId', '==', currentUser.uid)
                    .get();
                
                mySubmissions = [];
                submissionsSnapshot.forEach(doc => {
                    mySubmissions.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Fetch campaign details for each submission
                myCampaigns = [];
                for (const submission of mySubmissions) {
                    if (submission.campaignId) {
                        const campaignDoc = await db.collection('campaigns').doc(submission.campaignId).get();
                        if (campaignDoc.exists) {
                            myCampaigns.push({
                                id: campaignDoc.id,
                                ...campaignDoc.data(),
                                submissionStatus: submission.status,
                                submissionId: submission.id
                            });
                        }
                    }
                }
                
                console.log('Loaded my campaigns:', myCampaigns.length);
                displayMyCampaigns();
                updateStats();
            } catch (error) {
                console.error('Error loading my campaigns (collection group):', error);
                
                // Fallback: Load all campaigns and check each one's submissions
                try {
                    console.log('Trying fallback method...');
                    const campaignsSnapshot = await db.collection('campaigns').get();
                    mySubmissions = [];
                    myCampaigns = [];
                    
                    const campaignPromises = campaignsSnapshot.docs.map(async (campaignDoc) => {
                        const campaignId = campaignDoc.id;
                        const campaignData = campaignDoc.data();
                        
                        // Get submissions for this campaign by the current influencer
                        const submissionsSnapshot = await db.collection('campaigns')
                            .doc(campaignId)
                            .collection('submissions')
                            .where('influencerId', '==', currentUser.uid)
                            .get();
                        
                        submissionsSnapshot.forEach(doc => {
                            const submission = {
                                id: doc.id,
                                ...doc.data()
                            };
                            mySubmissions.push(submission);
                            
                            myCampaigns.push({
                                id: campaignId,
                                ...campaignData,
                                submissionStatus: submission.status,
                                submissionId: submission.id
                            });
                        });
                    });
                    
                    await Promise.all(campaignPromises);
                    
                    console.log('Loaded my campaigns (fallback):', myCampaigns.length);
                    displayMyCampaigns();
                    updateStats();
                } catch (fallbackError) {
                    console.error('Error loading my campaigns (fallback):', fallbackError);
                    // Show an error message to the user
                    document.getElementById('my-campaigns').innerHTML = `
                        <div class="text-center py-8">
                            <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
                            <p class="text-gray-500 text-sm">Error loading your campaigns</p>
                            <p class="text-xs text-gray-400 mt-2">Please try again later</p>
                        </div>
                    `;
                }
            }
        }

        // Update stats
        function updateStats() {
            // Calculate pending payment - only include approved submissions (pending_payment or paid)
            let pendingAmount = 0;
            
            // Get all submissions with approved status
            const approvedSubmissions = mySubmissions.filter(sub => 
                sub.status === 'pending_payment' || sub.status === 'paid'
            );
            
            approvedSubmissions.forEach(submission => {
                pendingAmount += submission.amount || getPaymentAmount(submission.campaignCategory);
            });
            
            document.getElementById('pending-payment').textContent = `Ksh ${pendingAmount.toLocaleString()}`;
            
            // Calculate completed campaigns
            const completedCampaigns = myCampaigns.filter(campaign => 
                campaign.submissionStatus === 'paid' || campaign.status === 'completed'
            ).length;
            
            document.getElementById('profile-completed').textContent = `${completedCampaigns} Campaigns`;
        }

        // Display available campaigns with proper matching logic
        function displayAvailableCampaigns() {
            const availableContainer = document.getElementById('available-campaigns');
            
            // Get influencer's category and niches
            const influencerCategory = currentProfile.category || 'Nano';
            const influencerNiches = currentProfile.niches || [];
            
            // Filter out campaigns the influencer has already joined
            const joinedCampaignIds = myCampaigns.map(campaign => campaign.id);
            
            // Filter campaigns by category, niches, availability, and not joined
            const availableCampaigns = allCampaigns.filter(campaign => {
                // Check if campaign has available spots
                if (campaign.spotsAvailable <= 0) return false;
                
                // Check if influencer has already joined
                if (joinedCampaignIds.includes(campaign.id)) return false;
                
                // Check category match - FIXED: Handle different category formats
                let campaignCategory = campaign.category || '';
                let influencerCat = influencerCategory || '';
                
                // Normalize category names for comparison
                campaignCategory = campaignCategory.toString().toLowerCase().replace(' influencer', '');
                influencerCat = influencerCat.toString().toLowerCase().replace(' influencer', '');
                
                if (campaignCategory !== influencerCat) return false;
                
                // Check niche match: at least one common niche OR no niches specified in campaign
                const campaignNiches = campaign.niches || [];
                
                // If campaign has no niches specified, show it to all influencers in the same category
                if (campaignNiches.length === 0) return true;
                
                // If campaign has niches, check for at least one match
                const hasCommonNiche = campaignNiches.some(niche => 
                    influencerNiches.includes(niche)
                );
                
                return hasCommonNiche;
            });
            
            // Display available campaigns
            if (availableCampaigns.length === 0) {
                availableContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-briefcase text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500 mb-2">No available campaigns at the moment</p>
                        <p class="text-sm text-gray-400">Check back later for new opportunities</p>
                    </div>
                `;
            } else {
                availableContainer.innerHTML = availableCampaigns.map(campaign => createCampaignCard(campaign, 'available')).join('');
            }
        }

        // Display my campaigns
        function displayMyCampaigns() {
            const myContainer = document.getElementById('my-campaigns');
            const paymentsContainer = document.getElementById('upcoming-payments');
            
            // Clear existing content
            myContainer.innerHTML = '';
            paymentsContainer.innerHTML = '';
            
            // Get approved payments (pending_payment or paid)
            const approvedPayments = mySubmissions.filter(sub => 
                sub.status === 'pending_payment' || sub.status === 'paid'
            );
            
            // Display my campaigns
            if (myCampaigns.length === 0) {
                myContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-briefcase text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500 text-sm">You haven't joined any campaigns yet</p>
                    </div>
                `;
            } else {
                myCampaigns.forEach(campaign => {
                    myContainer.innerHTML += createMyCampaignCard(campaign);
                });
            }
            
            // Display approved payments
            displayApprovedPayments(approvedPayments);
        }

        // Display approved payments
        function displayApprovedPayments(payments) {
            const paymentsContainer = document.getElementById('upcoming-payments');
            
            if (payments.length === 0) {
                paymentsContainer.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 text-sm">No upcoming payments</p>
                    </div>
                `;
            } else {
                paymentsContainer.innerHTML = payments.map(payment => createPaymentCard(payment)).join('');
            }
        }

        // Create campaign card for available campaigns
        function createCampaignCard(campaign, type) {
            const paymentAmount = getPaymentAmount(campaign.category);
            const statusBadge = getStatusBadge(type === 'available' ? 'available' : (campaign.submissionStatus || 'joined'));
            
            // Calculate match percentage for available campaigns
            let matchIndicator = '';
            if (type === 'available') {
                const influencerNiches = currentProfile.niches || [];
                const campaignNiches = campaign.niches || [];
                const commonNiches = influencerNiches.filter(niche => campaignNiches.includes(niche));
                const matchPercentage = Math.round((commonNiches.length / Math.max(influencerNiches.length, campaignNiches.length, 1)) * 100);
                
                matchIndicator = `
                    <div class="match-indicator">
                        <i class="fas fa-check-circle"></i>
                        ${matchPercentage}% Match
                    </div>
                `;
            }
            
            return `
                <div class="campaign-card bg-white p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">${campaign.name || 'Unnamed Campaign'}</h3>
                            <p class="text-gray-600 text-sm mb-2">by ${campaign.brand || 'Unknown Brand'}</p>
                            <div class="flex items-center space-x-2 mb-3">
                                ${statusBadge}
                                ${matchIndicator}
                                ${type === 'available' ? `
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        ${campaign.spotsAvailable || 0} spots left
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-orange-600">Ksh ${paymentAmount.toLocaleString()}</p>
                            <p class="text-xs text-gray-500">Payment</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-bullseye text-blue-500"></i>
                            <span>${campaign.goal || 'Brand Awareness'}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-calendar text-green-500"></i>
                            <span>${campaign.deadline || '7 days'}</span>
                        </div>
                    </div>
                    
                    <button onclick="${type === 'available' ? `showCampaignDetails('${campaign.id}')` : `showSubmissionForm('${campaign.id}')`}" class="w-full btn-primary py-2 rounded-lg">
                        ${type === 'available' ? 'View Details' : 'Submit Work'}
                    </button>
                </div>
            `;
        }

        // Create campaign card for my campaigns with proper submission status handling
        function createMyCampaignCard(campaign) {
            const paymentAmount = getPaymentAmount(campaign.category);
            const statusBadge = getStatusBadge(campaign.submissionStatus || 'joined');
            
            // Determine button based on submission status
            let actionButton = '';
            const submissionStatus = campaign.submissionStatus || 'joined';
            
            switch(submissionStatus) {
                case 'joined':
                    actionButton = `<button onclick="showSubmissionForm('${campaign.id}')" class="w-full btn-primary py-2 rounded-lg">Submit Work</button>`;
                    break;
                case 'submitted':
                    actionButton = `<button class="w-full btn-disabled py-2 rounded-lg" disabled>Under Review</button>`;
                    break;
                case 'rejected':
                    actionButton = `<button onclick="showSubmissionForm('${campaign.id}')" class="w-full btn-primary py-2 rounded-lg">Resubmit Work</button>`;
                    break;
                case 'pending_payment':
                case 'paid':
                    actionButton = `<button class="w-full btn-disabled py-2 rounded-lg" disabled>Payment ${submissionStatus === 'paid' ? 'Completed' : 'Pending'}</button>`;
                    break;
                default:
                    actionButton = `<button class="w-full btn-disabled py-2 rounded-lg" disabled>Status Unknown</button>`;
            }
            
            return `
                <div class="campaign-card bg-white p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">${campaign.name || 'Unnamed Campaign'}</h3>
                            <p class="text-gray-600 text-sm mb-2">by ${campaign.brand || 'Unknown Brand'}</p>
                            <div class="flex items-center space-x-2 mb-3">
                                ${statusBadge}
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-orange-600">Ksh ${paymentAmount.toLocaleString()}</p>
                            <p class="text-xs text-gray-500">Payment</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-bullseye text-blue-500"></i>
                            <span>${campaign.goal || 'Brand Awareness'}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-calendar text-green-500"></i>
                            <span>${campaign.deadline || '7 days'}</span>
                        </div>
                    </div>
                    
                    ${actionButton}
                </div>
            `;
        }

        // Create payment card
        function createPaymentCard(payment) {
            const paymentAmount = payment.amount || getPaymentAmount(payment.campaignCategory);
            const statusText = payment.status === 'pending_payment' ? 'Pending Payment' : 'Paid';
            const statusClass = payment.status === 'pending_payment' ? 'status-pending-payment' : 'status-paid';
            
            return `
                <div class="border border-gray-200 rounded-lg p-4 mb-3">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-medium text-gray-800">${payment.campaignName || 'Unnamed Campaign'}</h4>
                            <p class="text-gray-600">${payment.campaignBrand || 'Unknown Brand'}</p>
                            <span class="status-badge ${statusClass} text-xs">${statusText}</span>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-green-600">Ksh ${paymentAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Get payment amount based on category
        function getPaymentAmount(category) {
            switch (category) {
                case 'Nano': return 1000;
                case 'Micro': return 4000;
                case 'Macro': return 7000;
                case 'Mega': return 15000;
                default: return 1000;
            }
        }

        // Get status badge
        function getStatusBadge(status) {
            const badges = {
                'available': '<span class="status-badge status-active">Available</span>',
                'joined': '<span class="status-badge status-pending">Joined</span>',
                'submitted': '<span class="status-badge status-submitted">Submitted</span>',
                'pending_payment': '<span class="status-badge status-pending-payment">Pending Payment</span>',
                'paid': '<span class="status-badge status-paid">Paid</span>',
                'completed': '<span class="status-badge status-completed">Completed</span>',
                'active': '<span class="status-badge status-active">Active</span>',
                'rejected': '<span class="status-badge status-rejected">Rejected</span>'
            };
            return badges[status] || '<span class="status-badge status-pending">' + (status || 'Unknown') + '</span>';
        }

        // Function to copy text to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Show a temporary success message
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                toast.textContent = 'Copied to clipboard!';
                document.body.appendChild(toast);
                
                // Remove the toast after 2 seconds
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }

        // Show campaign details
        function showCampaignDetails(campaignId) {
            selectedCampaign = allCampaigns.find(c => c.id === campaignId);
            if (!selectedCampaign) return;
            
            // Check if the influencer has already joined this campaign
            const alreadyJoined = myCampaigns.some(c => c.id === campaignId);
            
            const modal = document.getElementById('campaign-modal');
            const modalContent = document.getElementById('modal-content');
            
            document.getElementById('modal-campaign-name').textContent = selectedCampaign.name || 'Unnamed Campaign';
            document.getElementById('modal-campaign-brand').textContent = selectedCampaign.brand || 'Unknown Brand';
            
            const paymentAmount = getPaymentAmount(selectedCampaign.category);
            
            // Calculate match percentage
            const influencerNiches = currentProfile.niches || [];
            const campaignNiches = selectedCampaign.niches || [];
            const commonNiches = influencerNiches.filter(niche => campaignNiches.includes(niche));
            const matchPercentage = Math.round((commonNiches.length / Math.max(influencerNiches.length, campaignNiches.length, 1)) * 100);
            
            modalContent.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-sm text-blue-800">Payment Amount</p>
                                <p class="text-xl font-bold text-blue-800">Ksh ${paymentAmount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p class="text-sm text-blue-800">Spots Available</p>
                                <p class="text-xl font-bold text-blue-800">${selectedCampaign.spotsAvailable || 0}</p>
                            </div>
                            <div>
                                <p class="text-sm text-blue-800">Profile Match</p>
                                <p class="text-xl font-bold text-blue-800">${matchPercentage}%</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Campaign Goal</h3>
                        <p class="text-gray-600">${selectedCampaign.goal || 'Not specified'}</p>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <ul class="list-disc list-inside space-y-1">
                                ${selectedCampaign.instructions ? selectedCampaign.instructions.map(instruction => `
                                    <li class="text-gray-800">${instruction}</li>
                                `).join('') : '<li class="text-gray-500">No instructions provided</li>'}
                            </ul>
                        </div>
                    </div>

                    ${selectedCampaign.caption ? `
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Caption</h3>
                            <div class="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                                <p class="orange-text flex-1">${selectedCampaign.caption}</p>
                                <button onclick="copyToClipboard('${selectedCampaign.caption.replace(/'/g, "\\'")}')" class="copy-button">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    ${selectedCampaign.hashtags && selectedCampaign.hashtags.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Hashtags</h3>
                            <div class="space-y-2">
                                ${selectedCampaign.hashtags.map(tag => `
                                    <div class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                        <span class="orange-text flex-1">${tag}</span>
                                        <button onclick="copyToClipboard('${tag.replace(/'/g, "\\'")}')" class="copy-button">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${selectedCampaign.mentions && selectedCampaign.mentions.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Accounts to Tag</h3>
                            <div class="space-y-2">
                                ${selectedCampaign.mentions.map(mention => `
                                    <div class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                        <span class="orange-text flex-1">${mention}</span>
                                        <button onclick="copyToClipboard('${mention.replace(/'/g, "\\'")}')" class="copy-button">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${selectedCampaign.resources && selectedCampaign.resources.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Resources</h3>
                            <div class="grid grid-cols-3 gap-2 mt-2">
                                ${selectedCampaign.resources.map((resource, index) => `
                                    <div class="relative group">
                                        <img src="${resource}" alt="Campaign resource ${index + 1}" class="w-full h-20 object-cover rounded-lg">
                                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                                            <a href="${resource}" download="campaign-resource-${index + 1}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white p-2 rounded-full shadow-lg">
                                                <i class="fas fa-download text-blue-600"></i>
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <p class="text-xs text-gray-500 mt-2">Hover over images to download</p>
                        </div>
                    ` : ''}

                    ${alreadyJoined 
                        ? `<button class="w-full btn-disabled py-3 rounded-lg" disabled>Already Joined</button>`
                        : `<button onclick="joinCampaign()" class="w-full btn-primary py-3 rounded-lg">Join This Campaign</button>`
                    }
                </div>
            `;
            
            modal.classList.add('active');
        }

        // Show submission form
        function showSubmissionForm(campaignId) {
            selectedCampaign = myCampaigns.find(c => c.id === campaignId);
            if (!selectedCampaign) return;
            
            // Check if submission is allowed
            const submissionStatus = selectedCampaign.submissionStatus || 'joined';
            if (submissionStatus === 'submitted' || submissionStatus === 'pending_payment' || submissionStatus === 'paid') {
                alert('You cannot submit work for this campaign at this time.');
                return;
            }
            
            document.getElementById('submission-campaign-name').textContent = selectedCampaign.name || 'Unnamed Campaign';
            
            // Clear form fields
            document.getElementById('instagram-url').value = '';
            document.getElementById('facebook-url').value = '';
            document.getElementById('tiktok-url').value = '';
            
            document.getElementById('submission-modal').classList.add('active');
        }

        // Profile picture upload functionality with WebP conversion
        function openProfilePicUpload() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleProfilePicUpload;
            input.click();
        }

        async function handleProfilePicUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Show loading state
            const profilePic = document.getElementById('profile-picture');
            const originalContent = profilePic.innerHTML;
            profilePic.innerHTML = '<div class="loading-spinner"></div>';

            try {
                // Delete previous profile picture if exists
                if (currentProfile.profilePictureUrl) {
                    try {
                        // Extract the file path from the URL
                        const url = new URL(currentProfile.profilePictureUrl);
                        const filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                        const oldPicRef = storage.ref().child(filePath);
                        await oldPicRef.delete();
                        console.log('Previous profile picture deleted');
                    } catch (deleteError) {
                        console.error('Error deleting previous profile picture:', deleteError);
                        // Continue with upload even if deletion fails
                    }
                }

                // Convert image to WebP
                const webpBlob = await convertToWebP(file);
                
                // Create a storage reference
                const storageRef = storage.ref();
                const profilePicRef = storageRef.child(`influencer-profiles/${currentUser.uid}/profile-picture.webp`);
                
                // Upload the WebP file
                const snapshot = await profilePicRef.put(webpBlob);
                
                // Get the download URL
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                // Update Firestore with the profile picture URL
                await db.collection('influencers').doc(currentUser.uid).update({
                    profilePictureUrl: downloadURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update currentProfile object
                currentProfile.profilePictureUrl = downloadURL;
                
                // Update UI
                profilePic.style.backgroundImage = `url(${downloadURL})`;
                profilePic.style.backgroundSize = 'cover';
                profilePic.style.backgroundPosition = 'center';
                profilePic.innerHTML = '';
                
                alert('Profile picture uploaded successfully!');
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alert('Error uploading profile picture: ' + error.message);
                
                // Restore original content
                profilePic.innerHTML = originalContent;
                profilePic.style.backgroundImage = '';
            }
        }

        // Convert image to WebP format
        function convertToWebP(file) {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to convert image to WebP'));
                        }
                    }, 'image/webp', 0.8);
                };
                
                img.onerror = function() {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = URL.createObjectURL(file);
            });
        }

        // Close modal
        function closeModal() {
            document.getElementById('campaign-modal').classList.remove('active');
        }

        // Close submission modal
        function closeSubmissionModal() {
            document.getElementById('submission-modal').classList.remove('active');
        }

        // Join campaign
        async function joinCampaign() {
            if (!selectedCampaign) return;
            
            try {
                // Check if there are spots available
                if (selectedCampaign.spotsAvailable <= 0) {
                    alert('Sorry, this campaign is full!');
                    closeModal();
                    return;
                }

                // Check if the user has already joined this campaign
                const alreadyJoined = myCampaigns.some(c => c.id === selectedCampaign.id);
                if (alreadyJoined) {
                    alert('You have already joined this campaign!');
                    closeModal();
                    return;
                }

                // Create submission document in the campaign's submissions subcollection
                const submissionData = {
                    campaignId: selectedCampaign.id,
                    campaignName: selectedCampaign.name || 'Unnamed Campaign',
                    campaignBrand: selectedCampaign.brand || 'Unknown Brand',
                    campaignCategory: selectedCampaign.category,
                    influencerId: currentUser.uid,
                    influencerName: currentProfile?.fullName || 'Unnamed Influencer',
                    influencerPhone: currentProfile?.phone || '',
                    influencerInstagram: currentProfile?.socialMedia?.instagram?.username || '@username',
                    status: 'joined',
                    amount: getPaymentAmount(selectedCampaign.category),
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Add submission to the campaign's submissions subcollection
                const submissionRef = await db.collection('campaigns')
                    .doc(selectedCampaign.id)
                    .collection('submissions')
                    .add(submissionData);

                // Update campaign spots available
                await db.collection('campaigns').doc(selectedCampaign.id).update({
                    spotsAvailable: (selectedCampaign.spotsAvailable || 0) - 1
                });

                // Update local data
                selectedCampaign.spotsAvailable = (selectedCampaign.spotsAvailable || 0) - 1;
                
                // Add to my campaigns
                myCampaigns.push({
                    ...selectedCampaign,
                    submissionStatus: 'joined',
                    submissionId: submissionRef.id
                });
                
                // Also add to mySubmissions
                mySubmissions.push({
                    id: submissionRef.id,
                    ...submissionData
                });
                
                // Refresh campaigns display
                displayAvailableCampaigns();
                displayMyCampaigns();
                updateStats();
                
                // Show success message and close modal
                closeModal();
                alert('Successfully joined the campaign! You can now submit your work.');
            } catch (error) {
                console.error('Error joining campaign:', error);
                alert('Error joining campaign: ' + error.message);
            }
        }

        // Submit work
        async function submitWork() {
            if (!selectedCampaign) return;
            
            const instagramUrl = document.getElementById('instagram-url').value;
            const facebookUrl = document.getElementById('facebook-url').value;
            const tiktokUrl = document.getElementById('tiktok-url').value;

            if (!instagramUrl && !facebookUrl && !tiktokUrl) {
                alert('Please submit at least one URL');
                return;
            }

            try {
                const today = new Date();
                const paymentDate = calculatePaymentDate(today);

                // Find the submission for this campaign
                const submission = mySubmissions.find(sub => 
                    sub.campaignId === selectedCampaign.id && sub.influencerId === currentUser.uid
                );

                if (!submission) {
                    alert('Error: Could not find your campaign submission. Please try joining the campaign again.');
                    return;
                }

                // Check if submission is allowed
                if (submission.status === 'submitted' || submission.status === 'pending_payment' || submission.status === 'paid') {
                    alert('You cannot submit work for this campaign at this time.');
                    return;
                }

                // Update submission with work details
                await db.collection('campaigns')
                    .doc(selectedCampaign.id)
                    .collection('submissions')
                    .doc(submission.id)
                    .update({
                        submittedUrls: {
                            instagram: instagramUrl,
                            facebook: facebookUrl,
                            tiktok: tiktokUrl
                        },
                        submissionDate: firebase.firestore.FieldValue.serverTimestamp(),
                        paymentDate: paymentDate.toISOString().split('T')[0],
                        status: 'submitted'
                    });

                // Update local data
                submission.status = 'submitted';
                submission.submittedUrls = {
                    instagram: instagramUrl,
                    facebook: facebookUrl,
                    tiktok: tiktokUrl
                };
                submission.submissionDate = today;
                submission.paymentDate = paymentDate;

                // Update the campaign in myCampaigns
                const campaignIndex = myCampaigns.findIndex(c => c.id === selectedCampaign.id);
                if (campaignIndex !== -1) {
                    myCampaigns[campaignIndex].submissionStatus = 'submitted';
                }

                // Refresh campaigns display
                displayMyCampaigns();
                updateStats();
                
                closeSubmissionModal();
                alert('Work submitted successfully! It will be reviewed by the admin.');
            } catch (error) {
                console.error('Error submitting work:', error);
                alert('Error submitting work. Please try again.');
            }
        }

        // Calculate payment date (next Saturday)
        function calculatePaymentDate(submissionDate) {
            const submitDate = new Date(submissionDate);
            const dayOfWeek = submitDate.getDay(); // 0 = Sunday, 6 = Saturday
            
            let daysUntilSaturday;
            if (dayOfWeek === 6) { // Submitted on Saturday
                daysUntilSaturday = 7; // Next Saturday
            } else {
                daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // Next Saturday
            }
            
            const paymentDate = new Date(submitDate);
            paymentDate.setDate(submitDate.getDate() + daysUntilSaturday);
            
            return paymentDate;
        }

        // Handle logout
        async function handleLogout() {
            try {
                await auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error logging out:', error);
            }
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('active');
            }
        }
    