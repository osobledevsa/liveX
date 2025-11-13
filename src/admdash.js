
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

        // Global variables
        let currentUser = null;
        let allCampaigns = [];
        let allSubmissions = [];
        let currentMainTab = 'campaigns';
        let currentCampaignTab = 'pending';
        let currentSubmissionTab = 'pending';
        let currentPaymentTab = 'pending';
        let selectedCampaign = null;
        let selectedSubmission = null;
        let selectedPayment = null;

        // Check authentication on page load
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadCampaigns();
                await loadSubmissions();
                document.getElementById('loading-screen').style.display = 'none';
            } else {
                window.location.href = 'login.html';
            }
        });

        // Load campaigns
        async function loadCampaigns() {
            try {
                const snapshot = await db.collection('campaigns')
                    .orderBy('createdAt', 'desc')
                    .get();
                
                allCampaigns = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                displayCampaigns();
                updateStats();
            } catch (error) {
                console.error('Error loading campaigns:', error);
                // Try without ordering if index doesn't exist
                try {
                    const snapshot = await db.collection('campaigns').get();
                    
                    allCampaigns = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    displayCampaigns();
                    updateStats();
                } catch (fallbackError) {
                    console.error('Error loading campaigns (fallback):', fallbackError);
                }
            }
        }

        // Load submissions for management
        async function loadSubmissions() {
            try {
                allSubmissions = [];
                
                // Get all campaigns
                const campaignsSnapshot = await db.collection('campaigns').get();
                
                // For each campaign, get its submissions
                for (const campaignDoc of campaignsSnapshot.docs) {
                    const campaign = {
                        id: campaignDoc.id,
                        ...campaignDoc.data()
                    };
                    
                    const submissionsSnapshot = await db.collection('campaigns')
                        .doc(campaignDoc.id)
                        .collection('submissions')
                        .get();
                    
                    submissionsSnapshot.forEach(submissionDoc => {
                        allSubmissions.push({
                            id: submissionDoc.id,
                            campaignId: campaignDoc.id,
                            campaignName: campaign.name,
                            ...submissionDoc.data()
                        });
                    });
                }
                
                displaySubmissions();
                displayPayments();
            } catch (error) {
                console.error('Error loading submissions:', error);
            }
        }

        // Update stats
        function updateStats() {
            const totalCampaigns = allCampaigns.length;
            const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
            const pendingSubmissions = allSubmissions.filter(s => s.status === 'submitted').length;
            
            document.getElementById('total-campaigns').textContent = totalCampaigns;
            document.getElementById('active-campaigns').textContent = activeCampaigns;
            document.getElementById('pending-submissions').textContent = pendingSubmissions;
            
            // Calculate total revenue from completed campaigns
            const completedCampaigns = allCampaigns.filter(c => c.status === 'completed');
            const totalRevenue = completedCampaigns.reduce((sum, c) => sum + (c.totalCost || 0), 0);
            document.getElementById('total-revenue').textContent = `Ksh ${totalRevenue.toLocaleString()}`;
        }

        // Display campaigns
        function displayCampaigns() {
            const pendingContainer = document.getElementById('pending-campaigns-container');
            const activeContainer = document.getElementById('active-campaigns-container');
            const allContainer = document.getElementById('all-campaigns-container');
            
            // Clear existing content
            pendingContainer.innerHTML = '';
            activeContainer.innerHTML = '';
            allContainer.innerHTML = '';
            
            const pendingCampaigns = allCampaigns.filter(c => c.status === 'pending');
            const activeCampaigns = allCampaigns.filter(c => c.status === 'active');
            const allCampaignsList = [...allCampaigns];
            
            // Display pending campaigns
            if (pendingCampaigns.length === 0) {
                pendingContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-clock text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No pending campaigns</p>
                    </div>
                `;
            } else {
                pendingCampaigns.forEach(campaign => {
                    pendingContainer.appendChild(createCampaignCard(campaign, 'pending'));
                });
            }
            
            // Display active campaigns
            if (activeCampaigns.length === 0) {
                activeContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No active campaigns</p>
                    </div>
                `;
            } else {
                activeCampaigns.forEach(campaign => {
                    activeContainer.appendChild(createCampaignCard(campaign, 'active'));
                });
            }
            
            // Display all campaigns
            if (allCampaignsList.length === 0) {
                allContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-list text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No campaigns found</p>
                    </div>
                `;
            } else {
                allCampaignsList.forEach(campaign => {
                    allContainer.appendChild(createCampaignCard(campaign, 'all'));
                });
            }
        }

        // Display submissions
        function displaySubmissions() {
            const pendingContainer = document.getElementById('pending-submissions-container');
            const approvedContainer = document.getElementById('approved-submissions-container');
            const rejectedContainer = document.getElementById('rejected-submissions-container');
            
            // Clear existing content
            pendingContainer.innerHTML = '';
            approvedContainer.innerHTML = '';
            rejectedContainer.innerHTML = '';
            
            const pendingSubmissions = allSubmissions.filter(s => s.status === 'submitted');
            const approvedSubmissions = allSubmissions.filter(s => s.status === 'pending_payment' || s.status === 'paid');
            const rejectedSubmissions = allSubmissions.filter(s => s.status === 'rejected');
            
            // Display pending submissions
            if (pendingSubmissions.length === 0) {
                pendingContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-clock text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No pending submissions</p>
                    </div>
                `;
            } else {
                pendingSubmissions.forEach(submission => {
                    pendingContainer.appendChild(createSubmissionCard(submission, 'pending'));
                });
            }
            
            // Display approved submissions
            if (approvedSubmissions.length === 0) {
                approvedContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No approved submissions</p>
                    </div>
                `;
            } else {
                approvedSubmissions.forEach(submission => {
                    approvedContainer.appendChild(createSubmissionCard(submission, 'approved'));
                });
            }
            
            // Display rejected submissions
            if (rejectedSubmissions.length === 0) {
                rejectedContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-times-circle text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No rejected submissions</p>
                    </div>
                `;
            } else {
                rejectedSubmissions.forEach(submission => {
                    rejectedContainer.appendChild(createSubmissionCard(submission, 'rejected'));
                });
            }
        }

        // Display payments
        function displayPayments() {
            const pendingContainer = document.getElementById('pending-payments-container');
            const approvedContainer = document.getElementById('approved-payments-container');
            
            // Clear existing content
            pendingContainer.innerHTML = '';
            approvedContainer.innerHTML = '';
            
            const pendingSubmissions = allSubmissions.filter(s => s.status === 'pending_payment');
            const approvedSubmissions = allSubmissions.filter(s => s.status === 'paid');
            
            // Display pending payments
            if (pendingSubmissions.length === 0) {
                pendingContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-clock text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No pending payments</p>
                    </div>
                `;
            } else {
                pendingSubmissions.forEach(submission => {
                    pendingContainer.appendChild(createPaymentCard(submission));
                });
            }
            
            // Display approved payments
            if (approvedSubmissions.length === 0) {
                approvedContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No approved payments</p>
                    </div>
                `;
            } else {
                approvedSubmissions.forEach(submission => {
                    approvedContainer.appendChild(createPaymentCard(submission));
                });
            }
        }

        // Create campaign card
        function createCampaignCard(campaign, type) {
            const card = document.createElement('div');
            card.className = 'campaign-card bg-white p-5';
            
            const statusColors = {
                'pending': 'status-pending',
                'active': 'status-active',
                'completed': 'status-completed',
                'rejected': 'status-rejected'
            };
            
            const statusClass = statusColors[campaign.status] || 'status-pending';
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">${campaign.name}</h3>
                        <p class="text-gray-600 text-sm mb-2">by ${campaign.brand}</p>
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="status-badge ${statusClass}">${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span>
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
                
                <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-bullseye text-blue-500"></i>
                        <span>${campaign.goal}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-calendar text-green-500"></i>
                        <span>${campaign.deadline || '7 days'}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="viewCampaignDetails('${campaign.id}')" class="flex-1 btn-secondary py-2 rounded-lg text-sm">
                        <i class="fas fa-eye mr-1"></i> View Details
                    </button>
                    ${type === 'pending' ? `
                        <button onclick="approveCampaign('${campaign.id}')" class="flex-1 btn-success py-2 rounded-lg text-sm">
                            <i class="fas fa-check mr-1"></i> Approve
                        </button>
                        <button onclick="rejectCampaign('${campaign.id}')" class="flex-1 btn-danger py-2 rounded-lg text-sm">
                            <i class="fas fa-times mr-1"></i> Reject
                        </button>
                    ` : ''}
                </div>
            `;
            
            return card;
        }

        // Create submission card
        function createSubmissionCard(submission, type) {
            const card = document.createElement('div');
            card.className = 'submission-card bg-white p-5';
            
            const statusColors = {
                'submitted': 'status-submitted',
                'pending_payment': 'status-pending',
                'paid': 'status-paid',
                'rejected': 'status-rejected'
            };
            
            const statusClass = statusColors[submission.status] || 'status-pending';
            
            const paymentAmount = getPaymentAmount(submission.campaignCategory);
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">${submission.campaignName}</h3>
                        <p class="text-gray-600 text-sm mb-2">by ${submission.influencerName || 'Unknown Influencer'}</p>
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="status-badge ${statusClass}">${submission.status === 'submitted' ? 'Pending Review' : submission.status === 'pending_payment' ? 'Pending Payment' : submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                ${submission.submissionDate ? new Date(submission.submissionDate.toDate()).toLocaleDateString() : 'Unknown'}
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-green-600">Ksh ${paymentAmount.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">Payment</p>
                    </div>
                </div>
                
                <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-1">
                        <i class="fab fa-instagram text-pink-600"></i>
                        <span>${submission.influencerInstagram || 'N/A'}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-user text-gray-600"></i>
                        <span>${submission.influencerName || 'Unknown'}</span>
                    </div>
                </div>
                
                ${submission.submittedUrls ? `
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-2">Submitted URLs:</p>
                        <div class="space-y-1">
                            ${submission.submittedUrls.instagram ? `
                                <a href="${submission.submittedUrls.instagram}" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fab fa-instagram mr-2"></i> Instagram Post
                                </a>
                            ` : ''}
                            ${submission.submittedUrls.facebook ? `
                                <a href="${submission.submittedUrls.facebook}" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fab fa-facebook mr-2"></i> Facebook Post
                                </a>
                            ` : ''}
                            ${submission.submittedUrls.tiktok ? `
                                <a href="${submission.submittedUrls.tiktok}" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fab fa-tiktok mr-2"></i> TikTok Post
                                </a>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex space-x-2">
                    <button onclick="viewSubmissionDetails('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-secondary py-2 rounded-lg text-sm">
                        <i class="fas fa-eye mr-1"></i> View Details
                    </button>
                    ${type === 'pending' ? `
                        <button onclick="approveSubmission('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-success py-2 rounded-lg text-sm">
                            <i class="fas fa-check mr-1"></i> Approve
                        </button>
                        <button onclick="rejectSubmission('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-danger py-2 rounded-lg text-sm">
                            <i class="fas fa-times mr-1"></i> Reject
                        </button>
                    ` : ''}
                </div>
            `;
            
            return card;
        }

        // Create payment card
        function createPaymentCard(submission) {
            const card = document.createElement('div');
            card.className = 'campaign-card bg-white p-5';
            
            const statusClass = submission.status === 'pending_payment' ? 'status-pending' : 'status-paid';
            const paymentAmount = getPaymentAmount(submission.campaignCategory);
            
            // Calculate days until payment can be approved
            const submissionDate = submission.submissionDate ? submission.submissionDate.toDate() : new Date();
            const now = new Date();
            const diffTime = Math.abs(now - submissionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const daysUntilPayment = Math.max(0, 7 - diffDays);
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${submission.campaignName}</h4>
                        <p class="text-sm text-gray-600">by ${submission.influencerName || 'Unknown Influencer'}</p>
                        <div class="flex items-center space-x-2 mb-2 mt-2">
                            <span class="status-badge ${statusClass}">${submission.status === 'pending_payment' ? 'Pending Payment' : 'Paid'}</span>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${submission.submissionDate ? new Date(submission.submissionDate.toDate()).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-green-600">Ksh ${paymentAmount.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">Payment Amount</p>
                    </div>
                </div>
                
                <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-1">
                        <i class="fab fa-instagram text-pink-600"></i>
                        <span>${submission.influencerInstagram || 'N/A'}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-user text-gray-600"></i>
                        <span>${submission.influencerName || 'Unknown'}</span>
                    </div>
                </div>
                
                ${submission.status === 'pending_payment' ? `
                    <div class="mb-4">
                        <div class="payment-timer">
                            <i class="fas fa-clock"></i>
                            <span>${daysUntilPayment > 0 ? `Payment available in ${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''}` : 'Payment ready for approval'}</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="approvePayment('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-success py-2 rounded-lg text-sm" ${daysUntilPayment > 0 ? 'disabled' : ''}>
                            <i class="fas fa-check mr-1"></i> Approve Payment
                        </button>
                        <button onclick="viewSubmissionDetails('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-secondary py-2 rounded-lg text-sm">
                            <i class="fas fa-eye mr-1"></i> View Details
                        </button>
                    </div>
                ` : `
                    <div class="flex space-x-2">
                        <button onclick="viewSubmissionDetails('${submission.id}', '${submission.campaignId}')" class="flex-1 btn-secondary py-2 rounded-lg text-sm">
                            <i class="fas fa-eye mr-1"></i> View Details
                        </button>
                    </div>
                `}
            `;
            
            return card;
        }

        // Switch main tabs
        function switchMainTab(tab) {
            currentMainTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.main-tab-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            // Show/hide content
            document.getElementById('campaigns-content').classList.toggle('hidden', tab !== 'campaigns');
            document.getElementById('submissions-content').classList.toggle('hidden', tab !== 'submissions');
            document.getElementById('payments-content').classList.toggle('hidden', tab !== 'payments');
        }

        // Switch campaign tabs
        function switchCampaignTab(tab) {
            currentCampaignTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.campaign-tab-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            // Show/hide content
            document.getElementById('pending-campaigns-container').classList.toggle('hidden', tab !== 'pending');
            document.getElementById('active-campaigns-container').classList.toggle('hidden', tab !== 'active');
            document.getElementById('all-campaigns-container').classList.toggle('hidden', tab !== 'all');
        }

        // Switch submission tabs
        function switchSubmissionTab(tab) {
            currentSubmissionTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.submission-tab-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            // Show/hide content
            document.getElementById('pending-submissions-container').classList.toggle('hidden', tab !== 'pending');
            document.getElementById('approved-submissions-container').classList.toggle('hidden', tab !== 'approved');
            document.getElementById('rejected-submissions-container').classList.toggle('hidden', tab !== 'rejected');
        }

        // Switch payment tabs
        function switchPaymentTab(tab) {
            currentPaymentTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.payment-tab-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            // Show/hide content
            document.getElementById('pending-payments-container').classList.toggle('hidden', tab !== 'pending');
            document.getElementById('approved-payments-container').classList.toggle('hidden', tab !== 'approved');
        }

        // View campaign details
        function viewCampaignDetails(campaignId) {
            selectedCampaign = allCampaigns.find(c => c.id === campaignId);
            if (!selectedCampaign) return;
            
            const modal = document.getElementById('campaign-modal');
            const modalContent = document.getElementById('modal-content');
            
            document.getElementById('modal-campaign-name').textContent = selectedCampaign.name;
            document.getElementById('modal-campaign-brand').textContent = selectedCampaign.brand;
            
            const modalContentHTML = `
                <div class="space-y-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Campaign Details</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Campaign Name</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.name}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Brand Name</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.brand}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Campaign Goal</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.goal}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Category</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.category}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Total Spots</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.totalSpots || 0}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Spots Available</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.spotsAvailable || 0}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Total Cost</p>
                            <p class="font-medium text-gray-800">Ksh ${(selectedCampaign.totalCost || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Status</p>
                            <p class="font-medium text-gray-800">${selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}</p>
                        </div>
                    </div>
                    
                    <div>
                        <p class="text-sm text-gray-600">Created</p>
                        <p class="font-medium text-gray-800">${selectedCampaign.createdAt ? new Date(selectedCampaign.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    
                    <div>
                        <p class="text-sm text-gray-600">Instructions</p>
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
                            <p class="text-sm text-gray-600">Caption</p>
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <p class="font-medium text-gray-800">${selectedCampaign.caption}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${selectedCampaign.hashtags && selectedCampaign.hashtags.length > 0 ? `
                        <div>
                            <p class="text-sm text-gray-600">Hashtags</p>
                            <div class="flex flex-wrap gap-2">
                                ${selectedCampaign.hashtags.map(tag => `
                                    <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">#${tag.replace('#', '')}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${selectedCampaign.mentions && selectedCampaign.mentions.length > 0 ? `
                        <div>
                            <p class="text-sm text-gray-600">Mentions</p>
                            <div class="flex flex-wrap gap-2">
                                ${selectedCampaign.mentions.map(mention => `
                                    <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">@${mention.replace('@', '')}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${selectedCampaign.resources && selectedCampaign.resources.length > 0 ? `
                        <div>
                            <p class="text-sm text-gray-600">Resources</p>
                            <div class="grid grid-cols-3 gap-2 mt-2">
                                ${selectedCampaign.resources.map(resource => `
                                    <img src="${resource}" alt="Campaign resource" class="w-full h-20 object-cover rounded-lg">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            modalContent.innerHTML = modalContentHTML;
            modal.classList.add('active');
        }

        // View submission details
        async function viewSubmissionDetails(submissionId, campaignId) {
            try {
                const submissionDoc = await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .doc(submissionId)
                    .get();
                
                if (!submissionDoc.exists) {
                    showAlert('Submission not found', 'error');
                    return;
                }
                
                const submission = submissionDoc.data();
                const modal = document.getElementById('submission-modal');
                const modalContent = document.getElementById('submission-modal-content');
                
                document.getElementById('submission-modal-title').textContent = 'Submission Details';
                
                // Calculate days until payment can be approved
                const submissionDate = submission.submissionDate ? submission.submissionDate.toDate() : new Date();
                const now = new Date();
                const diffTime = Math.abs(now - submissionDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysUntilPayment = Math.max(0, 7 - diffDays);
                
                const modalContentHTML = `
                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">Influencer Name</p>
                                <p class="font-medium text-gray-800">${submission.influencerName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Instagram Handle</p>
                                <p class="font-medium text-gray-800">${submission.influencerInstagram || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">Campaign Name</p>
                                <p class="font-medium text-gray-800">${submission.campaignName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Status</p>
                                <p class="font-medium text-gray-800">${submission.status === 'submitted' ? 'Pending Review' : submission.status === 'pending_payment' ? 'Pending Payment' : submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">Submission Date</p>
                                <p class="font-medium text-gray-800">${submission.submissionDate ? new Date(submission.submissionDate.toDate()).toLocaleDateString() : 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Payment Amount</p>
                                <p class="font-medium text-gray-800">Ksh ${getPaymentAmount(submission.campaignCategory).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        ${submission.status === 'pending_payment' ? `
                            <div>
                                <p class="text-sm text-gray-600">Payment Status</p>
                                <div class="payment-timer">
                                    <i class="fas fa-clock"></i>
                                    <span>${daysUntilPayment > 0 ? `Payment available in ${daysUntilPayment} day${daysUntilPayment !== 1 ? 's' : ''}` : 'Payment ready for approval'}</span>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${submission.submittedUrls ? `
                            <div>
                                <p class="text-sm text-gray-600 mb-2">Submitted URLs</p>
                                <div class="space-y-2">
                                    ${submission.submittedUrls.instagram ? `
                                        <div class="flex items-center space-x-2">
                                            <i class="fab fa-instagram text-pink-600"></i>
                                            <a href="${submission.submittedUrls.instagram}" target="_blank" class="text-blue-600 hover:text-blue-800">Instagram Post</a>
                                        </div>
                                    ` : ''}
                                    ${submission.submittedUrls.facebook ? `
                                        <div class="flex items-center space-x-2">
                                            <i class="fab fa-facebook text-blue-600"></i>
                                            <a href="${submission.submittedUrls.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800">Facebook Post</a>
                                        </div>
                                    ` : ''}
                                    ${submission.submittedUrls.tiktok ? `
                                        <div class="flex items-center space-x-2">
                                            <i class="fab fa-tiktok text-gray-800"></i>
                                            <a href="${submission.submittedUrls.tiktok}" target="_blank" class="text-blue-600 hover:text-blue-800">TikTok Post</a>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${submission.notes ? `
                            <div>
                                <p class="text-sm text-gray-600">Notes</p>
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <p class="font-medium text-gray-800">${submission.notes}</p>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${submission.status === 'submitted' ? `
                            <div class="flex space-x-4">
                                <button onclick="approveSubmission('${submissionId}', '${campaignId}'); closeSubmissionModal();" class="flex-1 btn-success py-3 rounded-lg">
                                    <i class="fas fa-check mr-2"></i> Approve Submission
                                </button>
                                <button onclick="rejectSubmission('${submissionId}', '${campaignId}'); closeSubmissionModal();" class="flex-1 btn-danger py-3 rounded-lg">
                                    <i class="fas fa-times mr-2"></i> Reject Submission
                                </button>
                            </div>
                        ` : submission.status === 'pending_payment' ? `
                            <div class="flex space-x-4">
                                <button onclick="approvePayment('${submissionId}', '${campaignId}'); closeSubmissionModal();" class="flex-1 btn-success py-3 rounded-lg" ${daysUntilPayment > 0 ? 'disabled' : ''}>
                                    <i class="fas fa-check mr-2"></i> Approve Payment
                                </button>
                                <button onclick="closeSubmissionModal();" class="flex-1 btn-secondary py-3 rounded-lg">
                                    <i class="fas fa-times mr-2"></i> Close
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                modalContent.innerHTML = modalContentHTML;
                modal.classList.add('active');
            } catch (error) {
                console.error('Error loading submission details:', error);
                showAlert('Error loading submission details: ' + error.message, 'error');
            }
        }

        // Close modal
        function closeModal() {
            document.getElementById('campaign-modal').classList.remove('active');
        }

        // Close submission modal
        function closeSubmissionModal() {
            document.getElementById('submission-modal').classList.remove('active');
        }

        // Close payment modal
        function closePaymentModal() {
            document.getElementById('payment-modal').classList.remove('active');
        }

        // Approve campaign
        async function approveCampaign(campaignId) {
            if (!confirm('Are you sure you want to approve this campaign? This will make it available to influencers.')) {
                return;
            }
            
            showLoading();
            try {
                await db.collection('campaigns').doc(campaignId).update({
                    status: 'active'
                });
                
                // Update local data
                const campaign = allCampaigns.find(c => c.id === campaignId);
                if (campaign) {
                    campaign.status = 'active';
                }
                
                // Refresh display
                displayCampaigns();
                updateStats();
                
                showAlert('Campaign approved successfully!', 'success');
                closeModal();
            } catch (error) {
                console.error('Error approving campaign:', error);
                showAlert('Error approving campaign: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // Reject campaign
        async function rejectCampaign(campaignId) {
            if (!confirm('Are you sure you want to reject this campaign? This will permanently remove it from the platform.')) {
                return;
            }
            
            showLoading();
            try {
                await db.collection('campaigns').doc(campaignId).update({
                    status: 'rejected'
                });
                
                // Update local data
                const campaign = allCampaigns.find(c => c.id === campaignId);
                if (campaign) {
                    campaign.status = 'rejected';
                }
                
                // Refresh display
                displayCampaigns();
                updateStats();
                
                showAlert('Campaign rejected successfully!', 'success');
                closeModal();
            } catch (error) {
                console.error('Error rejecting campaign:', error);
                showAlert('Error rejecting campaign: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // Approve submission
        async function approveSubmission(submissionId, campaignId) {
            if (!confirm('Are you sure you want to approve this submission? This will move it to pending payment status.')) {
                return;
            }
            
            showLoading();
            try {
                // Update submission status
                await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .doc(submissionId)
                    .update({
                        status: 'pending_payment',
                        reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // Update local data
                const submission = allSubmissions.find(s => s.id === submissionId);
                if (submission) {
                    submission.status = 'pending_payment';
                }
                
                // Refresh displays
                displaySubmissions();
                displayPayments();
                updateStats();
                
                showAlert('Submission approved successfully!', 'success');
            } catch (error) {
                console.error('Error approving submission:', error);
                showAlert('Error approving submission: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // Reject submission
        async function rejectSubmission(submissionId, campaignId) {
            const reason = prompt('Please provide a reason for rejecting this submission:');
            if (reason === null) return; // User cancelled
            
            showLoading();
            try {
                // Update submission status
                await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .doc(submissionId)
                    .update({
                        status: 'rejected',
                        rejectionReason: reason,
                        reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // Update local data
                const submission = allSubmissions.find(s => s.id === submissionId);
                if (submission) {
                    submission.status = 'rejected';
                    submission.rejectionReason = reason;
                }
                
                // Refresh displays
                displaySubmissions();
                updateStats();
                
                showAlert('Submission rejected successfully!', 'success');
            } catch (error) {
                console.error('Error rejecting submission:', error);
                showAlert('Error rejecting submission: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // Approve payment
        async function approvePayment(submissionId, campaignId) {
            try {
                // Get the submission document to check the submission date
                const submissionDoc = await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .doc(submissionId)
                    .get();
                
                if (!submissionDoc.exists) {
                    showAlert('Submission not found', 'error');
                    return;
                }
                
                const submission = submissionDoc.data();
                const submissionDate = submission.submissionDate;
                
                if (!submissionDate) {
                    showAlert('Submission date not found', 'error');
                    return;
                }
                
                // Calculate the difference in days
                const now = new Date();
                const submitDate = submissionDate.toDate();
                const diffTime = Math.abs(now - submitDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 7) {
                    showAlert(`Payment cannot be approved yet. It has been only ${diffDays} days since submission. Please wait until 7 days have passed.`, 'warning');
                    return;
                }
                
                // If we reach here, it's been at least 7 days
                if (!confirm('Are you sure you want to approve this payment?')) {
                    return;
                }
                
                showLoading();
                
                // Update submission status
                await db.collection('campaigns')
                    .doc(campaignId)
                    .collection('submissions')
                    .doc(submissionId)
                    .update({
                        status: 'paid',
                        paymentDate: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // Update local data
                const localSubmission = allSubmissions.find(s => s.id === submissionId);
                if (localSubmission) {
                    localSubmission.status = 'paid';
                }
                
                // Refresh display
                displayPayments();
                
                showAlert('Payment approved successfully!', 'success');
            } catch (error) {
                console.error('Error approving payment:', error);
                showAlert('Error approving payment: ' + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // Get payment amount based on category
        function getPaymentAmount(category) {
            switch (category) {
                case 'Nano': return 1000;
                case 'Micro': return 4000;
                case 'Macro': return 7000;
                case 'Mega': return 15000;
                default: return 0;
            }
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

        // Show loading overlay
        function showLoading() {
            document.getElementById('loading-overlay').classList.add('active');
        }

        // Hide loading overlay
        function hideLoading() {
            document.getElementById('loading-overlay').classList.remove('active');
        }

        // Show custom alert
        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alert-container');
            
            // Create alert element
            const alert = document.createElement('div');
            alert.className = `custom-alert ${type}`;
            
            // Set icon based on type
            let icon = '';
            if (type === 'success') {
                icon = '<i class="fas fa-check-circle"></i>';
            } else if (type === 'error') {
                icon = '<i class="fas fa-exclamation-circle"></i>';
            } else if (type === 'warning') {
                icon = '<i class="fas fa-exclamation-triangle"></i>';
            } else if (type === 'info') {
                icon = '<i class="fas fa-info-circle"></i>';
            }
            
            alert.innerHTML = `
                <div class="custom-alert-icon">${icon}</div>
                <div class="custom-alert-message">${message}</div>
                <div class="custom-alert-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            // Add to container
            alertContainer.appendChild(alert);
            
            // Trigger animation
            setTimeout(() => {
                alert.classList.add('show');
            }, 10);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => {
                    if (alert.parentElement) {
                        alert.parentElement.removeChild(alert);
                    }
                }, 400);
            }, 5000);
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('active');
            }
        }
   