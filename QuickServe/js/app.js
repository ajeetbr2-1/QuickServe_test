/**
 * QuickServe Main Application - Phase 4 Advanced Features Integration
 * Complete marketplace platform with intelligent systems and advanced features
 */

// Wrap entire application in try-catch for error handling
(function () {
    'use strict';

    // Check if dependencies are loaded before initializing
    function checkCoreLibraries() {
        const required = ['Constants', 'Storage', 'AuthService'];
        const missing = required.filter(lib => typeof window[lib] === 'undefined');

        if (missing.length > 0) {
            console.error('❌ Missing core libraries:', missing);
            if (window.SimpleDebug) {
                window.SimpleDebug.updateProgress(`Missing libraries: ${missing.join(', ')}`);
            }
            return false;
        }
        return true;
    }

    class QuickServeApp {
        constructor() {
            this.version = '2.0.0-advanced';
            this.currentView = 'home';
            this.selectedRole = null;
            this.authStep = 'roleSelection';
            this.services = {};
            this.advancedFeatures = {};
            this.realTimeServices = {};
            this.initialized = false;

            // Enhanced configuration
            this.config = {
                enableAdvancedFeatures: true,
                enableRealTimeUpdates: true,
                enableSmartRanking: true,
                enableTrustBadges: true,
                enableAdvancedPayments: true,
                enableAdminDashboard: true,
                enableAdvancedSearch: true,
                enableVoiceSearch: true,
                enableNotifications: true,
                // For external API integration; health check optional
                enableServerAuth: false,
                apiBaseUrl: (window.ENV && window.ENV.API_BASE_URL) || (window.ApiService && window.ApiService.baseURL) || 'https://api.quickserve.com/v1',
                socketUrl: 'wss://ws.quickserve.com'
            };

            this.init();
        }

        /**
         * Initialize the application with advanced features
         */
        async init() {
            console.log('🚀 QuickServe Advanced Platform initializing...');

            try {
                // Update progress
                if (window.SimpleDebug) {
                    window.SimpleDebug.updateProgress('Initializing core services...');
                }

                // Initialize core services first
                await this.initializeServices();

                // Update progress
                if (window.SimpleDebug) {
                    window.SimpleDebug.updateProgress('Initializing advanced features...');
                }

                // Initialize advanced features
                await this.initializeAdvancedFeatures();

                // Check API connectivity (if server auth enabled)
                if (this.config.enableServerAuth && window.ApiService) {
                    this.checkApiHealth();
                }

                // Check authentication status
                this.checkAuthStatus();

                // Setup enhanced event listeners
                this.setupEventListeners();

                // Initialize location services
                await this.initializeLocation();

                // Start real-time services
                await this.startRealTimeServices();

                // Initialize UI enhancements
                this.initializeUIEnhancements();

                // Load initial content
                this.loadHomeView();

                // Hide loading screen
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 1500);

                this.initialized = true;
                console.log('✅ QuickServe Advanced Platform initialized successfully');

                // Show welcome message with advanced features
                this.showAdvancedWelcomeMessage();

            } catch (error) {
                console.error('❌ Failed to initialize advanced features:', error);
                // Fallback to basic mode
                this.initializeBasicMode();
            }
        }

        /**
         * Initialize services with advanced features
         */
        async initializeServices() {
            console.log('⚙️ Initializing core and advanced services...');

            // Core services
            this.services = {
                auth: window.AuthenticationService ? new AuthenticationService() : null,
                location: window.LocationService || null,
                booking: window.BookingService || null,
                storage: window.Storage || null
            };

            // Advanced services initialization
            if (this.config.enableAdvancedFeatures) {
                await this.initializeAdvancedServices();
            }

            console.log('✅ All services initialized');
        }

        /**
         * Initialize advanced services
         */
        async initializeAdvancedServices() {
            try {
                // Smart Ranking Algorithm
                if (window.SmartRankingAlgorithm && this.config.enableSmartRanking) {
                    this.advancedFeatures.smartRanking = new SmartRankingAlgorithm();
                    console.log('✅ Smart Ranking Algorithm initialized');
                }

                // Notification System
                if (window.NotificationSystem && this.config.enableNotifications) {
                    this.advancedFeatures.notifications = new NotificationSystem();
                    await this.advancedFeatures.notifications.init();
                    console.log('✅ Advanced Notification System initialized');
                }

                // Trust Badge System
                if (window.TrustBadgeSystem && this.config.enableTrustBadges) {
                    this.advancedFeatures.trustBadges = new TrustBadgeSystem();
                    console.log('✅ Trust Badge System initialized');
                }

                // Payment Processor
                if (window.PaymentProcessor && this.config.enableAdvancedPayments) {
                    this.advancedFeatures.paymentProcessor = new PaymentProcessor();
                    await this.advancedFeatures.paymentProcessor.init();
                    console.log('✅ Advanced Payment Processor initialized');
                }

                // Advanced Search System
                if (window.AdvancedSearch && this.config.enableAdvancedSearch) {
                    this.advancedFeatures.advancedSearch = new AdvancedSearch();
                    await this.advancedFeatures.advancedSearch.init();
                    console.log('✅ Advanced Search System initialized');
                }

                // Admin Dashboard (if user has admin rights)
                if (window.AdminDashboard && this.config.enableAdminDashboard) {
                    this.advancedFeatures.adminDashboard = new AdminDashboard();
                    console.log('✅ Admin Dashboard initialized');
                }

            } catch (error) {
                console.warn('⚠️ Some advanced services failed to initialize:', error);
            }
        }

        /**
         * Initialize advanced features
         */
        async initializeAdvancedFeatures() {
            if (!this.config.enableAdvancedFeatures) return;

            console.log('🔧 Initializing advanced marketplace features...');

            // Setup advanced search with voice recognition
            if (this.advancedFeatures.advancedSearch) {
                this.setupAdvancedSearch();
            }

            // Setup real-time notifications
            if (this.advancedFeatures.notifications) {
                this.setupAdvancedNotifications();
            }

            // Setup trust and verification systems
            if (this.advancedFeatures.trustBadges) {
                this.setupTrustSystem();
            }

            // Setup advanced payment systems
            if (this.advancedFeatures.paymentProcessor) {
                this.setupAdvancedPayments();
            }

            // Setup smart provider ranking
            if (this.advancedFeatures.smartRanking) {
                this.setupSmartRanking();
            }

            console.log('✅ Advanced features initialized');
        }

        /**
         * Initialize location services with enhanced features
         */
        async initializeLocation() {
            if (this.services.location) {
                try {
                    // Try to get user's current location with enhanced accuracy
                    const location = await this.services.location.getCurrentLocation();

                    // Use smart ranking to update provider relevance based on location
                    if (this.advancedFeatures.smartRanking) {
                        this.advancedFeatures.smartRanking.updateLocationContext(location);
                    }

                    window.Toast.success('Location detected with enhanced accuracy');
                } catch (error) {
                    console.log('Location detection failed, using PIN code input with smart suggestions');
                    this.enableSmartPinCodeSuggestions();
                }
            }
        }

        /**
         * Start real-time services
         */
        async startRealTimeServices() {
            if (!this.config.enableRealTimeUpdates) return;

            console.log('🔄 Starting real-time services...');

            try {
                // Real-time notifications
                if (this.advancedFeatures.notifications) {
                    await this.advancedFeatures.notifications.startRealTimeUpdates();
                    this.realTimeServices.notifications = true;
                }

                // Real-time provider updates
                this.startProviderRealTimeUpdates();

                // Real-time booking status updates
                this.startBookingRealTimeUpdates();

                // WebSocket connection for real-time features
                if (this.config.socketUrl) {
                    await this.initializeWebSocket();
                }

                console.log('✅ Real-time services started');

            } catch (error) {
                console.warn('⚠️ Some real-time services failed to start:', error);
            }
        }

        /**
         * Initialize WebSocket for real-time communication
         */
        async initializeWebSocket() {
            try {
                this.socket = new WebSocket(this.config.socketUrl);

                this.socket.onopen = () => {
                    console.log('🔌 WebSocket connected for real-time updates');
                    this.authenticateWebSocket();
                };

                this.socket.onmessage = (event) => {
                    this.handleWebSocketMessage(JSON.parse(event.data));
                };

                this.socket.onclose = () => {
                    console.log('🔌 WebSocket disconnected, attempting reconnection...');
                    setTimeout(() => this.initializeWebSocket(), 5000);
                };

            } catch (error) {
                console.warn('⚠️ WebSocket initialization failed:', error);
            }
        }

        /**
         * Setup advanced search functionality
         */
        setupAdvancedSearch() {
            const searchContainer = document.getElementById('searchContainer');
            if (searchContainer && this.advancedFeatures.advancedSearch) {
                // Add voice search button
                const voiceSearchBtn = document.createElement('button');
                voiceSearchBtn.id = 'voiceSearchBtn';
                voiceSearchBtn.className = 'voice-search-btn';
                voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceSearchBtn.addEventListener('click', () => {
                    this.advancedFeatures.advancedSearch.startVoiceSearch();
                });

                searchContainer.appendChild(voiceSearchBtn);

                // Enable smart suggestions
                this.advancedFeatures.advancedSearch.enableSmartSuggestions();
            }
        }

        /**
         * Setup advanced notifications
         */
        setupAdvancedNotifications() {
            if (this.advancedFeatures.notifications) {
                // Setup notification event handlers
                this.advancedFeatures.notifications.onNewNotification = (notification) => {
                    this.handleAdvancedNotification(notification);
                };

                // Request browser notification permissions
                this.requestNotificationPermissions();
            }
        }

        /**
         * Setup trust system
         */
        setupTrustSystem() {
            if (this.advancedFeatures.trustBadges) {
                // Enable trust score display for providers
                this.enhanceProviderDisplayWithTrust();

                // Setup verification workflows
                this.advancedFeatures.trustBadges.setupVerificationWorkflows();
            }
        }

        /**
         * Setup advanced payment systems
         */
        setupAdvancedPayments() {
            if (this.advancedFeatures.paymentProcessor) {
                // Setup payment event handlers
                this.advancedFeatures.paymentProcessor.onPaymentSuccess = (payment) => {
                    this.handlePaymentSuccess(payment);
                };

                this.advancedFeatures.paymentProcessor.onPaymentFailure = (error) => {
                    this.handlePaymentFailure(error);
                };

                // Enable advanced payment UI
                this.enhancePaymentUI();
            }
        }

        /**
         * Setup smart ranking
         */
        setupSmartRanking() {
            if (this.advancedFeatures.smartRanking) {
                // Enable dynamic provider ranking
                this.enableDynamicProviderRanking();

                // Setup ranking updates based on user behavior
                this.advancedFeatures.smartRanking.enableBehaviorTracking();
            }
        }

        /**
         * Initialize UI enhancements
         */
        initializeUIEnhancements() {
            // Add glassmorphism effects to new elements
            this.applyGlassmorphismEffects();

            // Enable advanced animations
            this.enableAdvancedAnimations();

            // Setup responsive enhancements
            this.setupResponsiveEnhancements();

            // Add accessibility improvements
            this.addAccessibilityImprovements();
        }

        /**
         * Hide loading screen
         */
        hideLoadingScreen() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }

        /**
         * Check authentication status
         */
        checkAuthStatus() {
            const user = Storage.getCurrentUser();

            if (user) {
                this.updateUIForAuthenticatedUser(user);
            } else {
                this.updateUIForGuest();
            }
        }

        /**
         * Setup enhanced event listeners with advanced features
         */
        setupEventListeners() {
            // Original navigation listeners
            document.querySelectorAll('.category-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNavigation(e.target.closest('a').getAttribute('href').substring(1));
                });
            });

            // Enhanced login button with advanced features
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    if (Auth.isAuthenticated()) {
                        this.showAdvancedUserMenu();
                    } else {
                        if (this.config.enableServerAuth && window.AuthApi) {
                            this.serverLoginPrompt();
                        } else {
                            this.showAuthModal();
                        }
                    }
                });
            }

            // Initialize language state and wire toggle
            try {
                const savedLang = localStorage.getItem('preferredLanguage') || 'en';
                document.documentElement.setAttribute('lang', savedLang);
                this.updateLanguageButton(savedLang);
            } catch (_) {
                this.updateLanguageButton('en');
            }

            const languageBtn = document.getElementById('languageBtn');
            if (languageBtn) {
                languageBtn.addEventListener('click', () => this.toggleLanguage());
            }

            // Service tiles with smart ranking
            document.querySelectorAll('.service-tile').forEach(tile => {
                tile.addEventListener('click', (e) => {
                    const service = e.currentTarget.getAttribute('data-service');
                    this.handleAdvancedServiceSelection(service);
                });
            });

            // Enhanced auth modal
            this.setupAuthModalListeners();

            // Advanced cart and notifications
            this.setupAdvancedPanelListeners();

            // Enhanced search with voice and AI
            this.setupAdvancedSearchListeners();

            // Advanced keyboard shortcuts
            this.setupAdvancedKeyboardShortcuts();

            // Real-time event listeners
            this.setupRealTimeEventListeners();
        }

        /**
         * Initialize language preference helpers
         */
        initLanguagePreference() {
            try {
                const saved = localStorage.getItem('preferredLanguage') || 'en';
                document.documentElement.setAttribute('lang', saved);
                this.updateLanguageButton(saved);

                document.addEventListener('languageChanged', (e) => {
                    const lang = e?.detail?.language || localStorage.getItem('preferredLanguage') || 'en';
                    this.updateLanguageButton(lang);
                });
            } catch (e) {
                this.updateLanguageButton('en');
            }
        }

        toggleLanguage() {
            const current = document.documentElement.getAttribute('lang') || 'en';
            const next = current === 'en' ? 'hi' : 'en';

            document.documentElement.setAttribute('lang', next);
            try { localStorage.setItem('preferredLanguage', next); } catch (_) {}
            this.updateLanguageButton(next);

            if (window.ContentManager && typeof window.ContentManager.setLanguage === 'function') {
                window.ContentManager.setLanguage(next);
            } else {
                try { document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: next } })); } catch (_) {}
            }

            if (window.Toast && typeof window.Toast.show === 'function') {
                window.Toast.show(`Language set to ${next === 'en' ? 'English' : 'Hindi'}`, 'info');
            }
        }

        updateLanguageButton(lang = 'en') {
            const btn = document.getElementById('languageBtn');
            if (!btn) return;
            const label = btn.querySelector('.nav-btn-text') || btn;
            label.textContent = lang === 'en' ? 'EN' : 'HI';
            btn.title = `Language: ${lang === 'en' ? 'English' : 'Hindi'}`;
        }

        /**
         * Setup advanced search listeners
         */
        setupAdvancedSearchListeners() {
            const searchInput = document.getElementById('globalSearch');
            const searchBtn = document.querySelector('.search-btn');
            const pinCodeInput = document.getElementById('pinCodeInput');
            const voiceSearchBtn = document.getElementById('voiceSearchBtn');

            if (searchInput) {
                // Enhanced search with AI suggestions
                searchInput.addEventListener('input', (e) => {
                    if (this.advancedFeatures.advancedSearch) {
                        this.advancedFeatures.advancedSearch.showSmartSuggestions(e.target.value);
                    }
                });

                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performAdvancedSearch();
                    }
                });
            }

            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.performAdvancedSearch();
                });
            }

            if (voiceSearchBtn) {
                voiceSearchBtn.addEventListener('click', () => {
                    this.startVoiceSearch();
                });
            }

            if (pinCodeInput) {
                pinCodeInput.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;

                    if (value.length === 6) {
                        Storage.updateSettings({ location: value });

                        // Update smart ranking with new location
                        if (this.advancedFeatures.smartRanking) {
                            this.advancedFeatures.smartRanking.updateLocationContext({ pinCode: value });
                        }
                    }
                });
            }
        }

        /**
         * Setup advanced keyboard shortcuts
         */
        setupAdvancedKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                        case 'k':
                            e.preventDefault();
                            document.getElementById('globalSearch')?.focus();
                            break;
                        case 'v':
                            e.preventDefault();
                            if (this.config.enableVoiceSearch) {
                                this.startVoiceSearch();
                            }
                            break;
                        case 'n':
                            e.preventDefault();
                            this.togglePanel('notificationPanel');
                            break;
                        case 'p':
                            e.preventDefault();
                            if (Auth.isAuthenticated()) {
                                this.showAdvancedUserMenu();
                            }
                            break;
                    }
                }
            });
        }

        /**
         * Quick server-auth login prompt (email/phone + password + role)
         */
        async serverLoginPrompt() {
            try {
                const identifier = prompt('Enter email or phone for login:');
                if (!identifier) return;
                const password = prompt('Enter password:');
                if (!password) return;
                let role = prompt('Enter role (customer/provider/admin):', 'customer');
                role = (role || 'customer').toLowerCase();

                Toast.show('Signing in...', 'info');
                const res = await AuthApi.login({ identifier, password, role });

                if (res && res.user) {
                    const user = res.user;
                    this.syncLocalUser(user);
                    Storage.setCurrentUser(user.id);
                    this.updateUIForAuthenticatedUser(user);
                    Toast.show(`Welcome, ${user.name || 'User'}!`, 'success');
                } else {
                    Toast.show('Login failed', 'error');
                }
            } catch (err) {
                console.error('Server login failed:', err);
                const msg = err?.message || 'Login failed';
                Toast.show(msg, 'error');
            }
        }

        /**
         * Logout handler (supports server auth)
         */
        async performLogout() {
            try {
                if (this.config.enableServerAuth && window.AuthApi) {
                    await AuthApi.logout();
                }
            } catch (e) {
                console.warn('Server logout warning:', e);
            } finally {
                Storage.clearSession();
                this.updateUIForGuest();
                Toast.show('You have been logged out', 'success');
            }
        }

        /**
         * Ensure server user exists in local storage for UI flows
         */
        syncLocalUser(user) {
            if (!user || !user.id) return;
            const existing = Storage.findInCollection('users', u => u.id === user.id);
            if (existing) {
                Storage.updateInCollection('users', user.id, {
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phone,
                    role: user.role,
                    status: user.status,
                    verified: user.verified
                });
            } else {
                Storage.addToCollection('users', {
                    id: user.id,
                    fullName: user.name,
                    email: user.email,
                    phoneNumber: user.phone,
                    role: user.role,
                    isActive: user.status === 'active',
                    verificationStatus: user.verified ? 'fully_verified' : 'unverified'
                });
            }
        }

        /**
         * Ping API health and show a toast
         */
        async checkApiHealth() {
            try {
                const r = await ApiService.get('/health');
                if (r?.data?.ok) {
                    Toast.show('Connected to API', 'success');
                }
            } catch (e) {
                console.warn('API health failed', e);
                Toast.show('API not reachable. Using local mode.', 'warning');
            }
        }

        /**
         * Setup real-time event listeners
         */
        setupRealTimeEventListeners() {
            // Custom events for real-time updates
            document.addEventListener('providerStatusUpdate', (e) => {
                this.handleProviderStatusUpdate(e.detail);
            });

            document.addEventListener('newBooking', (e) => {
                this.handleNewBooking(e.detail);
            });

            document.addEventListener('paymentUpdate', (e) => {
                this.handlePaymentUpdate(e.detail);
            });
        }

        /**
         * Setup advanced panel listeners
         */
        setupAdvancedPanelListeners() {
            // Enhanced notification panel
            const notificationBtn = document.getElementById('notificationBtn');
            const closeNotifications = document.getElementById('closeNotifications');

            if (notificationBtn) {
                notificationBtn.addEventListener('click', () => {
                    this.showAdvancedNotificationPanel();
                });
            }

            if (closeNotifications) {
                closeNotifications.addEventListener('click', () => {
                    this.closePanel('notificationPanel');
                });
            }

            // Enhanced cart sidebar with payment options
            const cartBtn = document.getElementById('cartBtn');
            const closeCart = document.getElementById('closeCart');

            if (cartBtn) {
                cartBtn.addEventListener('click', () => {
                    this.showAdvancedCartSidebar();
                });
            }

            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    this.closePanel('cartSidebar');
                });
            }

            // Admin panel (if applicable)
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn && this.hasAdminAccess()) {
                adminBtn.addEventListener('click', () => {
                    this.showAdminDashboard();
                });
            }
        }

        /**
         * Setup authentication modal listeners
         */
        setupAuthModalListeners() {
            // Close modal
            const closeBtn = document.getElementById('closeAuthModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeAuthModal());
            }

            // Role selection
            document.querySelectorAll('.role-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const role = e.currentTarget.getAttribute('data-role');
                    this.selectRole(role);
                });
            });

            // Phone number input
            const phoneInput = document.getElementById('phoneNumber');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;

                    const sendOtpBtn = document.getElementById('sendOtpBtn');
                    if (sendOtpBtn) {
                        sendOtpBtn.disabled = !Auth.validatePhoneNumber(value);
                    }
                });
            }

            // Send OTP
            const sendOtpBtn = document.getElementById('sendOtpBtn');
            if (sendOtpBtn) {
                sendOtpBtn.addEventListener('click', () => this.sendOTP());
            }

            // OTP input auto-advance
            document.querySelectorAll('.otp-digit').forEach((input, index, inputs) => {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }

                    // Check if all digits are entered
                    const otp = Array.from(inputs).map(i => i.value).join('');
                    const verifyBtn = document.getElementById('verifyOtpBtn');
                    if (verifyBtn) {
                        verifyBtn.disabled = otp.length !== 6;
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        inputs[index - 1].focus();
                    }
                });
            });

            // Verify OTP
            const verifyOtpBtn = document.getElementById('verifyOtpBtn');
            if (verifyOtpBtn) {
                verifyOtpBtn.addEventListener('click', () => this.verifyOTP());
            }

            // Aadhaar consent
            const aadhaarConsent = document.getElementById('aadhaarConsent');
            if (aadhaarConsent) {
                aadhaarConsent.addEventListener('change', (e) => {
                    const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
                    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
                    if (verifyAadhaarBtn) {
                        verifyAadhaarBtn.disabled = !e.target.checked || !Auth.validateAadhaarNumber(aadhaarNumber);
                    }
                });
            }

            // Aadhaar input
            const aadhaarInput = document.getElementById('aadhaarNumber');
            if (aadhaarInput) {
                aadhaarInput.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;

                    const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
                    const consent = document.getElementById('aadhaarConsent').checked;
                    if (verifyAadhaarBtn) {
                        verifyAadhaarBtn.disabled = !consent || !Auth.validateAadhaarNumber(value);
                    }
                });
            }

            // Verify Aadhaar
            const verifyAadhaarBtn = document.getElementById('verifyAadhaarBtn');
            if (verifyAadhaarBtn) {
                verifyAadhaarBtn.addEventListener('click', () => this.verifyAadhaar());
            }

            // Complete profile
            const completeProfileBtn = document.getElementById('completeProfileBtn');
            if (completeProfileBtn) {
                completeProfileBtn.addEventListener('click', () => this.completeProfile());
            }
        }

        /**
         * Setup panel listeners
         */
        setupPanelListeners() {
            // Notification panel
            const notificationBtn = document.getElementById('notificationBtn');
            const closeNotifications = document.getElementById('closeNotifications');

            if (notificationBtn) {
                notificationBtn.addEventListener('click', () => {
                    this.togglePanel('notificationPanel');
                });
            }

            if (closeNotifications) {
                closeNotifications.addEventListener('click', () => {
                    this.closePanel('notificationPanel');
                });
            }

            // Cart sidebar
            const cartBtn = document.getElementById('cartBtn');
            const closeCart = document.getElementById('closeCart');

            if (cartBtn) {
                cartBtn.addEventListener('click', () => {
                    this.togglePanel('cartSidebar');
                });
            }

            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    this.closePanel('cartSidebar');
                });
            }
        }

        /**
         * Setup search listeners
         */
        setupSearchListeners() {
            const searchInput = document.getElementById('globalSearch');
            const searchBtn = document.querySelector('.search-btn');
            const pinCodeInput = document.getElementById('pinCodeInput');

            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch();
                    }
                });
            }

            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.performSearch();
                });
            }

            if (pinCodeInput) {
                pinCodeInput.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;

                    if (value.length === 6) {
                        Storage.updateSettings({ location: value });
                    }
                });
            }
        }

        /**
         * Show authentication modal
         */
        showAuthModal() {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.classList.add('active');
                this.authStep = 'roleSelection';
                this.showAuthStep('roleSelection');
            }
        }

        /**
         * Close authentication modal
         */
        closeAuthModal() {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }

        /**
         * Select role
         */
        selectRole(role) {
            this.selectedRole = role;
            this.showAuthStep('phoneInput');
        }

        /**
         * Show specific auth step
         */
        showAuthStep(step) {
            // Hide all steps
            document.querySelectorAll('.auth-step').forEach(el => {
                el.classList.add('hidden');
            });

            // Show selected step
            const stepElement = document.getElementById(step);
            if (stepElement) {
                stepElement.classList.remove('hidden');
            }

            this.authStep = step;
        }

        /**
         * Send OTP
         */
        async sendOTP() {
            const phoneNumber = document.getElementById('phoneNumber').value;

            if (!Auth.validatePhoneNumber(phoneNumber)) {
                Toast.show('Please enter a valid phone number', 'error');
                return;
            }

            // Generate OTP
            Auth.generateOTP();

            // Update UI
            document.getElementById('sentToNumber').textContent = '+91 ' + phoneNumber;
            this.showAuthStep('otpVerification');

            // Start OTP timer
            this.startOTPTimer();

            Toast.show('OTP sent successfully', 'success');
        }

        /**
         * Start OTP timer
         */
        startOTPTimer() {
            let seconds = 30;
            const timerElement = document.getElementById('otpTimer');
            const resendBtn = document.getElementById('resendOtpBtn');

            const interval = setInterval(() => {
                seconds--;
                if (timerElement) {
                    timerElement.textContent = seconds;
                }

                if (seconds <= 0) {
                    clearInterval(interval);
                    if (resendBtn) {
                        resendBtn.disabled = false;
                    }
                }
            }, 1000);
        }

        /**
         * Verify OTP
         */
        async verifyOTP() {
            const otpInputs = document.querySelectorAll('.otp-digit');
            const otp = Array.from(otpInputs).map(i => i.value).join('');
            const phoneNumber = document.getElementById('phoneNumber').value;

            const result = Auth.verifyOTP(otp);

            if (result.success) {
                // Check if user exists
                const existingUser = Storage.findInCollection('users',
                    u => u.phoneNumber === phoneNumber
                );

                if (existingUser) {
                    // Login existing user
                    Storage.setCurrentUser(existingUser.id);
                    this.updateUIForAuthenticatedUser(existingUser);
                    this.closeAuthModal();
                    Toast.show('Welcome back!', 'success');
                } else {
                    // New user - proceed with registration
                    if (this.selectedRole === 'provider') {
                        this.showAuthStep('aadhaarKyc');
                    } else {
                        this.showAuthStep('profileSetup');

                        // Hide provider-only fields
                        document.querySelectorAll('.provider-only').forEach(el => {
                            el.classList.add('hidden');
                        });
                    }
                }
            } else {
                Toast.show(result.message, 'error');
            }
        }

        /**
         * Verify Aadhaar
         */
        async verifyAadhaar() {
            const aadhaarNumber = document.getElementById('aadhaarNumber').value;
            const consent = document.getElementById('aadhaarConsent').checked;

            // Show loading state
            const btn = document.getElementById('verifyAadhaarBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Verifying...';
            btn.disabled = true;

            const result = await Auth.verifyAadhaar(aadhaarNumber, consent);

            // Reset button
            btn.textContent = originalText;
            btn.disabled = false;

            if (result.success) {
                Toast.show('Aadhaar verified successfully', 'success');
                this.showAuthStep('profileSetup');

                // Show provider fields
                document.querySelectorAll('.provider-only').forEach(el => {
                    el.classList.remove('hidden');
                });
            } else {
                Toast.show(result.message, 'error');
            }
        }

        /**
         * Complete profile
         */
        async completeProfile() {
            const phoneNumber = document.getElementById('phoneNumber').value;
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;

            if (!fullName) {
                Toast.show('Please enter your full name', 'error');
                return;
            }

            // Get selected services for providers
            let services = [];
            if (this.selectedRole === 'provider') {
                const serviceCheckboxes = document.querySelectorAll('.service-tag input:checked');
                services = Array.from(serviceCheckboxes).map(cb => cb.value);

                if (services.length === 0) {
                    Toast.show('Please select at least one service category', 'error');
                    return;
                }
            }

            // Register user
            const userData = {
                phoneNumber,
                fullName,
                email,
                role: this.selectedRole,
                services
            };

            const result = await Auth.registerUser(userData);

            if (result.success) {
                Storage.setCurrentUser(result.user.id);
                this.updateUIForAuthenticatedUser(result.user);
                this.closeAuthModal();
                Toast.show('Registration successful! Welcome to QuickServe', 'success');
            } else {
                Toast.show(result.message, 'error');
            }
        }

        /**
         * Update UI for authenticated user
         */
        updateUIForAuthenticatedUser(user) {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> <span>${user.fullName || 'Profile'}</span>`;
            }

            // Update notification badge
            const unreadCount = Storage.getUnreadNotificationsCount();
            const notificationBadge = document.querySelector('.notification-badge');
            if (notificationBadge) {
                notificationBadge.textContent = unreadCount;
                notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        }

        /**
         * Update UI for guest
         */
        updateUIForGuest() {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
            }
        }

        /**
         * Handle navigation
         */
        handleNavigation(view) {
            // Update active link
            document.querySelectorAll('.category-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`.category-link[href="#${view}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Load view
            this.currentView = view;
            this.loadView(view);
        }

        /**
         * Load view
         */
        loadView(view) {
            const contentContainer = document.getElementById('dynamicContent');

            switch (view) {
                case 'services':
                    this.loadServicesView();
                    break;
                case 'providers':
                    this.loadProvidersView();
                    break;
                case 'products':
                    this.loadProductsView();
                    break;
                case 'bookings':
                    this.loadBookingsView();
                    break;
                case 'offers':
                    this.loadOffersView();
                    break;
                default:
                    this.loadHomeView();
            }
        }

        /**
         * Load home view
         */
        loadHomeView() {
            // Home view is already loaded by default
            document.getElementById('heroSection').style.display = 'block';
            document.getElementById('dynamicContent').innerHTML = '';
        }

        /**
         * Load services view
         */
        loadServicesView() {
            document.getElementById('heroSection').style.display = 'none';
            const content = `
            <section class="py-12">
                <div class="container">
                    <h2 class="text-3xl font-bold mb-8">Our Services</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.generateServiceCards()}
                    </div>
                </div>
            </section>
        `;
            document.getElementById('dynamicContent').innerHTML = content;
        }

        /**
         * Generate service cards
         */
        generateServiceCards() {
            const services = [
                { name: 'Plumbing', icon: 'fa-wrench', price: '₹500/hr' },
                { name: 'Electrical', icon: 'fa-bolt', price: '₹450/hr' },
                { name: 'Carpentry', icon: 'fa-hammer', price: '₹600/hr' },
                { name: 'Painting', icon: 'fa-paint-roller', price: '₹400/hr' },
                { name: 'Cleaning', icon: 'fa-broom', price: '₹350/hr' },
                { name: 'AC Repair', icon: 'fa-snowflake', price: '₹800/hr' }
            ];

            return services.map(service => `
            <div class="glass-card hover:scale-105 transition cursor-pointer">
                <div class="text-center">
                    <i class="fas ${service.icon} text-4xl text-primary-blue mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">${service.name}</h3>
                    <p class="text-gray-600 mb-4">Starting from ${service.price}</p>
                    <button class="glass-btn">Book Now</button>
                </div>
            </div>
        `).join('');
        }

        /**
         * Load providers view
         */
        loadProvidersView() {
            document.getElementById('heroSection').style.display = 'none';
            // Implementation for providers view
            document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Providers View - Coming Soon</h2></div>';
        }

        /**
         * Load products view
         */
        loadProductsView() {
            document.getElementById('heroSection').style.display = 'none';
            // Implementation for products view
            document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Products View - Coming Soon</h2></div>';
        }

        /**
         * Load bookings view
         */
        loadBookingsView() {
            document.getElementById('heroSection').style.display = 'none';

            if (!Auth.isAuthenticated()) {
                Toast.show('Please login to view bookings', 'warning');
                this.showAuthModal();
                return;
            }

            // Implementation for bookings view
            document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Your Bookings - Coming Soon</h2></div>';
        }

        /**
         * Load offers view
         */
        loadOffersView() {
            document.getElementById('heroSection').style.display = 'none';
            // Implementation for offers view
            document.getElementById('dynamicContent').innerHTML = '<div class="container py-12"><h2>Special Offers - Coming Soon</h2></div>';
        }

        /**
         * Handle advanced service selection with smart ranking
         */
        handleAdvancedServiceSelection(service) {
            if (service === 'more') {
                this.loadServicesView();
            } else {
                // Use smart ranking to find best providers
                this.searchProvidersWithSmartRanking(service);
            }
        }

        /**
         * Search providers using smart ranking algorithm
         */
        async searchProvidersWithSmartRanking(service) {
            if (this.advancedFeatures.smartRanking) {
                const rankedProviders = await this.advancedFeatures.smartRanking.findBestProviders(service);
                this.displayRankedProviders(rankedProviders, service);
            } else {
                // Fallback to basic search
                this.searchProvidersByService(service);
            }
        }

        /**
         * Display ranked providers with trust scores
         */
        displayRankedProviders(providers, service) {
            const content = `
            <section class="py-12">
                <div class="container">
                    <h2 class="text-3xl font-bold mb-8">Top ${service} Providers</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${providers.map((provider, index) => this.generateAdvancedProviderCard(provider, index + 1)).join('')}
                    </div>
                </div>
            </section>
        `;

            document.getElementById('heroSection').style.display = 'none';
            document.getElementById('dynamicContent').innerHTML = content;

            // Add trust badge verification
            this.enhanceProvidersWithTrustBadges();
        }

        /**
         * Generate advanced provider card with trust badges and smart ranking
         */
        generateAdvancedProviderCard(provider, rank) {
            const trustScore = this.advancedFeatures.trustBadges?.calculateTrustScore(provider) || 0;
            const badges = this.advancedFeatures.trustBadges?.getProviderBadges(provider.id) || [];

            return `
            <div class="glass-card provider-card-advanced" data-provider-id="${provider.id}">
                <div class="provider-rank">#${rank}</div>
                <div class="provider-header">
                    <img src="${provider.avatar || '/assets/images/default-avatar.jpg'}" alt="${provider.name}">
                    <div class="provider-info">
                        <h3>${provider.name}</h3>
                        <div class="trust-score">
                            <div class="trust-bar">
                                <div class="trust-fill" style="width: ${trustScore}%"></div>
                            </div>
                            <span>Trust Score: ${Math.round(trustScore)}%</span>
                        </div>
                        <div class="rating">
                            ${'⭐'.repeat(Math.floor(provider.rating))} ${provider.rating} (${provider.reviewCount} reviews)
                        </div>
                    </div>
                </div>
                <div class="provider-badges">
                    ${badges.map(badge => `<span class="trust-badge ${badge.type}">${badge.name}</span>`).join('')}
                </div>
                <div class="provider-services">
                    ${provider.services.join(', ')}
                </div>
                <div class="provider-actions">
                    <button class="glass-btn primary" onclick="QuickServeApp.bookProvider('${provider.id}')">
                        Book Now
                    </button>
                    <button class="glass-btn secondary" onclick="QuickServeApp.viewProvider('${provider.id}')">
                        View Profile
                    </button>
                </div>
            </div>
        `;
        }

        /**
         * Perform advanced search with AI and voice
         */
        async performAdvancedSearch() {
            const searchTerm = document.getElementById('globalSearch').value;
            const pinCode = document.getElementById('pinCodeInput').value;

            if (!searchTerm) {
                Toast.show('Please enter a search term', 'warning');
                return;
            }

            if (this.advancedFeatures.advancedSearch) {
                // Use AI-powered search
                const results = await this.advancedFeatures.advancedSearch.performIntelligentSearch(searchTerm, {
                    location: pinCode,
                    userPreferences: this.getUserPreferences()
                });

                this.displayAdvancedSearchResults(results);
            } else {
                // Fallback to basic search
                this.performBasicSearch(searchTerm);
            }

            // Save to search history
            Storage.saveSearchHistory(searchTerm);
        }

        /**
         * Start voice search
         */
        async startVoiceSearch() {
            if (!this.config.enableVoiceSearch || !this.advancedFeatures.advancedSearch) {
                Toast.show('Voice search not available', 'warning');
                return;
            }

            try {
                const searchTerm = await this.advancedFeatures.advancedSearch.startVoiceSearch();
                if (searchTerm) {
                    document.getElementById('globalSearch').value = searchTerm;
                    this.performAdvancedSearch();
                }
            } catch (error) {
                Toast.show('Voice search failed: ' + error.message, 'error');
            }
        }

        /**
         * Show advanced notification panel
         */
        showAdvancedNotificationPanel() {
            if (this.advancedFeatures.notifications) {
                this.advancedFeatures.notifications.showNotificationPanel();
            }
            this.togglePanel('notificationPanel');
        }

        /**
         * Show advanced cart sidebar with payment options
         */
        showAdvancedCartSidebar() {
            if (this.advancedFeatures.paymentProcessor) {
                this.enhanceCartWithPaymentOptions();
            }
            this.togglePanel('cartSidebar');
        }

        /**
         * Show admin dashboard
         */
        showAdminDashboard() {
            if (this.advancedFeatures.adminDashboard && this.hasAdminAccess()) {
                this.advancedFeatures.adminDashboard.show();
            } else {
                Toast.show('Admin access required', 'error');
            }
        }

        /**
         * Show advanced user menu
         */
        showAdvancedUserMenu() {
            const user = Storage.getCurrentUser();
            if (!user) return;

            // Create advanced user menu with additional options
            const menuContent = `
            <div class="advanced-user-menu">
                <div class="user-profile-section">
                    <img src="${user.avatar || '/assets/images/default-avatar.jpg'}" alt="${user.fullName}">
                    <div class="user-info">
                        <h3>${user.fullName}</h3>
                        <p>${user.email}</p>
                        ${this.generateTrustScoreDisplay(user)}
                    </div>
                </div>
                <div class="menu-options">
                    <a href="#profile">My Profile</a>
                    <a href="#bookings">My Bookings</a>
                    <a href="#payments">Payment Methods</a>
                    <a href="#notifications">Notification Settings</a>
                    ${user.role === 'provider' ? '<a href="#provider-dashboard">Provider Dashboard</a>' : ''}
                    ${this.hasAdminAccess() ? '<a href="#admin">Admin Panel</a>' : ''}
                    <a href="#settings">Settings</a>
                    <a href="#logout" onclick="QuickServeApp.logout()">Logout</a>
                </div>
            </div>
        `;

            // Show menu (implementation would create modal or dropdown)
            Toast.show('Advanced user menu would open here', 'info');
        }

        /**
         * Handle advanced notifications
         */
        handleAdvancedNotification(notification) {
            // Show browser notification if enabled
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/assets/images/logo-icon.png',
                    badge: '/assets/images/badge-icon.png'
                });
            }

            // Update notification badge
            this.updateNotificationBadge();

            // Trigger real-time UI updates
            this.updateNotificationUI(notification);
        }

        /**
         * Handle payment success with advanced features
         */
        handlePaymentSuccess(payment) {
            // Send notification
            if (this.advancedFeatures.notifications) {
                this.advancedFeatures.notifications.sendNotification({
                    type: 'payment_success',
                    title: 'Payment Successful',
                    message: `Payment of ₹${payment.amount} completed successfully`,
                    userId: payment.userId
                });
            }

            // Update trust score
            if (this.advancedFeatures.trustBadges) {
                this.advancedFeatures.trustBadges.updatePaymentHistory(payment.userId, payment);
            }

            Toast.show('Payment completed successfully!', 'success');
        }

        /**
         * Handle payment failure
         */
        handlePaymentFailure(error) {
            // Send notification
            if (this.advancedFeatures.notifications) {
                this.advancedFeatures.notifications.sendNotification({
                    type: 'payment_failed',
                    title: 'Payment Failed',
                    message: error.message,
                    userId: error.userId
                });
            }

            Toast.show(`Payment failed: ${error.message}`, 'error');
        }

        /**
         * Real-time event handlers
         */
        handleProviderStatusUpdate(update) {
            // Update provider availability in real-time
            const providerCard = document.querySelector(`[data-provider-id="${update.providerId}"]`);
            if (providerCard) {
                const statusElement = providerCard.querySelector('.provider-status');
                if (statusElement) {
                    statusElement.textContent = update.status;
                    statusElement.className = `provider-status status-${update.status.toLowerCase()}`;
                }
            }
        }

        handleNewBooking(booking) {
            // Update booking count
            const user = Storage.getCurrentUser();
            if (user && user.id === booking.customerId) {
                this.updateBookingBadge();
            }
        }

        handlePaymentUpdate(payment) {
            // Update payment status in UI
            const paymentElement = document.querySelector(`[data-payment-id="${payment.id}"]`);
            if (paymentElement) {
                paymentElement.querySelector('.payment-status').textContent = payment.status;
            }
        }

        /**
         * WebSocket message handler
         */
        handleWebSocketMessage(message) {
            switch (message.type) {
                case 'provider_update':
                    this.handleProviderStatusUpdate(message.data);
                    break;
                case 'booking_update':
                    this.handleNewBooking(message.data);
                    break;
                case 'notification':
                    this.handleAdvancedNotification(message.data);
                    break;
                case 'payment_update':
                    this.handlePaymentUpdate(message.data);
                    break;
                default:
                    console.log('Unknown WebSocket message:', message);
            }
        }

        /**
         * Utility methods for advanced features
         */

        /**
         * Check if user has admin access
         */
        hasAdminAccess() {
            const user = Storage.getCurrentUser();
            return user && (user.role === 'admin' || user.permissions?.includes('admin'));
        }

        /**
         * Get user preferences
         */
        getUserPreferences() {
            const user = Storage.getCurrentUser();
            return user?.preferences || {};
        }

        /**
         * Generate trust score display
         */
        generateTrustScoreDisplay(user) {
            if (!this.advancedFeatures.trustBadges) return '';

            const trustScore = this.advancedFeatures.trustBadges.calculateTrustScore(user);
            return `
            <div class="trust-score-mini">
                <span>Trust Score: ${Math.round(trustScore)}%</span>
                <div class="trust-bar-mini">
                    <div class="trust-fill" style="width: ${trustScore}%"></div>
                </div>
            </div>
        `;
        }

        /**
         * Enhance providers with trust badges
         */
        enhanceProvidersWithTrustBadges() {
            if (!this.advancedFeatures.trustBadges) return;

            document.querySelectorAll('.provider-card-advanced').forEach(card => {
                const providerId = card.getAttribute('data-provider-id');
                const badges = this.advancedFeatures.trustBadges.getProviderBadges(providerId);

                // Add verification indicators
                badges.forEach(badge => {
                    if (badge.verified) {
                        card.classList.add('verified-provider');
                    }
                });
            });
        }

        /**
         * Enhance cart with payment options
         */
        enhanceCartWithPaymentOptions() {
            if (!this.advancedFeatures.paymentProcessor) return;

            const cartContainer = document.getElementById('cartContent');
            if (cartContainer) {
                const paymentOptions = this.advancedFeatures.paymentProcessor.getAvailablePaymentMethods();

                const paymentHTML = `
                <div class="payment-options-section">
                    <h3>Payment Options</h3>
                    <div class="payment-methods-grid">
                        ${paymentOptions.map(method => `
                            <div class="payment-method" data-method="${method.id}">
                                <i class="${method.icon}"></i>
                                <span>${method.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

                cartContainer.insertAdjacentHTML('beforeend', paymentHTML);
            }
        }

        /**
         * Apply glassmorphism effects to new elements
         */
        applyGlassmorphismEffects() {
            const newElements = document.querySelectorAll('.glass-card, .modal-content, .panel');
            newElements.forEach(element => {
                element.style.backdropFilter = 'blur(10px)';
                element.style.webkitBackdropFilter = 'blur(10px)';
            });
        }

        /**
         * Enable advanced animations
         */
        enableAdvancedAnimations() {
            // Add intersection observer for scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            });

            document.querySelectorAll('.glass-card, .service-tile').forEach(el => {
                observer.observe(el);
            });
        }

        /**
         * Setup responsive enhancements
         */
        setupResponsiveEnhancements() {
            // Add responsive classes based on screen size
            const updateResponsiveClasses = () => {
                const width = window.innerWidth;
                const body = document.body;

                body.classList.toggle('mobile', width < 768);
                body.classList.toggle('tablet', width >= 768 && width < 1024);
                body.classList.toggle('desktop', width >= 1024);
            };

            updateResponsiveClasses();
            window.addEventListener('resize', updateResponsiveClasses);
        }

        /**
         * Add accessibility improvements
         */
        addAccessibilityImprovements() {
            // Add keyboard navigation support
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });

            // Add ARIA labels to interactive elements
            document.querySelectorAll('button, a, input').forEach(element => {
                if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                    const text = element.textContent || element.value || element.title;
                    if (text) {
                        element.setAttribute('aria-label', text.trim());
                    }
                }
            });
        }

        /**
         * Enable smart PIN code suggestions
         */
        enableSmartPinCodeSuggestions() {
            const pinCodeInput = document.getElementById('pinCodeInput');
            if (pinCodeInput && this.advancedFeatures.advancedSearch) {
                // Add location suggestions based on user input
                pinCodeInput.addEventListener('input', (e) => {
                    if (e.target.value.length >= 3) {
                        this.advancedFeatures.advancedSearch.suggestLocations(e.target.value);
                    }
                });
            }
        }

        /**
         * Request notification permissions
         */
        async requestNotificationPermissions() {
            if ('Notification' in window && Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    Toast.show('Notifications enabled successfully', 'success');
                }
            }
        }

        /**
         * Start provider real-time updates
         */
        startProviderRealTimeUpdates() {
            this.realTimeServices.providerUpdates = setInterval(() => {
                // Simulate real-time provider status updates
                this.checkProviderUpdates();
            }, 30000); // Check every 30 seconds
        }

        /**
         * Start booking real-time updates
         */
        startBookingRealTimeUpdates() {
            this.realTimeServices.bookingUpdates = setInterval(() => {
                // Simulate real-time booking status updates
                this.checkBookingUpdates();
            }, 20000); // Check every 20 seconds
        }

        /**
         * Check provider updates
         */
        checkProviderUpdates() {
            // In a real app, this would make an API call
            const providers = Storage.getCollection('providers');
            providers.forEach(provider => {
                // Simulate status changes
                if (Math.random() > 0.95) { // 5% chance of status change
                    const newStatus = Math.random() > 0.5 ? 'available' : 'busy';
                    this.handleProviderStatusUpdate({
                        providerId: provider.id,
                        status: newStatus
                    });
                }
            });
        }

        /**
         * Check booking updates
         */
        checkBookingUpdates() {
            // In a real app, this would make an API call
            const bookings = Storage.getCollection('bookings');
            const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

            activeBookings.forEach(booking => {
                // Simulate booking status updates
                if (Math.random() > 0.98) { // 2% chance of status change
                    const statusOptions = ['confirmed', 'in_progress', 'completed'];
                    const newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

                    if (newStatus !== booking.status) {
                        booking.status = newStatus;
                        Storage.updateInCollection('bookings', booking.id, booking);
                        this.handleNewBooking(booking);
                    }
                }
            });
        }

        /**
         * Update notification badge
         */
        updateNotificationBadge() {
            const unreadCount = Storage.getUnreadNotificationsCount();
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        }

        /**
         * Update booking badge
         */
        updateBookingBadge() {
            const user = Storage.getCurrentUser();
            if (!user) return;

            const userBookings = Storage.filterCollection('bookings', b => b.customerId === user.id);
            const activeBookings = userBookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status));

            const badge = document.querySelector('.booking-badge');
            if (badge) {
                badge.textContent = activeBookings.length;
                badge.style.display = activeBookings.length > 0 ? 'flex' : 'none';
            }
        }

        /**
         * Update notification UI
         */
        updateNotificationUI(notification) {
            const notificationsList = document.getElementById('notificationsList');
            if (notificationsList) {
                const notificationElement = document.createElement('div');
                notificationElement.className = 'notification-item new';
                notificationElement.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">Just now</span>
                </div>
            `;

                notificationsList.prepend(notificationElement);

                // Remove 'new' class after animation
                setTimeout(() => {
                    notificationElement.classList.remove('new');
                }, 3000);
            }
        }

        /**
         * Get notification icon based on type
         */
        getNotificationIcon(type) {
            const icons = {
                booking: 'calendar',
                payment: 'credit-card',
                message: 'envelope',
                alert: 'exclamation-triangle',
                success: 'check-circle',
                default: 'bell'
            };
            return icons[type] || icons.default;
        }

        /**
         * Show advanced welcome message
         */
        showAdvancedWelcomeMessage() {
            const user = Storage.getCurrentUser();
            if (user) {
                const message = `Welcome back, ${user.fullName}! 🚀 Advanced features are now active.`;
                Toast.show(message, 'success');

                // Show feature highlights for new users
                if (user.isNewUser) {
                    this.showFeatureHighlights();
                }
            } else {
                Toast.show('🎉 Welcome to QuickServe Advanced Platform!', 'info');
            }
        }

        /**
         * Show feature highlights
         */
        showFeatureHighlights() {
            const features = [
                'Voice Search: Press Ctrl+V or click the microphone icon',
                'Smart Provider Ranking: Get the best matches automatically',
                'Real-time Notifications: Stay updated instantly',
                'Trust Badges: See verified and trusted providers',
                'Advanced Payments: Multiple secure payment options'
            ];

            // Implementation would show a tour or highlights modal
            console.log('Feature highlights:', features);
        }

        /**
         * Initialize basic mode (fallback)
         */
        initializeBasicMode() {
            console.log('🔄 Falling back to basic mode...');

            // Disable advanced features
            this.config.enableAdvancedFeatures = false;

            // Initialize basic services only
            this.initializeServices();
            this.checkAuthStatus();
            this.setupEventListeners();
            this.loadHomeView();

            Toast.show('App running in basic mode', 'warning');
        }

        /**
         * Authenticate WebSocket connection
         */
        authenticateWebSocket() {
            const user = Storage.getCurrentUser();
            if (user && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'authenticate',
                    data: { userId: user.id, sessionToken: user.sessionToken }
                }));
            }
        }

        /**
         * Enable dynamic provider ranking
         */
        enableDynamicProviderRanking() {
            if (!this.advancedFeatures.smartRanking) return;

            // Update rankings based on user interactions
            document.addEventListener('click', (e) => {
                const providerCard = e.target.closest('.provider-card-advanced');
                if (providerCard) {
                    const providerId = providerCard.getAttribute('data-provider-id');
                    this.advancedFeatures.smartRanking.recordUserInteraction(providerId, 'click');
                }
            });
        }

        /**
         * Display advanced search results
         */
        displayAdvancedSearchResults(results) {
            const content = `
            <section class="py-12">
                <div class="container">
                    <h2 class="text-3xl font-bold mb-8">Search Results</h2>
                    ${results.suggestions ? `
                        <div class="search-suggestions mb-6">
                            <h3>Did you mean:</h3>
                            ${results.suggestions.map(s => `<span class="suggestion-tag">${s}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="search-results-grid">
                        ${results.providers?.map(provider => this.generateAdvancedProviderCard(provider, 0)).join('') || ''}
                        ${results.services?.map(service => this.generateServiceCard(service)).join('') || ''}
                    </div>
                </div>
            </section>
        `;

            document.getElementById('heroSection').style.display = 'none';
            document.getElementById('dynamicContent').innerHTML = content;
        }

        /**
         * Book provider with advanced features
         */
        async bookProvider(providerId) {
            if (!Auth.isAuthenticated()) {
                this.showAuthModal();
                return;
            }

            try {
                // Use advanced payment processor
                if (this.advancedFeatures.paymentProcessor) {
                    const booking = await this.advancedFeatures.paymentProcessor.initiateBooking(providerId);
                    Toast.show('Booking initiated successfully', 'success');
                } else {
                    // Fallback to basic booking
                    Toast.show('Booking feature coming soon', 'info');
                }
            } catch (error) {
                Toast.show('Booking failed: ' + error.message, 'error');
            }
        }

        /**
         * View provider profile with advanced features
         */
        viewProvider(providerId) {
            // Implementation would show detailed provider profile with trust scores, reviews, etc.
            Toast.show('Provider profile would open here', 'info');
        }

        /**
         * Cleanup method
         */
        destroy() {
            // Clear real-time services
            Object.values(this.realTimeServices).forEach(service => {
                if (typeof service === 'number') {
                    clearInterval(service);
                }
            });

            // Close WebSocket
            if (this.socket) {
                this.socket.close();
            }

            // Cleanup advanced features
            Object.values(this.advancedFeatures).forEach(feature => {
                if (feature && typeof feature.destroy === 'function') {
                    feature.destroy();
                }
            });

            console.log('🛑 QuickServe Advanced Platform destroyed');
        }
        /**
         * Legacy methods for backward compatibility
         */

        /**
         * Perform basic search (legacy)
         */
        performBasicSearch(searchTerm) {
            // Save to search history
            Storage.saveSearchHistory(searchTerm);

            // Basic search logic
            Toast.show(`Searching for "${searchTerm}"...`, 'info');
        }

        /**
         * Search providers by service (legacy)
         */
        searchProvidersByService(service) {
            const providers = Storage.filterCollection('providers',
                p => p.services && p.services.includes(service)
            );

            Toast.show(`Found ${providers.length} ${service} providers near you`, 'info');
            // Load providers view with filtered results
            this.loadProvidersView();
        }

        /**
         * Generate service card (legacy)
         */
        generateServiceCard(service) {
            return `
            <div class="service-card" onclick="QuickServeApp.handleServiceSelection('${service.id}')">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3>${service.name}</h3>
                <p>Starting from ₹${service.basePrice}</p>
            </div>
        `;
        }
    }

    // Toast notification helper
    class Toast {
        static show(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }

        static getIcon(type) {
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            return icons[type] || 'info-circle';
        }
    }

    // Make Toast globally available
    window.Toast = Toast;

    // Safe app initialization with dependency checking
    function initializeQuickServe() {
        try {
            if (window.SimpleDebug) {
                window.SimpleDebug.updateProgress('Starting QuickServe initialization...');
            }

            // Check dependencies before initializing
            if (!checkCoreLibraries()) {
                console.error('❌ Cannot initialize app - missing dependencies');
                return;
            }

            if (window.SimpleDebug) {
                window.SimpleDebug.updateProgress('Creating application instance...');
            }

            window.app = new QuickServeApp();
            // Expose minimal facade for inline handlers (e.g., Logout links)
            window.QuickServeApp = {
                logout: () => window.app && window.app.performLogout()
            };
            console.log('✅ QuickServe app initialized successfully');

            // Hide loading after successful initialization
            setTimeout(() => {
                if (window.SimpleDebug) {
                    window.SimpleDebug.hideLoading();
                }
            }, 1000);

        } catch (error) {
            console.error('❌ Failed to initialize QuickServe:', error);
            if (window.SimpleDebug) {
                window.SimpleDebug.updateProgress(`Initialization failed: ${error.message}`);
            }

            // Show user-friendly error
            setTimeout(() => {
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #dc3545;
                border-radius: 8px;
                padding: 20px;
                z-index: 10002;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
                errorDiv.innerHTML = `
                <h3 style="color: #dc3545; margin-top: 0;">⚠️ App Failed to Start</h3>
                <p>QuickServe encountered an error during initialization.</p>
                <p style="font-size: 14px; color: #666;">${error.message}</p>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    Reload Page
                </button>
            `;
                document.body.appendChild(errorDiv);
            }, 100);
        }
    }

    // Initialize app when DOM is ready
    document.addEventListener('DOMContentLoaded', initializeQuickServe);

})(); // End of IIFE wrapper

