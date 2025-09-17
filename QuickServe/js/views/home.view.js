/**
 * QuickServe Home View Controller
 * Manages the main landing page with service selection and provider discovery
 */

class HomeView {
    constructor(app) {
        this.app = app;
        this.featuredProviders = [];
        this.trendingServices = [];
        this.init();
    }

    /**
     * Initialize home view
     */
    init() {
        this.bindEvents();
        this.loadFeaturedContent();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Service tile clicks
        document.querySelectorAll('.service-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const service = tile.dataset.service;
                this.handleServiceSelection(service);
            });
        });

        // Location detection button
        const detectLocationBtn = document.getElementById('detectLocationBtn');
        if (detectLocationBtn) {
            detectLocationBtn.addEventListener('click', () => {
                this.detectUserLocation();
            });
        }

        // PIN code search
        const pinCodeInput = document.getElementById('pinCodeInput');
        if (pinCodeInput) {
            pinCodeInput.addEventListener('input', (e) => {
                if (e.target.value.length === 6) {
                    this.searchByPinCode(e.target.value);
                }
            });
        }

        // Quick booking buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quick-book-btn')) {
                const providerId = e.target.dataset.providerId;
                const serviceType = e.target.dataset.serviceType;
                this.initiateQuickBooking(providerId, serviceType);
            }
        });
    }

    /**
     * Load featured content
     */
    async loadFeaturedContent() {
        try {
            // Load featured providers
            await this.loadFeaturedProviders();

            // Load trending services
            await this.loadTrendingServices();

            // Load recent bookings for authenticated users
            if (this.app.isAuthenticated()) {
                await this.loadRecentBookings();
            }

            // Update UI with loaded content
            this.renderFeaturedContent();

        } catch (error) {
            console.error('Error loading featured content:', error);
            window.Toast.error('Failed to load featured content');
        }
    }

    /**
     * Load featured providers
     */
    async loadFeaturedProviders() {
        // Get user location for distance calculation
        const userLocation = window.LocationService?.getCurrentLocationContext();

        // Mock featured providers data
        this.featuredProviders = [
            {
                id: 'featured_001',
                name: 'Rajesh Kumar',
                services: ['plumber', 'electrician'],
                rating: 4.9,
                reviewCount: 203,
                experience: 12,
                basePrice: 600,
                availability: 'available',
                verificationLevel: 'fully_verified',
                badges: [
                    { type: 'premium', name: 'Premium Pro', icon: 'fa-crown' },
                    { type: 'featured', name: 'Featured', icon: 'fa-star' }
                ],
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.02
                } : null,
                specializations: ['Emergency Repairs', 'Smart Home Installation'],
                completedJobs: 450,
                responseTime: '< 15 min'
            },
            {
                id: 'featured_002',
                name: 'Priya Sharma',
                services: ['cleaner', 'salon'],
                rating: 4.8,
                reviewCount: 156,
                experience: 6,
                basePrice: 400,
                availability: 'available',
                verificationLevel: 'aadhaar_verified',
                badges: [
                    { type: 'eco', name: 'Eco-Friendly', icon: 'fa-leaf' }
                ],
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.03,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.03
                } : null,
                specializations: ['Deep Cleaning', 'Organic Products'],
                completedJobs: 280,
                responseTime: '< 20 min'
            },
            {
                id: 'featured_003',
                name: 'Mohammed Ali',
                services: ['carpenter', 'painter'],
                rating: 4.7,
                reviewCount: 178,
                experience: 10,
                basePrice: 550,
                availability: 'busy',
                verificationLevel: 'fully_verified',
                badges: [
                    { type: 'certified', name: 'Certified Pro', icon: 'fa-certificate' }
                ],
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.025,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.025
                } : null,
                specializations: ['Custom Furniture', 'Interior Painting'],
                completedJobs: 320,
                responseTime: '< 30 min'
            }
        ];

        // Calculate distances if user location is available
        if (userLocation && userLocation.lat && userLocation.lng) {
            this.featuredProviders.forEach(provider => {
                if (provider.location) {
                    provider.distance = window.LocationService.calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        provider.location.lat,
                        provider.location.lng
                    );
                }
            });
        }
    }

    /**
     * Load trending services
     */
    async loadTrendingServices() {
        this.trendingServices = [
            {
                service: 'plumber',
                name: 'Plumbing Services',
                icon: 'fa-wrench',
                bookings: 1250,
                avgRating: 4.7,
                avgPrice: 500,
                trend: '+15%'
            },
            {
                service: 'electrician',
                name: 'Electrical Services',
                icon: 'fa-bolt',
                bookings: 980,
                avgRating: 4.6,
                avgPrice: 450,
                trend: '+22%'
            },
            {
                service: 'cleaner',
                name: 'Cleaning Services',
                icon: 'fa-broom',
                bookings: 2100,
                avgRating: 4.8,
                avgPrice: 350,
                trend: '+35%'
            },
            {
                service: 'ac-repair',
                name: 'AC Repair',
                icon: 'fa-snowflake',
                bookings: 750,
                avgRating: 4.5,
                avgPrice: 800,
                trend: '+45%'
            }
        ];
    }

    /**
     * Load recent bookings
     */
    async loadRecentBookings() {
        if (!this.app.isAuthenticated()) return;

        const userId = this.app.getCurrentUserId();
        const recentBookings = window.Storage.filterCollection('bookings',
            booking => booking.customerId === userId
        ).slice(0, 3);

        this.recentBookings = recentBookings;
    }

    /**
     * Render featured content
     */
    renderFeaturedContent() {
        this.renderFeaturedProviders();
        this.renderTrendingServices();

        if (this.app.isAuthenticated()) {
            this.renderRecentBookings();
        }
    }

    /**
     * Render featured providers section
     */
    renderFeaturedProviders() {
        const container = document.getElementById('featuredProviders');
        if (!container) {
            this.createFeaturedProvidersSection();
            return;
        }

        container.innerHTML = `
            <div class="section-header">
                <h3>Top-Rated Professionals Near You</h3>
                <p>Highly rated and verified service providers in your area</p>
            </div>
            <div class="providers-grid">
                ${this.featuredProviders.map(provider => this.createProviderCard(provider)).join('')}
            </div>
        `;
    }

    /**
     * Create featured providers section
     */
    createFeaturedProvidersSection() {
        const dynamicContent = document.getElementById('dynamicContent');

        const section = document.createElement('section');
        section.className = 'featured-section py-12';
        section.innerHTML = `
            <div class="container">
                <div id="featuredProviders"></div>
            </div>
        `;

        dynamicContent.appendChild(section);
        this.renderFeaturedProviders();
    }

    /**
     * Create provider card for featured section
     */
    createProviderCard(provider) {
        return `
            <div class="featured-provider-card glass-card" data-provider-id="${provider.id}">
                <div class="provider-header">
                    <div class="provider-avatar">
                        <img src="${provider.avatar}" alt="${provider.name}">
                        <div class="verification-badge verified-${provider.verificationLevel}">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        ${provider.availability === 'available' ? '<div class="availability-indicator available"></div>' : ''}
                    </div>
                    <div class="provider-info">
                        <h4>${provider.name}</h4>
                        <div class="rating">
                            ${this.renderStars(provider.rating)} ${provider.rating} (${provider.reviewCount})
                        </div>
                        <div class="experience">${provider.experience} years • ${provider.completedJobs} jobs</div>
                    </div>
                </div>

                <div class="provider-services">
                    ${provider.services.slice(0, 2).map(service => {
            const serviceData = CONSTANTS.SERVICES[service.toUpperCase()];
            return `<span class="service-tag">${serviceData?.name || service}</span>`;
        }).join('')}
                </div>

                ${provider.specializations?.length > 0 ? `
                <div class="specializations">
                    ${provider.specializations.slice(0, 2).map(spec =>
            `<span class="specialization-tag">${spec}</span>`
        ).join('')}
                </div>
                ` : ''}

                <div class="provider-stats">
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        <span>Response: ${provider.responseTime}</span>
                    </div>
                    ${provider.distance ? `
                    <div class="stat">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${provider.distance.toFixed(1)} km away</span>
                    </div>
                    ` : ''}
                </div>

                <div class="provider-actions">
                    <div class="price">Starting ₹${provider.basePrice}/hr</div>
                    <button class="quick-book-btn btn-primary" 
                            data-provider-id="${provider.id}" 
                            data-service-type="${provider.services[0]}">
                        Quick Book
                    </button>
                </div>

                ${provider.badges?.length > 0 ? `
                <div class="provider-badges">
                    ${provider.badges.map(badge => `
                        <div class="badge badge-${badge.type}">
                            <i class="fas ${badge.icon}"></i>
                            <span>${badge.name}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render trending services
     */
    renderTrendingServices() {
        const container = document.getElementById('trendingServices');
        if (!container) {
            this.createTrendingServicesSection();
            return;
        }

        container.innerHTML = `
            <div class="section-header">
                <h3>Trending Services</h3>
                <p>Most popular services in your area this week</p>
            </div>
            <div class="trending-grid">
                ${this.trendingServices.map(service => this.createTrendingServiceCard(service)).join('')}
            </div>
        `;
    }

    /**
     * Create trending services section
     */
    createTrendingServicesSection() {
        const dynamicContent = document.getElementById('dynamicContent');

        const section = document.createElement('section');
        section.className = 'trending-section py-12';
        section.innerHTML = `
            <div class="container">
                <div id="trendingServices"></div>
            </div>
        `;

        dynamicContent.appendChild(section);
        this.renderTrendingServices();
    }

    /**
     * Create trending service card
     */
    createTrendingServiceCard(service) {
        return `
            <div class="trending-service-card glass-card" data-service="${service.service}">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                    <div class="trend-indicator">
                        <i class="fas fa-arrow-up"></i>
                        ${service.trend}
                    </div>
                </div>
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <div class="service-stats">
                        <div class="stat">
                            <span class="label">Bookings:</span>
                            <span class="value">${service.bookings.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Rating:</span>
                            <span class="value">${service.avgRating} ⭐</span>
                        </div>
                        <div class="stat">
                            <span class="label">Starting:</span>
                            <span class="value">₹${service.avgPrice}/hr</span>
                        </div>
                    </div>
                    <button class="explore-btn" onclick="window.app.homeView.handleServiceSelection('${service.service}')">
                        Explore Providers
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render recent bookings
     */
    renderRecentBookings() {
        if (!this.recentBookings || this.recentBookings.length === 0) return;

        const container = document.getElementById('recentBookings');
        if (!container) {
            this.createRecentBookingsSection();
            return;
        }

        container.innerHTML = `
            <div class="section-header">
                <h3>Your Recent Bookings</h3>
                <p>Track and manage your recent service bookings</p>
            </div>
            <div class="bookings-list">
                ${this.recentBookings.map(booking => this.createRecentBookingCard(booking)).join('')}
            </div>
        `;
    }

    /**
     * Create recent bookings section
     */
    createRecentBookingsSection() {
        const dynamicContent = document.getElementById('dynamicContent');

        const section = document.createElement('section');
        section.className = 'recent-bookings-section py-12';
        section.innerHTML = `
            <div class="container">
                <div id="recentBookings"></div>
            </div>
        `;

        dynamicContent.appendChild(section);
        this.renderRecentBookings();
    }

    /**
     * Create recent booking card
     */
    createRecentBookingCard(booking) {
        const statusColors = {
            confirmed: 'success',
            in_progress: 'warning',
            completed: 'success',
            cancelled: 'danger'
        };

        return `
            <div class="recent-booking-card glass-card" data-booking-id="${booking.id}">
                <div class="booking-info">
                    <div class="service-type">
                        <i class="fas ${CONSTANTS.SERVICES[booking.serviceType.toUpperCase()]?.icon || 'fa-tools'}"></i>
                        <span>${CONSTANTS.SERVICES[booking.serviceType.toUpperCase()]?.name || booking.serviceType}</span>
                    </div>
                    <div class="booking-details">
                        <div class="detail">
                            <span class="label">Provider:</span>
                            <span class="value">${booking.providerName || 'Provider Name'}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Date:</span>
                            <span class="value">${new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Amount:</span>
                            <span class="value">₹${booking.totalAmount}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-status">
                    <span class="status-badge status-${statusColors[booking.status]}">
                        ${this.capitalizeFirst(booking.status.replace('_', ' '))}
                    </span>
                    <button class="view-details-btn" onclick="window.app.viewBookingDetails('${booking.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Handle service selection
     */
    handleServiceSelection(service) {
        if (service === 'more') {
            // Navigate to services view
            this.app.handleNavigation('services');
        } else {
            // Search for providers of this service
            this.searchProvidersByService(service);
        }
    }

    /**
     * Search providers by service
     */
    async searchProvidersByService(service) {
        // Show loading state
        window.Toast.loading('Searching for providers...');

        try {
            const userLocation = window.LocationService?.getCurrentLocationContext();

            if (!userLocation) {
                window.Toast.error('Please set your location to find providers');
                return;
            }

            // Use LocationService to search for providers
            const result = window.LocationService.searchServicesInArea(service, userLocation);

            if (result.success && result.providers.length > 0) {
                window.Toast.success(`Found ${result.providers.length} ${service} providers near you`);

                // Navigate to providers view with filtered results
                this.app.providersView.showProviders(result.providers, service);
                this.app.handleNavigation('providers');
            } else {
                window.Toast.warning(`No ${service} providers found in your area`);
            }

        } catch (error) {
            console.error('Error searching providers:', error);
            window.Toast.error('Failed to search for providers');
        }
    }

    /**
     * Detect user location
     */
    async detectUserLocation() {
        window.Toast.loading('Detecting your location...');

        try {
            const location = await window.LocationService.getCurrentLocation();
            window.Toast.success('Location detected successfully');

            // Update featured providers with distance
            await this.loadFeaturedProviders();
            this.renderFeaturedProviders();

        } catch (error) {
            console.error('Location detection failed:', error);
            window.Toast.error('Location detection failed. Please enter your PIN code.');
        }
    }

    /**
     * Search by PIN code
     */
    searchByPinCode(pinCode) {
        const result = window.LocationService.searchByPinCode(pinCode);

        if (result.success) {
            window.Toast.success(result.message);

            // Update featured providers based on new location
            this.loadFeaturedProviders().then(() => {
                this.renderFeaturedProviders();
            });
        } else {
            window.Toast.error(result.message);
        }
    }

    /**
     * Initiate quick booking
     */
    initiateQuickBooking(providerId, serviceType) {
        const provider = this.featuredProviders.find(p => p.id === providerId);

        if (!provider) {
            window.Toast.error('Provider not found');
            return;
        }

        if (!this.app.isAuthenticated()) {
            window.Toast.warning('Please login to book services');
            window.Modal.open('authModal');
            return;
        }

        // Initialize booking service
        if (window.BookingService) {
            window.BookingService.initBooking(provider, serviceType);
        } else {
            window.Toast.error('Booking service not available');
        }
    }

    /**
     * Utility methods
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Refresh featured content
     */
    async refresh() {
        await this.loadFeaturedContent();
    }

    /**
     * Update for new location
     */
    async updateForLocation(location) {
        await this.loadFeaturedProviders();
        this.renderFeaturedProviders();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomeView;
}
