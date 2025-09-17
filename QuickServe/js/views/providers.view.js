/**
 * QuickServe Providers View Controller
 * Manages provider search, filtering, and listing functionality
 */

class ProvidersView {
    constructor(app) {
        this.app = app;
        this.providers = [];
        this.filteredProviders = [];
        this.currentFilters = {
            service: '',
            location: '',
            rating: 0,
            priceRange: [0, 5000],
            availability: '',
            verification: '',
            experience: 0,
            distance: 50,
            sortBy: 'relevance'
        };
        this.searchQuery = '';
        this.currentPage = 1;
        this.providersPerPage = 12;
        this.init();
    }

    /**
     * Initialize providers view
     */
    init() {
        this.bindEvents();
        this.initializeFilters();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('providerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.debouncedSearch();
            });
        }

        // Filter toggles
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-toggle')) {
                this.toggleFilterPanel();
            }

            if (e.target.matches('.clear-filters')) {
                this.clearAllFilters();
            }

            if (e.target.matches('.apply-filters')) {
                this.applyFilters();
            }

            if (e.target.matches('.provider-card')) {
                const providerId = e.target.dataset.providerId;
                this.showProviderDetails(providerId);
            }

            if (e.target.matches('.book-provider-btn')) {
                e.stopPropagation();
                const providerId = e.target.dataset.providerId;
                const serviceType = e.target.dataset.serviceType;
                this.initiateBooking(providerId, serviceType);
            }

            if (e.target.matches('.contact-provider-btn')) {
                e.stopPropagation();
                const providerId = e.target.dataset.providerId;
                this.contactProvider(providerId);
            }
        });

        // Filter inputs
        document.addEventListener('change', (e) => {
            if (e.target.matches('.filter-input')) {
                this.updateFilter(e.target);
            }

            if (e.target.matches('#sortBy')) {
                this.currentFilters.sortBy = e.target.value;
                this.sortProviders();
                this.renderProviders();
            }
        });

        // Range inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('.price-range-input')) {
                this.updatePriceRange();
            }

            if (e.target.matches('#distanceRange')) {
                this.updateDistanceFilter(e.target.value);
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.changePage(page);
            }
        });
    }

    /**
     * Initialize filter components
     */
    initializeFilters() {
        this.createFilterPanel();
        this.setupPriceRangeSlider();
        this.setupDistanceSlider();
    }

    /**
     * Create filter panel
     */
    createFilterPanel() {
        const filterContainer = document.getElementById('filtersContainer');
        if (!filterContainer) return;

        filterContainer.innerHTML = `
            <div class="filters-panel glass-card">
                <div class="filters-header">
                    <h4>Filter Providers</h4>
                    <button class="clear-filters btn-text">Clear All</button>
                </div>
                
                <div class="filter-group">
                    <label>Service Type</label>
                    <select id="serviceFilter" class="filter-input">
                        <option value="">All Services</option>
                        ${Object.entries(CONSTANTS.SERVICES).map(([key, service]) => `
                            <option value="${key.toLowerCase()}">${service.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>Minimum Rating</label>
                    <div class="rating-filter">
                        ${[1, 2, 3, 4, 5].map(rating => `
                            <label class="rating-option">
                                <input type="radio" name="ratingFilter" value="${rating}" class="filter-input">
                                <span class="rating-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
                                <span class="rating-text">${rating}+ stars</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="filter-group">
                    <label>Price Range (₹/hour)</label>
                    <div class="price-range-container">
                        <input type="range" id="priceMin" class="price-range-input" min="0" max="5000" value="0">
                        <input type="range" id="priceMax" class="price-range-input" min="0" max="5000" value="5000">
                        <div class="price-range-display">
                            <span id="priceMinDisplay">₹0</span> - <span id="priceMaxDisplay">₹5000</span>
                        </div>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Distance (km)</label>
                    <div class="distance-container">
                        <input type="range" id="distanceRange" class="filter-input" min="1" max="100" value="50">
                        <div class="distance-display">
                            Within <span id="distanceDisplay">50</span> km
                        </div>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Availability</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" value="available" class="filter-input" id="availableNow">
                            <span>Available Now</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" value="today" class="filter-input" id="availableToday">
                            <span>Available Today</span>
                        </label>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Verification Level</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" value="aadhaar_verified" class="filter-input">
                            <span>Aadhaar Verified</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" value="police_verified" class="filter-input">
                            <span>Police Verified</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" value="fully_verified" class="filter-input">
                            <span>Fully Verified</span>
                        </label>
                    </div>
                </div>

                <div class="filter-group">
                    <label>Minimum Experience</label>
                    <select id="experienceFilter" class="filter-input">
                        <option value="0">Any Experience</option>
                        <option value="1">1+ years</option>
                        <option value="3">3+ years</option>
                        <option value="5">5+ years</option>
                        <option value="10">10+ years</option>
                    </select>
                </div>

                <div class="filter-actions">
                    <button class="apply-filters btn-primary">Apply Filters</button>
                </div>
            </div>
        `;
    }

    /**
     * Setup price range slider
     */
    setupPriceRangeSlider() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');

        if (priceMin && priceMax) {
            priceMin.addEventListener('input', this.updatePriceRange.bind(this));
            priceMax.addEventListener('input', this.updatePriceRange.bind(this));
        }
    }

    /**
     * Setup distance slider
     */
    setupDistanceSlider() {
        const distanceRange = document.getElementById('distanceRange');
        if (distanceRange) {
            distanceRange.addEventListener('input', (e) => {
                this.updateDistanceFilter(e.target.value);
            });
        }
    }

    /**
     * Update price range display
     */
    updatePriceRange() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceMinDisplay = document.getElementById('priceMinDisplay');
        const priceMaxDisplay = document.getElementById('priceMaxDisplay');

        if (priceMin && priceMax && priceMinDisplay && priceMaxDisplay) {
            let minVal = parseInt(priceMin.value);
            let maxVal = parseInt(priceMax.value);

            // Ensure min is not greater than max
            if (minVal > maxVal) {
                priceMin.value = maxVal;
                minVal = maxVal;
            }

            this.currentFilters.priceRange = [minVal, maxVal];
            priceMinDisplay.textContent = `₹${minVal}`;
            priceMaxDisplay.textContent = `₹${maxVal}`;
        }
    }

    /**
     * Update distance filter
     */
    updateDistanceFilter(distance) {
        this.currentFilters.distance = parseInt(distance);
        const distanceDisplay = document.getElementById('distanceDisplay');
        if (distanceDisplay) {
            distanceDisplay.textContent = distance;
        }
    }

    /**
     * Show providers based on filters/search
     */
    async showProviders(providers = null, serviceType = null) {
        try {
            // Use provided providers or load all providers
            if (providers) {
                this.providers = providers;
            } else {
                await this.loadProviders();
            }

            // Set service filter if specified
            if (serviceType) {
                this.currentFilters.service = serviceType;
                const serviceFilter = document.getElementById('serviceFilter');
                if (serviceFilter) {
                    serviceFilter.value = serviceType;
                }
            }

            // Apply current filters
            this.applyFilters();

            // Render providers
            this.renderProviders();

            // Update results count
            this.updateResultsCount();

        } catch (error) {
            console.error('Error showing providers:', error);
            window.Toast.error('Failed to load providers');
        }
    }

    /**
     * Load providers data
     */
    async loadProviders() {
        const userLocation = window.LocationService?.getCurrentLocationContext();

        // Mock providers data - in real app, this would come from API
        this.providers = [
            {
                id: 'provider_001',
                name: 'Rajesh Kumar',
                services: ['plumber', 'electrician'],
                rating: 4.9,
                reviewCount: 203,
                experience: 12,
                basePrice: 600,
                maxPrice: 1200,
                availability: 'available',
                verificationLevel: 'fully_verified',
                specializations: ['Emergency Repairs', 'Smart Home Installation'],
                completedJobs: 450,
                responseTime: '< 15 min',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.05,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.05
                } : null,
                badges: [
                    { type: 'premium', name: 'Premium Pro', icon: 'fa-crown' },
                    { type: 'verified', name: 'Verified', icon: 'fa-shield-check' }
                ],
                description: 'Expert plumber and electrician with 12+ years of experience. Specializes in emergency repairs and smart home installations.',
                languages: ['Hindi', 'English'],
                workingHours: '6 AM - 10 PM',
                instantBooking: true
            },
            {
                id: 'provider_002',
                name: 'Priya Sharma',
                services: ['cleaner', 'salon'],
                rating: 4.8,
                reviewCount: 156,
                experience: 6,
                basePrice: 400,
                maxPrice: 800,
                availability: 'available',
                verificationLevel: 'aadhaar_verified',
                specializations: ['Deep Cleaning', 'Organic Products', 'Hair Styling'],
                completedJobs: 280,
                responseTime: '< 20 min',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.06,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.06
                } : null,
                badges: [
                    { type: 'eco', name: 'Eco-Friendly', icon: 'fa-leaf' }
                ],
                description: 'Professional cleaner and beauty specialist. Uses eco-friendly products and techniques.',
                languages: ['Hindi', 'English'],
                workingHours: '8 AM - 8 PM',
                instantBooking: true
            },
            {
                id: 'provider_003',
                name: 'Mohammed Ali',
                services: ['carpenter', 'painter'],
                rating: 4.7,
                reviewCount: 178,
                experience: 10,
                basePrice: 550,
                maxPrice: 1100,
                availability: 'busy',
                nextAvailable: '2024-01-15',
                verificationLevel: 'fully_verified',
                specializations: ['Custom Furniture', 'Interior Painting', 'Renovation'],
                completedJobs: 320,
                responseTime: '< 30 min',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.04,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.04
                } : null,
                badges: [
                    { type: 'certified', name: 'Certified Pro', icon: 'fa-certificate' }
                ],
                description: 'Skilled carpenter and painter specializing in custom furniture and interior design.',
                languages: ['Hindi', 'English', 'Urdu'],
                workingHours: '7 AM - 9 PM',
                instantBooking: false
            },
            {
                id: 'provider_004',
                name: 'Anita Patel',
                services: ['cleaner', 'cook'],
                rating: 4.6,
                reviewCount: 142,
                experience: 8,
                basePrice: 350,
                maxPrice: 700,
                availability: 'available',
                verificationLevel: 'police_verified',
                specializations: ['Home Cleaning', 'Gujarati Cuisine', 'Party Catering'],
                completedJobs: 380,
                responseTime: '< 25 min',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                location: userLocation ? {
                    lat: userLocation.lat + (Math.random() - 0.5) * 0.03,
                    lng: userLocation.lng + (Math.random() - 0.5) * 0.03
                } : null,
                badges: [
                    { type: 'trusted', name: 'Trusted Provider', icon: 'fa-handshake' }
                ],
                description: 'Experienced home cleaning and cooking professional. Specializes in Gujarati cuisine.',
                languages: ['Hindi', 'Gujarati', 'English'],
                workingHours: '6 AM - 7 PM',
                instantBooking: true
            }
        ];

        // Calculate distances if user location is available
        if (userLocation && userLocation.lat && userLocation.lng) {
            this.providers.forEach(provider => {
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
     * Apply filters to providers
     */
    applyFilters() {
        this.filteredProviders = this.providers.filter(provider => {
            // Search query filter
            if (this.searchQuery) {
                const searchLower = this.searchQuery.toLowerCase();
                const matchesSearch =
                    provider.name.toLowerCase().includes(searchLower) ||
                    provider.services.some(service => service.toLowerCase().includes(searchLower)) ||
                    provider.specializations?.some(spec => spec.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;
            }

            // Service filter
            if (this.currentFilters.service && !provider.services.includes(this.currentFilters.service)) {
                return false;
            }

            // Rating filter
            if (this.currentFilters.rating > 0 && provider.rating < this.currentFilters.rating) {
                return false;
            }

            // Price range filter
            if (provider.basePrice < this.currentFilters.priceRange[0] ||
                provider.basePrice > this.currentFilters.priceRange[1]) {
                return false;
            }

            // Distance filter
            if (provider.distance && provider.distance > this.currentFilters.distance) {
                return false;
            }

            // Availability filter
            if (this.currentFilters.availability) {
                if (this.currentFilters.availability === 'available' && provider.availability !== 'available') {
                    return false;
                }
            }

            // Verification filter
            if (this.currentFilters.verification && provider.verificationLevel !== this.currentFilters.verification) {
                return false;
            }

            // Experience filter
            if (this.currentFilters.experience > 0 && provider.experience < this.currentFilters.experience) {
                return false;
            }

            return true;
        });

        // Sort providers
        this.sortProviders();

        // Reset to first page
        this.currentPage = 1;
    }

    /**
     * Sort providers based on current sort option
     */
    sortProviders() {
        const sortBy = this.currentFilters.sortBy;

        this.filteredProviders.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;

                case 'price_low':
                    return a.basePrice - b.basePrice;

                case 'price_high':
                    return b.basePrice - a.basePrice;

                case 'distance':
                    if (!a.distance && !b.distance) return 0;
                    if (!a.distance) return 1;
                    if (!b.distance) return -1;
                    return a.distance - b.distance;

                case 'experience':
                    return b.experience - a.experience;

                case 'reviews':
                    return b.reviewCount - a.reviewCount;

                case 'availability':
                    if (a.availability === 'available' && b.availability !== 'available') return -1;
                    if (b.availability === 'available' && a.availability !== 'available') return 1;
                    return 0;

                default: // relevance
                    // Custom relevance scoring
                    const scoreA = this.calculateRelevanceScore(a);
                    const scoreB = this.calculateRelevanceScore(b);
                    return scoreB - scoreA;
            }
        });
    }

    /**
     * Calculate relevance score for sorting
     */
    calculateRelevanceScore(provider) {
        let score = 0;

        // Rating weight (40%)
        score += provider.rating * 0.4 * 20;

        // Availability weight (25%)
        if (provider.availability === 'available') score += 25;

        // Distance weight (20%) - closer is better
        if (provider.distance) {
            score += Math.max(0, (50 - provider.distance)) * 0.4;
        }

        // Experience weight (10%)
        score += Math.min(provider.experience, 20) * 0.5;

        // Review count weight (5%)
        score += Math.min(provider.reviewCount / 10, 20) * 0.25;

        return score;
    }

    /**
     * Render providers list
     */
    renderProviders() {
        const providersContainer = document.getElementById('providersContainer');
        if (!providersContainer) return;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.providersPerPage;
        const endIndex = startIndex + this.providersPerPage;
        const paginatedProviders = this.filteredProviders.slice(startIndex, endIndex);

        if (paginatedProviders.length === 0) {
            this.renderEmptyState();
            return;
        }

        providersContainer.innerHTML = `
            <div class="providers-grid">
                ${paginatedProviders.map(provider => this.createProviderCard(provider)).join('')}
            </div>
            ${this.createPagination()}
        `;
    }

    /**
     * Create provider card
     */
    createProviderCard(provider) {
        const availabilityInfo = provider.availability === 'available' ?
            '<div class="availability-badge available">Available Now</div>' :
            `<div class="availability-badge busy">Next: ${provider.nextAvailable ? new Date(provider.nextAvailable).toLocaleDateString() : 'TBD'}</div>`;

        return `
            <div class="provider-card glass-card" data-provider-id="${provider.id}">
                <div class="provider-header">
                    <div class="provider-avatar">
                        <img src="${provider.avatar}" alt="${provider.name}" loading="lazy">
                        <div class="verification-badge verified-${provider.verificationLevel}">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <div class="provider-basic-info">
                        <h3 class="provider-name">${provider.name}</h3>
                        <div class="provider-rating">
                            ${this.renderStars(provider.rating)} 
                            <span class="rating-value">${provider.rating}</span>
                            <span class="review-count">(${provider.reviewCount} reviews)</span>
                        </div>
                        <div class="provider-experience">${provider.experience} years experience • ${provider.completedJobs} jobs</div>
                    </div>
                    ${availabilityInfo}
                </div>

                <div class="provider-services">
                    <div class="services-list">
                        ${provider.services.map(service => {
            const serviceData = CONSTANTS.SERVICES[service.toUpperCase()];
            return `
                                <div class="service-tag">
                                    <i class="fas ${serviceData?.icon || 'fa-tools'}"></i>
                                    <span>${serviceData?.name || service}</span>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>

                ${provider.specializations?.length > 0 ? `
                <div class="provider-specializations">
                    <div class="specializations-label">Specializes in:</div>
                    <div class="specializations-list">
                        ${provider.specializations.slice(0, 3).map(spec =>
            `<span class="specialization-tag">${spec}</span>`
        ).join('')}
                        ${provider.specializations.length > 3 ? `<span class="more-spec">+${provider.specializations.length - 3} more</span>` : ''}
                    </div>
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
                    <div class="stat">
                        <i class="fas fa-language"></i>
                        <span>${provider.languages?.join(', ') || 'Hindi, English'}</span>
                    </div>
                </div>

                <div class="provider-pricing">
                    <div class="price-range">
                        <span class="price">₹${provider.basePrice}-${provider.maxPrice}/hr</span>
                        ${provider.instantBooking ? '<span class="instant-booking">⚡ Instant Booking</span>' : ''}
                    </div>
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

                <div class="provider-actions">
                    <button class="contact-provider-btn btn-secondary" data-provider-id="${provider.id}">
                        <i class="fas fa-phone"></i>
                        Contact
                    </button>
                    <button class="book-provider-btn btn-primary" 
                            data-provider-id="${provider.id}" 
                            data-service-type="${provider.services[0]}">
                        <i class="fas fa-calendar-plus"></i>
                        Book Now
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create pagination
     */
    createPagination() {
        const totalPages = Math.ceil(this.filteredProviders.length / this.providersPerPage);

        if (totalPages <= 1) return '';

        let pagination = '<div class="pagination">';

        // Previous button
        if (this.currentPage > 1) {
            pagination += `<button class="pagination-btn" data-page="${this.currentPage - 1}">‹ Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                pagination += `<button class="pagination-btn active" data-page="${i}">${i}</button>`;
            } else if (i === 1 || i === totalPages || Math.abs(i - this.currentPage) <= 2) {
                pagination += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
            } else if (Math.abs(i - this.currentPage) === 3) {
                pagination += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            pagination += `<button class="pagination-btn" data-page="${this.currentPage + 1}">Next ›</button>`;
        }

        pagination += '</div>';
        return pagination;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        const providersContainer = document.getElementById('providersContainer');
        providersContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No providers found</h3>
                <p>Try adjusting your filters or search criteria to find more providers.</p>
                <button class="clear-filters btn-primary">Clear All Filters</button>
            </div>
        `;
    }

    /**
     * Update results count
     */
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredProviders.length} providers found`;
        }
    }

    /**
     * Debounced search function
     */
    debouncedSearch = this.debounce(() => {
        this.applyFilters();
        this.renderProviders();
        this.updateResultsCount();
    }, 300);

    /**
     * Debounce utility
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Filter management methods
     */
    updateFilter(input) {
        const { name, value, type, checked } = input;

        switch (name) {
            case 'ratingFilter':
                if (checked) this.currentFilters.rating = parseInt(value);
                break;
            default:
                if (type === 'checkbox') {
                    // Handle checkbox filters
                    if (input.id === 'availableNow' && checked) {
                        this.currentFilters.availability = 'available';
                    }
                } else {
                    this.currentFilters[name] = value;
                }
        }
    }

    toggleFilterPanel() {
        const filterPanel = document.querySelector('.filters-panel');
        if (filterPanel) {
            filterPanel.classList.toggle('expanded');
        }
    }

    clearAllFilters() {
        this.currentFilters = {
            service: '',
            location: '',
            rating: 0,
            priceRange: [0, 5000],
            availability: '',
            verification: '',
            experience: 0,
            distance: 50,
            sortBy: 'relevance'
        };

        this.searchQuery = '';

        // Reset form inputs
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = input.type === 'range' ? input.getAttribute('min') : '';
            }
        });

        // Reset price range
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        if (priceMin && priceMax) {
            priceMin.value = 0;
            priceMax.value = 5000;
            this.updatePriceRange();
        }

        // Apply filters
        this.applyFilters();
        this.renderProviders();
        this.updateResultsCount();

        window.Toast.success('Filters cleared');
    }

    /**
     * Page management
     */
    changePage(page) {
        this.currentPage = page;
        this.renderProviders();

        // Scroll to top of providers
        const providersContainer = document.getElementById('providersContainer');
        if (providersContainer) {
            providersContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Provider actions
     */
    showProviderDetails(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        // Create detailed provider modal
        const modalContent = `
            <div class="provider-details-modal">
                <div class="provider-header">
                    <img src="${provider.avatar}" alt="${provider.name}" class="provider-avatar-large">
                    <div class="provider-info">
                        <h2>${provider.name}</h2>
                        <div class="rating-large">
                            ${this.renderStars(provider.rating)} ${provider.rating} (${provider.reviewCount} reviews)
                        </div>
                        <div class="experience-large">${provider.experience} years • ${provider.completedJobs} completed jobs</div>
                    </div>
                </div>
                
                <div class="provider-description">
                    <h3>About</h3>
                    <p>${provider.description}</p>
                </div>
                
                <div class="provider-services-detail">
                    <h3>Services Offered</h3>
                    <div class="services-grid">
                        ${provider.services.map(service => {
            const serviceData = CONSTANTS.SERVICES[service.toUpperCase()];
            return `
                                <div class="service-detail">
                                    <i class="fas ${serviceData?.icon || 'fa-tools'}"></i>
                                    <span>${serviceData?.name || service}</span>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
                
                <div class="provider-working-hours">
                    <h3>Working Hours</h3>
                    <p>${provider.workingHours}</p>
                </div>
                
                <div class="modal-actions">
                    <button class="contact-provider-btn btn-secondary" data-provider-id="${provider.id}">Contact</button>
                    <button class="book-provider-btn btn-primary" data-provider-id="${provider.id}" data-service-type="${provider.services[0]}">Book Now</button>
                </div>
            </div>
        `;

        window.Modal.showCustom('Provider Details', modalContent);
    }

    initiateBooking(providerId, serviceType) {
        const provider = this.providers.find(p => p.id === providerId);

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

    contactProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);

        if (!provider) {
            window.Toast.error('Provider not found');
            return;
        }

        // Mock contact functionality
        window.Toast.info(`Connecting you with ${provider.name}...`);

        // In real app, this would initiate call/chat
        setTimeout(() => {
            window.Toast.success(`Call connected with ${provider.name}`);
        }, 2000);
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

    /**
     * Public methods for external access
     */
    async refresh() {
        await this.loadProviders();
        this.applyFilters();
        this.renderProviders();
        this.updateResultsCount();
    }

    async searchByService(service) {
        this.currentFilters.service = service;
        const serviceFilter = document.getElementById('serviceFilter');
        if (serviceFilter) {
            serviceFilter.value = service;
        }
        this.applyFilters();
        this.renderProviders();
        this.updateResultsCount();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProvidersView;
}
