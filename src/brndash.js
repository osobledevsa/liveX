
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
        let currentBrand = null;
        let allCampaigns = [];
        let selectedPaymentMethod = null;
        let currentTab = 'pending';
        let campaignResources = [];
        let selectedNiches = [];
        let isSubmitting = false; // Flag to prevent multiple submissions

        // Pricing constants
        const PRICING = {
            'Nano': 5000,
            'Micro': 10000,
            'Macro': 25000,
            'Mega': 0 // Custom pricing
        };

        // Check authentication on page load
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadBrandProfile();
                await loadCampaigns();
                document.getElementById('loading-screen').style.display = 'none';
            } else {
                window.location.href = 'login.html';
            }
        });

        // Load brand profile
        async function loadBrandProfile() {
            try {
                const docRef = db.collection('brands').doc(currentUser.uid);
                const docSnap = await docRef.get();
                
                if (docSnap.exists) {
                    currentBrand = docSnap.data();
                    displayBrandProfile();
                } else {
                    console.error('No brand profile found');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Error loading brand profile:', error);
                window.location.href = 'login.html';
            }
        }

        // Display brand profile
        function displayBrandProfile() {
            document.getElementById('brand-name').textContent = currentBrand.brandName || 'Brand Name';
            document.getElementById('brand-email').textContent = currentBrand.email || 'brand@example.com';
            document.getElementById('brand-status').textContent = currentBrand.status || 'Active';
            
            // Calculate joined date (approximate)
            const joinedDate = new Date();
            if (currentBrand.createdAt) {
                joinedDate.setTime(currentBrand.createdAt.toDate().getTime());
            } else {
                joinedDate.setDate(joinedDate.getDate() - Math.floor(Math.random() * 90) + 30);
            }
            document.getElementById('brand-joined').textContent = joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            // Load brand logo if exists
            if (currentBrand.logoUrl) {
                const logoDiv = document.getElementById('brand-logo');
                logoDiv.style.backgroundImage = `url(${currentBrand.logoUrl})`;
                logoDiv.style.backgroundSize = 'cover';
                logoDiv.style.backgroundPosition = 'center';
                logoDiv.innerHTML = '';
            }
        }

        // Load campaigns
        async function loadCampaigns() {
            try {
                console.log('Loading campaigns for brand:', currentUser.uid);
                const snapshot = await db.collection('campaigns')
                    .where('brandId', '==', currentUser.uid)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                allCampaigns = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log('Loaded campaigns:', allCampaigns);
                displayCampaigns();
                updateStats();
                updateRecentActivity();
            } catch (error) {
                console.error('Error loading campaigns:', error);
                // Try without ordering if index doesn't exist
                try {
                    const snapshot = await db.collection('campaigns')
                        .where('brandId', '==', currentUser.uid)
                        .get();
                    
                    allCampaigns = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    console.log('Loaded campaigns without ordering:', allCampaigns);
                    displayCampaigns();
                    updateStats();
                    updateRecentActivity();
                } catch (fallbackError) {
                    console.error('Error loading campaigns (fallback):', fallbackError);
                }
            }
        }

        // Update stats
        function updateStats() {
            const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
            const totalInfluencers = allCampaigns.reduce((sum, c) => sum + (c.totalSpots || 0), 0);

            document.getElementById('active-campaigns').textContent = activeCampaigns;
            document.getElementById('total-influencers').textContent = totalInfluencers;
            document.getElementById('brand-campaigns').textContent = allCampaigns.length;
        }

        // Display campaigns
        function displayCampaigns() {
            const pendingContainer = document.getElementById('pending-campaigns');
            const activeContainer = document.getElementById('active-campaigns-list');
            const completedContainer = document.getElementById('completed-campaigns');

            const pendingCampaigns = allCampaigns.filter(c => c.status === 'pending');
            const activeCampaigns = allCampaigns.filter(c => c.status === 'active');
            const completedCampaigns = allCampaigns.filter(c => c.status === 'completed');

            console.log('Campaign counts:', {
                pending: pendingCampaigns.length,
                active: activeCampaigns.length,
                completed: completedCampaigns.length
            });

            // Display pending campaigns
            if (pendingCampaigns.length === 0) {
                pendingContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-clock text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No pending campaigns</p>
                    </div>
                `;
            } else {
                pendingContainer.innerHTML = pendingCampaigns.map(campaign => createCampaignCard(campaign, 'pending')).join('');
            }

            // Display active campaigns
            if (activeCampaigns.length === 0) {
                activeContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-bullseye text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No active campaigns</p>
                    </div>
                `;
            } else {
                activeContainer.innerHTML = activeCampaigns.map(campaign => createCampaignCard(campaign, 'active')).join('');
            }

            // Display completed campaigns
            if (completedCampaigns.length === 0) {
                completedContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No completed campaigns</p>
                    </div>
                `;
            } else {
                completedContainer.innerHTML = completedCampaigns.map(campaign => createCampaignCard(campaign, 'completed')).join('');
            }
        }

        // Create campaign card
        function createCampaignCard(campaign, type) {
            const statusColors = {
                'pending': 'status-pending',
                'active': 'status-active',
                'completed': 'status-completed'
            };

            const filledSlots = (campaign.totalSpots || 0) - (campaign.spotsAvailable || 0);
            const progressPercentage = campaign.totalSpots > 0 ? (filledSlots / campaign.totalSpots) * 100 : 0;

            return `
                <div class="campaign-card bg-white p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">${campaign.name}</h3>
                            <p class="text-gray-600 text-sm mb-2">${campaign.brand}</p>
                            <div class="flex items-center space-x-2 mb-3">
                                <span class="status-badge ${statusColors[campaign.status]}">${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span>
                                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    ${campaign.spotsAvailable || 0} spots left
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-orange-600">Ksh ${(campaign.totalCost || 0).toLocaleString()}</p>
                            <p class="text-xs text-gray-500">Total Cost</p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress: ${filledSlots}/${campaign.totalSpots || 0} influencers</span>
                            <span>${Math.round(progressPercentage)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                        <div class="flex items-center space-x-1 mr-4">
                            <i class="fas fa-bullseye text-blue-500"></i>
                            <span>${campaign.goal}</span>
                        </div>
                        <div class="flex items-center space-x-1 mr-4">
                            <i class="fas fa-calendar text-green-500"></i>
                            <span>${campaign.deadline || '7 days'}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-tags text-purple-500"></i>
                            <span>${campaign.niches ? campaign.niches.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ') : 'None'}</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2">
                        ${type === 'active' || type === 'completed' ? `
                            <button onclick="openAnalyticsModal('${campaign.id}')" class="flex-1 btn-secondary py-2 rounded-lg text-sm">
                                <i class="fas fa-chart-bar mr-1"></i> Analytics
                            </button>
                        ` : ''}
                        <button onclick="viewCampaignDetails('${campaign.id}')" class="flex-1 btn-primary py-2 rounded-lg text-sm">
                            <i class="fas fa-eye mr-1"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }

        // Update recent activity
        function updateRecentActivity() {
            const activityContainer = document.getElementById('recent-activity');
            const recentCampaigns = allCampaigns.slice(0, 5);
            
            if (recentCampaigns.length === 0) {
                activityContainer.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 text-sm">No recent activity</p>
                    </div>
                `;
            } else {
                activityContainer.innerHTML = recentCampaigns.map(campaign => `
                    <div class="flex items-center space-x-3 mb-3">
                        <div class="w-2 h-2 bg-${campaign.status === 'pending' ? 'yellow' : campaign.status === 'active' ? 'green' : 'blue'}-500 rounded-full"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-800">${campaign.name}</p>
                            <p class="text-xs text-gray-500">${new Date(campaign.createdAt?.toDate()).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Switch tabs
        function switchTab(tab) {
            currentTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            // Show/hide content
            document.getElementById('pending-campaigns').classList.toggle('hidden', tab !== 'pending');
            document.getElementById('active-campaigns-list').classList.toggle('hidden', tab !== 'active');
            document.getElementById('completed-campaigns').classList.toggle('hidden', tab !== 'completed');
        }

        // Open create campaign modal
        function openCreateCampaignModal() {
            document.getElementById('create-campaign-modal').classList.add('active');
            document.getElementById('campaign-brand').value = currentBrand.brandName;
        }

        // Close create campaign modal
        function closeCreateCampaignModal() {
            document.getElementById('create-campaign-modal').classList.remove('active');
            document.getElementById('create-campaign-form').reset();
            updatePricing();
            
            // Reset resources
            campaignResources = [];
            document.getElementById('resources-preview').innerHTML = '';
            document.getElementById('resources-preview').classList.add('hidden');
            document.getElementById('resources-placeholder').classList.remove('hidden');
            
            // Reset niches
            selectedNiches = [];
            document.querySelectorAll('.niche-tag').forEach(tag => {
                tag.classList.remove('selected');
            });
            document.getElementById('nicheError').classList.add('hidden');
            
            // Reset submit button state
            resetSubmitButton();
        }

        // Reset submit button to normal state
        function resetSubmitButton() {
            const submitBtn = document.getElementById('submit-campaign-btn');
            const submitText = document.getElementById('submit-text');
            const submitLoading = document.getElementById('submit-loading');
            
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitLoading.classList.add('hidden');
            isSubmitting = false;
        }

        // Set submit button to loading state
        function setSubmitButtonLoading() {
            const submitBtn = document.getElementById('submit-campaign-btn');
            const submitText = document.getElementById('submit-text');
            const submitLoading = document.getElementById('submit-loading');
            
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
            isSubmitting = true;
        }

        // Open analytics modal
        function openAnalyticsModal(campaignId) {
            const campaign = allCampaigns.find(c => c.id === campaignId);
            if (!campaign) return;

            const modal = document.getElementById('analytics-modal');
            const content = document.getElementById('analytics-content');
            
            // Load influencer submissions for this campaign
            loadInfluencerSubmissions(campaignId);
            
            modal.classList.add('active');
        }

        // Close analytics modal
        function closeAnalyticsModal() {
            document.getElementById('analytics-modal').classList.remove('active');
        }

        // Load influencer submissions
        async function loadInfluencerSubmissions(campaignId) {
            try {
                const snapshot = await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .get();
                
                const submissions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                displayInfluencerSubmissions(submissions);
            } catch (error) {
                console.error('Error loading submissions:', error);
            }
        }

        // Display influencer submissions
        function displayInfluencerSubmissions(submissions) {
            const content = document.getElementById('analytics-content');
            
            if (submissions.length === 0) {
                content.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-users text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No influencer submissions yet</p>
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="grid gap-4">
                        ${submissions.map(submission => `
                            <div class="influencer-card">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <i class="fas fa-user text-gray-500"></i>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800">${submission.influencerName}</p>
                                            <p class="text-sm text-gray-600">${submission.influencerInstagram}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3 pt-3 border-t border-gray-200">
                                    <p class="text-sm font-medium text-gray-700 mb-2">Submitted Work:</p>
                                    <div class="space-y-2">
                                        ${submission.submittedUrls ? `
                                            ${submission.submittedUrls.instagram ? `
                                                <a href="${submission.submittedUrls.instagram}" target="_blank" class="flex items-center space-x-2 text-pink-600 hover:text-pink-800">
                                                    <i class="fab fa-instagram"></i>
                                                    <span class="text-sm">Instagram Post</span>
                                                </a>
                                            ` : ''}
                                            ${submission.submittedUrls.facebook ? `
                                                <a href="${submission.submittedUrls.facebook}" target="_blank" class="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                                                    <i class="fab fa-facebook"></i>
                                                    <span class="text-sm">Facebook Post</span>
                                                </a>
                                            ` : ''}
                                            ${submission.submittedUrls.tiktok ? `
                                                <a href="${submission.submittedUrls.tiktok}" target="_blank" class="flex items-center space-x-2 text-gray-800 hover:text-black">
                                                    <i class="fab fa-tiktok"></i>
                                                    <span class="text-sm">TikTok Post</span>
                                                </a>
                                            ` : ''}
                                        ` : '<p class="text-sm text-gray-500">No submitted work yet</p>'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        // Update pricing
        function updatePricing() {
            const category = document.getElementById('campaign-category').value;
            const numberOfInfluencers = parseInt(document.getElementById('campaign-influencers').value) || 0;
            
            let totalPrice = 0;
            
            if (category && numberOfInfluencers > 0) {
                if (category === 'Mega') {
                    // Custom pricing for mega - will be set by admin
                    totalPrice = 0;
                } else {
                    const pricePerInfluencer = PRICING[category];
                    totalPrice = pricePerInfluencer * numberOfInfluencers;
                }
            }
            
            document.getElementById('total-cost').textContent = 
                category === 'Mega' ? 'To be agreed upon' : `Ksh ${totalPrice.toLocaleString()}`;
        }

        // Select payment method
        function selectPayment(method) {
            selectedPaymentMethod = method;
            
            // Update UI
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            event.currentTarget.classList.add('selected');
            document.querySelector(`input[value="${method}"]`).checked = true;
        }

        // Brand logo upload functionality with WebP conversion
        function openLogoUpload() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleLogoUpload;
            input.click();
        }

        async function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Show loading state
            const logoDiv = document.getElementById('brand-logo');
            const originalContent = logoDiv.innerHTML;
            logoDiv.innerHTML = '<div class="loading-spinner"></div>';

            try {
                // Delete previous logo if exists
                if (currentBrand.logoUrl) {
                    try {
                        // Extract the file path from the URL
                        const url = new URL(currentBrand.logoUrl);
                        const filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                        const oldLogoRef = storage.ref().child(filePath);
                        await oldLogoRef.delete();
                        console.log('Previous logo deleted');
                    } catch (deleteError) {
                        console.error('Error deleting previous logo:', deleteError);
                        // Continue with upload even if deletion fails
                    }
                }

                // Convert image to WebP
                const webpBlob = await convertToWebP(file);
                
                // Create a storage reference
                const storageRef = storage.ref();
                const logoRef = storageRef.child(`brand-logos/${currentUser.uid}/logo.webp`);
                
                // Upload the WebP file
                const snapshot = await logoRef.put(webpBlob);
                
                // Get the download URL
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                // Update Firestore with the logo URL
                await db.collection('brands').doc(currentUser.uid).update({
                    logoUrl: downloadURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update currentBrand object
                currentBrand.logoUrl = downloadURL;
                
                // Update UI
                logoDiv.style.backgroundImage = `url(${downloadURL})`;
                logoDiv.style.backgroundSize = 'cover';
                logoDiv.style.backgroundPosition = 'center';
                logoDiv.innerHTML = '';
                
                alert('Brand logo uploaded successfully!');
            } catch (error) {
                console.error('Error uploading logo:', error);
                alert('Error uploading logo: ' + error.message);
                
                // Restore original content
                logoDiv.innerHTML = originalContent;
                logoDiv.style.backgroundImage = '';
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

        // Handle resources upload
        document.getElementById('campaign-resources').addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            // Limit to 5 files
            if (files.length > 5) {
                alert('You can only upload up to 5 images');
                files.splice(5);
            }
            
            campaignResources = files;
            
            // Show preview
            const previewContainer = document.getElementById('resources-preview');
            const placeholder = document.getElementById('resources-placeholder');
            
            if (files.length > 0) {
                previewContainer.innerHTML = '';
                placeholder.classList.add('hidden');
                previewContainer.classList.remove('hidden');
                
                files.forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'resource-preview';
                        img.alt = `Resource ${index + 1}`;
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                previewContainer.classList.add('hidden');
                placeholder.classList.remove('hidden');
            }
        });

        // Upload resources to Firebase Storage
        async function uploadResources(campaignId) {
            const resourceUrls = [];
            
            for (let i = 0; i < campaignResources.length; i++) {
                const file = campaignResources[i];
                try {
                    // Convert to WebP
                    const webpBlob = await convertToWebP(file);
                    
                    // Create storage reference
                    const storageRef = storage.ref();
                    const resourceRef = storageRef.child(`campaign-resources/${campaignId}/resource-${i}.webp`);
                    
                    // Upload file
                    const snapshot = await resourceRef.put(webpBlob);
                    
                    // Get download URL
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    resourceUrls.push(downloadURL);
                } catch (error) {
                    console.error(`Error uploading resource ${i}:`, error);
                    throw new Error(`Failed to upload resource ${i + 1}`);
                }
            }
            
            return resourceUrls;
        }

        // Toggle niche selection
        function toggleNiche(element, niche) {
            element.classList.toggle('selected');
            
            if (element.classList.contains('selected')) {
                if (!selectedNiches.includes(niche)) {
                    selectedNiches.push(niche);
                }
            } else {
                selectedNiches = selectedNiches.filter(n => n !== niche);
            }
            
            // Hide error if at least 1 niche selected
            if (selectedNiches.length >= 1) {
                document.getElementById('nicheError').classList.add('hidden');
            }
        }

        // View campaign details
        function viewCampaignDetails(campaignId) {
            const campaign = allCampaigns.find(c => c.id === campaignId);
            if (!campaign) return;
            
            // You can implement a detailed view modal here
            alert(`Campaign Details:\n\nName: ${campaign.name}\nBrand: ${campaign.brand}\nGoal: ${campaign.goal}\nNiches: ${campaign.niches ? campaign.niches.join(', ') : 'None'}\nStatus: ${campaign.status}`);
        }

        // Handle campaign form submission
        document.getElementById('create-campaign-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent multiple submissions
            if (isSubmitting) {
                return;
            }
            
            if (!selectedPaymentMethod) {
                alert('Please select a payment method');
                return;
            }
            
            const category = document.getElementById('campaign-category').value;
            const numberOfInfluencers = parseInt(document.getElementById('campaign-influencers').value);
            
            if (category === 'Mega') {
                alert('Mega campaigns require custom pricing. Please contact admin for details.');
                return;
            }
            
            // Validate niches
            if (selectedNiches.length === 0) {
                document.getElementById('nicheError').classList.remove('hidden');
                return;
            }
            
            // Collect instructions
            const instructions = [];
            for (let i = 1; i <= 5; i++) {
                const instruction = document.getElementById(`instruction-${i}`).value.trim();
                if (instruction) {
                    instructions.push(instruction);
                }
            }
            
            if (instructions.length === 0) {
                alert('Please provide at least one instruction');
                return;
            }
            
            // Set loading state
            setSubmitButtonLoading();
            
            // Collect form data
            const campaignData = {
                name: document.getElementById('campaign-name').value,
                brand: document.getElementById('campaign-brand').value,
                goal: document.getElementById('campaign-goal').value,
                instructions: instructions,
                caption: document.getElementById('campaign-caption').value,
                hashtags: document.getElementById('campaign-hashtags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                mentions: document.getElementById('campaign-mentions').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                category: category,
                totalSpots: numberOfInfluencers,
                spotsAvailable: numberOfInfluencers,
                niches: selectedNiches,
                brandId: currentUser.uid,
                status: 'pending',
                paymentMethod: selectedPaymentMethod,
                pricePerInfluencer: PRICING[category],
                totalCost: PRICING[category] * numberOfInfluencers,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                // Save campaign to Firestore
                const campaignRef = await db.collection('campaigns').add(campaignData);
                
                // Upload resources if any
                if (campaignResources.length > 0) {
                    const resourceUrls = await uploadResources(campaignRef.id);
                    
                    // Update campaign with resource URLs
                    await db.collection('campaigns').doc(campaignRef.id).update({
                        resources: resourceUrls
                    });
                }
                
                // Close modal and refresh
                closeCreateCampaignModal();
                await loadCampaigns();
                updateStats();
                
                alert('Campaign submitted successfully! It will be reviewed by admin.');
            } catch (error) {
                console.error('Error creating campaign:', error);
                alert('Error creating campaign: ' + error.message);
                
                // Reset button state on error
                resetSubmitButton();
            }
        });

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
                event.target.classList.add('active');
            }
        }
    