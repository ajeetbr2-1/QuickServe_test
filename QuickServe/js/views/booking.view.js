/**
 * QuickServe Booking View Controller
 * Manages booking history, status tracking, and booking management
 */

class BookingView {
    constructor(app) {
        this.app = app;
        this.bookings = [];
        this.filteredBookings = [];
        this.currentFilters = {
            status: '',
            service: '',
            dateRange: '',
            provider: ''
        };
        this.currentTab = 'all';
        this.init();
    }

    /**
     * Initialize booking view
     */
    init() {
        this.bindEvents();
        this.createBookingInterface();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('.booking-tab')) {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            }

            if (e.target.matches('.booking-action-btn')) {
                const bookingId = e.target.dataset.bookingId;
                const action = e.target.dataset.action;
                this.handleBookingAction(bookingId, action);
            }

            if (e.target.matches('.view-booking-details')) {
                const bookingId = e.target.dataset.bookingId;
                this.showBookingDetails(bookingId);
            }

            if (e.target.matches('.track-booking-btn')) {
                const bookingId = e.target.dataset.bookingId;
                this.trackBooking(bookingId);
            }

            if (e.target.matches('.review-provider-btn')) {
                const bookingId = e.target.dataset.bookingId;
                this.showReviewModal(bookingId);
            }

            if (e.target.matches('.rebook-service-btn')) {
                const bookingId = e.target.dataset.bookingId;
                this.rebookService(bookingId);
            }
        });

        // Filter inputs
        document.addEventListener('change', (e) => {
            if (e.target.matches('.booking-filter')) {
                this.updateFilter(e.target);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('bookingSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchBookings(e.target.value);
            });
        }
    }

    /**
     * Create booking interface
     */
    createBookingInterface() {
        const bookingContainer = document.getElementById('bookingContainer');
        if (!bookingContainer) return;

        bookingContainer.innerHTML = `
            <div class="booking-view-container">
                <div class="booking-header">
                    <h2>My Bookings</h2>
                    <div class="booking-search">
                        <input type="text" id="bookingSearch" placeholder="Search bookings..." class="search-input">
                        <i class="fas fa-search"></i>
                    </div>
                </div>

                <div class="booking-tabs">
                    <button class="booking-tab active" data-tab="all">All Bookings</button>
                    <button class="booking-tab" data-tab="upcoming">Upcoming</button>
                    <button class="booking-tab" data-tab="in_progress">In Progress</button>
                    <button class="booking-tab" data-tab="completed">Completed</button>
                    <button class="booking-tab" data-tab="cancelled">Cancelled</button>
                </div>

                <div class="booking-filters">
                    <select class="booking-filter" id="serviceFilter">
                        <option value="">All Services</option>
                        ${Object.entries(CONSTANTS.SERVICES).map(([key, service]) => `
                            <option value="${key.toLowerCase()}">${service.name}</option>
                        `).join('')}
                    </select>

                    <select class="booking-filter" id="dateRangeFilter">
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">Last 3 Months</option>
                    </select>

                    <select class="booking-filter" id="providerFilter">
                        <option value="">All Providers</option>
                    </select>
                </div>

                <div class="booking-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalBookings">0</div>
                        <div class="stat-label">Total Bookings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="completedBookings">0</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="upcomingBookings">0</div>
                        <div class="stat-label">Upcoming</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalSpent">₹0</div>
                        <div class="stat-label">Total Spent</div>
                    </div>
                </div>

                <div id="bookingsList" class="bookings-list">
                    <!-- Bookings will be rendered here -->
                </div>
            </div>
        `;
    }

    /**
     * Load user bookings
     */
    async loadBookings() {
        if (!this.app.isAuthenticated()) {
            this.renderEmptyState('Please login to view your bookings');
            return;
        }

        try {
            const userId = this.app.getCurrentUserId();

            // Load bookings from storage
            this.bookings = window.Storage.filterCollection('bookings',
                booking => booking.customerId === userId
            );

            // Sort by creation date (newest first)
            this.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Update provider filter options
            this.updateProviderFilter();

            // Apply current filters
            this.applyFilters();

            // Update statistics
            this.updateBookingStats();

            // Render bookings
            this.renderBookings();

        } catch (error) {
            console.error('Error loading bookings:', error);
            window.Toast.error('Failed to load bookings');
        }
    }

    /**
     * Update provider filter options
     */
    updateProviderFilter() {
        const providerFilter = document.getElementById('providerFilter');
        if (!providerFilter) return;

        const providers = [...new Set(this.bookings.map(booking => booking.providerName))];

        providerFilter.innerHTML = `
            <option value="">All Providers</option>
            ${providers.map(provider => `
                <option value="${provider}">${provider}</option>
            `).join('')}
        `;
    }

    /**
     * Switch between tabs
     */
    switchTab(tab) {
        this.currentTab = tab;

        // Update active tab
        document.querySelectorAll('.booking-tab').forEach(tabEl => {
            tabEl.classList.remove('active');
            if (tabEl.dataset.tab === tab) {
                tabEl.classList.add('active');
            }
        });

        // Apply filters and render
        this.applyFilters();
        this.renderBookings();
    }

    /**
     * Apply filters to bookings
     */
    applyFilters() {
        this.filteredBookings = this.bookings.filter(booking => {
            // Tab filter
            if (this.currentTab !== 'all') {
                if (this.currentTab === 'upcoming') {
                    const bookingDate = new Date(booking.scheduledDate);
                    const now = new Date();
                    if (booking.status !== 'confirmed' || bookingDate <= now) {
                        return false;
                    }
                } else if (booking.status !== this.currentTab) {
                    return false;
                }
            }

            // Service filter
            if (this.currentFilters.service && booking.serviceType !== this.currentFilters.service) {
                return false;
            }

            // Date range filter
            if (this.currentFilters.dateRange) {
                const bookingDate = new Date(booking.scheduledDate);
                const now = new Date();

                switch (this.currentFilters.dateRange) {
                    case 'today':
                        if (bookingDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (bookingDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        if (bookingDate < monthAgo) return false;
                        break;
                    case 'quarter':
                        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        if (bookingDate < quarterAgo) return false;
                        break;
                }
            }

            // Provider filter
            if (this.currentFilters.provider && booking.providerName !== this.currentFilters.provider) {
                return false;
            }

            return true;
        });
    }

    /**
     * Update booking statistics
     */
    updateBookingStats() {
        const totalBookings = this.bookings.length;
        const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
        const upcomingBookings = this.bookings.filter(b => {
            const bookingDate = new Date(b.scheduledDate);
            const now = new Date();
            return b.status === 'confirmed' && bookingDate > now;
        }).length;
        const totalSpent = this.bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Update DOM
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateStat('totalBookings', totalBookings);
        updateStat('completedBookings', completedBookings);
        updateStat('upcomingBookings', upcomingBookings);
        updateStat('totalSpent', `₹${totalSpent.toLocaleString()}`);
    }

    /**
     * Render bookings list
     */
    renderBookings() {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        if (this.filteredBookings.length === 0) {
            this.renderEmptyState('No bookings found for the selected criteria');
            return;
        }

        bookingsList.innerHTML = this.filteredBookings.map(booking =>
            this.createBookingCard(booking)
        ).join('');
    }

    /**
     * Create booking card
     */
    createBookingCard(booking) {
        const statusConfig = this.getStatusConfig(booking.status);
        const serviceData = CONSTANTS.SERVICES[booking.serviceType?.toUpperCase()];

        return `
            <div class="booking-card glass-card" data-booking-id="${booking.id}">
                <div class="booking-header">
                    <div class="booking-service">
                        <i class="fas ${serviceData?.icon || 'fa-tools'}"></i>
                        <div class="service-info">
                            <h3>${serviceData?.name || booking.serviceType}</h3>
                            <p>Booking ID: #${booking.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <div class="booking-status">
                        <span class="status-badge status-${statusConfig.class}">
                            <i class="fas ${statusConfig.icon}"></i>
                            ${statusConfig.label}
                        </span>
                    </div>
                </div>

                <div class="booking-details">
                    <div class="detail-row">
                        <div class="detail">
                            <span class="label">Provider:</span>
                            <span class="value">${booking.providerName || 'Provider Name'}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Date & Time:</span>
                            <span class="value">${this.formatDateTime(booking.scheduledDate, booking.scheduledTime)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail">
                            <span class="label">Address:</span>
                            <span class="value">${booking.serviceAddress?.street}, ${booking.serviceAddress?.area}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Amount:</span>
                            <span class="value amount">₹${booking.totalAmount}</span>
                        </div>
                    </div>

                    ${booking.description ? `
                    <div class="detail-row">
                        <div class="detail full-width">
                            <span class="label">Description:</span>
                            <span class="value">${booking.description}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>

                ${this.renderBookingProgress(booking)}

                <div class="booking-actions">
                    <button class="view-booking-details btn-text" data-booking-id="${booking.id}">
                        View Details
                    </button>
                    
                    ${this.renderBookingActionButtons(booking)}
                </div>
            </div>
        `;
    }

    /**
     * Render booking progress for in-progress bookings
     */
    renderBookingProgress(booking) {
        if (booking.status !== 'in_progress') return '';

        const steps = [
            { id: 'confirmed', label: 'Booking Confirmed', completed: true },
            { id: 'provider_assigned', label: 'Provider Assigned', completed: true },
            { id: 'on_the_way', label: 'Provider On The Way', completed: booking.progress?.on_the_way || false },
            { id: 'work_started', label: 'Work Started', completed: booking.progress?.work_started || false },
            { id: 'work_completed', label: 'Work Completed', completed: false }
        ];

        return `
            <div class="booking-progress">
                <h4>Service Progress</h4>
                <div class="progress-steps">
                    ${steps.map(step => `
                        <div class="progress-step ${step.completed ? 'completed' : ''}">
                            <div class="step-indicator">
                                <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'}"></i>
                            </div>
                            <span class="step-label">${step.label}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${booking.estimatedCompletion ? `
                <div class="estimated-completion">
                    <i class="fas fa-clock"></i>
                    Estimated completion: ${new Date(booking.estimatedCompletion).toLocaleTimeString()}
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render action buttons based on booking status
     */
    renderBookingActionButtons(booking) {
        switch (booking.status) {
            case 'confirmed':
                const canCancel = new Date(booking.scheduledDate) > new Date(Date.now() + 24 * 60 * 60 * 1000);
                return `
                    <button class="track-booking-btn btn-secondary" data-booking-id="${booking.id}">
                        <i class="fas fa-map-marker-alt"></i>
                        Track Provider
                    </button>
                    ${canCancel ? `
                    <button class="booking-action-btn btn-danger" data-booking-id="${booking.id}" data-action="cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    ` : ''}
                `;

            case 'in_progress':
                return `
                    <button class="track-booking-btn btn-secondary" data-booking-id="${booking.id}">
                        <i class="fas fa-map-marker-alt"></i>
                        Track Live
                    </button>
                    <button class="booking-action-btn btn-secondary" data-booking-id="${booking.id}" data-action="contact">
                        <i class="fas fa-phone"></i>
                        Contact Provider
                    </button>
                `;

            case 'completed':
                return `
                    ${!booking.reviewed ? `
                    <button class="review-provider-btn btn-primary" data-booking-id="${booking.id}">
                        <i class="fas fa-star"></i>
                        Rate & Review
                    </button>
                    ` : `
                    <span class="reviewed-badge">
                        <i class="fas fa-check"></i>
                        Reviewed
                    </span>
                    `}
                    <button class="rebook-service-btn btn-secondary" data-booking-id="${booking.id}">
                        <i class="fas fa-redo"></i>
                        Book Again
                    </button>
                `;

            case 'cancelled':
                return `
                    <button class="rebook-service-btn btn-secondary" data-booking-id="${booking.id}">
                        <i class="fas fa-redo"></i>
                        Book Again
                    </button>
                `;

            default:
                return '';
        }
    }

    /**
     * Get status configuration
     */
    getStatusConfig(status) {
        const configs = {
            pending: { class: 'warning', icon: 'fa-clock', label: 'Pending' },
            confirmed: { class: 'success', icon: 'fa-check-circle', label: 'Confirmed' },
            in_progress: { class: 'info', icon: 'fa-cog fa-spin', label: 'In Progress' },
            completed: { class: 'success', icon: 'fa-check-circle', label: 'Completed' },
            cancelled: { class: 'danger', icon: 'fa-times-circle', label: 'Cancelled' },
            refunded: { class: 'warning', icon: 'fa-undo', label: 'Refunded' }
        };

        return configs[status] || { class: 'secondary', icon: 'fa-question', label: 'Unknown' };
    }

    /**
     * Handle booking actions
     */
    async handleBookingAction(bookingId, action) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) {
            window.Toast.error('Booking not found');
            return;
        }

        try {
            switch (action) {
                case 'cancel':
                    await this.cancelBooking(bookingId);
                    break;
                case 'contact':
                    this.contactProvider(booking);
                    break;
                case 'reschedule':
                    this.rescheduleBooking(bookingId);
                    break;
                default:
                    window.Toast.warning('Action not implemented');
            }
        } catch (error) {
            console.error('Error handling booking action:', error);
            window.Toast.error('Failed to perform action');
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId) {
        const confirmed = await this.showConfirmationDialog(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? Cancellation charges may apply.',
            'Cancel Booking',
            'Keep Booking'
        );

        if (!confirmed) return;

        try {
            // Update booking status
            const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                this.bookings[bookingIndex].status = 'cancelled';
                this.bookings[bookingIndex].cancelledAt = new Date().toISOString();

                // Update in storage
                window.Storage.updateInCollection('bookings', bookingId, this.bookings[bookingIndex]);

                // Refresh view
                this.applyFilters();
                this.renderBookings();
                this.updateBookingStats();

                window.Toast.success('Booking cancelled successfully');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            window.Toast.error('Failed to cancel booking');
        }
    }

    /**
     * Track booking
     */
    trackBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // Mock tracking interface
        const trackingContent = `
            <div class="booking-tracking">
                <div class="tracking-header">
                    <h3>Live Tracking</h3>
                    <p>Booking #${booking.id.slice(-8).toUpperCase()}</p>
                </div>
                
                <div class="provider-info">
                    <div class="provider-avatar">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" alt="Provider">
                    </div>
                    <div class="provider-details">
                        <h4>${booking.providerName}</h4>
                        <p>Professional ${booking.serviceType}</p>
                        <div class="provider-contact">
                            <button class="btn-text">📞 Call</button>
                            <button class="btn-text">💬 Chat</button>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-map">
                    <div class="map-placeholder">
                        <i class="fas fa-map-marked-alt"></i>
                        <p>Provider is ${booking.status === 'in_progress' ? 'at your location' : '2.5 km away'}</p>
                        <p class="eta">ETA: ${booking.status === 'in_progress' ? 'Working on your service' : '15 minutes'}</p>
                    </div>
                </div>
                
                <div class="tracking-updates">
                    <h4>Recent Updates</h4>
                    <div class="update-timeline">
                        <div class="update-item">
                            <div class="update-time">5 min ago</div>
                            <div class="update-message">Provider started working on your service</div>
                        </div>
                        <div class="update-item">
                            <div class="update-time">15 min ago</div>
                            <div class="update-message">Provider arrived at your location</div>
                        </div>
                        <div class="update-item">
                            <div class="update-time">25 min ago</div>
                            <div class="update-message">Provider is on the way</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.Modal.showCustom('Track Booking', trackingContent);
    }

    /**
     * Show booking details
     */
    showBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const serviceData = CONSTANTS.SERVICES[booking.serviceType?.toUpperCase()];
        const statusConfig = this.getStatusConfig(booking.status);

        const detailsContent = `
            <div class="booking-details-modal">
                <div class="booking-detail-header">
                    <div class="service-icon">
                        <i class="fas ${serviceData?.icon || 'fa-tools'}"></i>
                    </div>
                    <div class="booking-info">
                        <h3>${serviceData?.name || booking.serviceType}</h3>
                        <p>Booking #${booking.id.slice(-8).toUpperCase()}</p>
                        <span class="status-badge status-${statusConfig.class}">
                            <i class="fas ${statusConfig.icon}"></i>
                            ${statusConfig.label}
                        </span>
                    </div>
                </div>

                <div class="detail-sections">
                    <div class="detail-section">
                        <h4>Service Details</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Service:</span>
                                <span class="value">${serviceData?.name || booking.serviceType}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Date & Time:</span>
                                <span class="value">${this.formatDateTime(booking.scheduledDate, booking.scheduledTime)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Duration:</span>
                                <span class="value">${booking.duration || '2 hours'}</span>
                            </div>
                            ${booking.description ? `
                            <div class="detail-item full-width">
                                <span class="label">Description:</span>
                                <span class="value">${booking.description}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Provider Information</h4>
                        <div class="provider-card-mini">
                            <div class="provider-avatar">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" alt="Provider">
                            </div>
                            <div class="provider-info">
                                <h5>${booking.providerName}</h5>
                                <div class="provider-rating">
                                    ⭐ 4.8 (156 reviews)
                                </div>
                                <div class="provider-contact">
                                    <button class="btn-text">Contact Provider</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Service Address</h4>
                        <div class="address-info">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="address-text">
                                <p>${booking.serviceAddress?.street}</p>
                                <p>${booking.serviceAddress?.area}, ${booking.serviceAddress?.city}</p>
                                <p>${booking.serviceAddress?.pinCode}</p>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Payment Details</h4>
                        <div class="payment-breakdown">
                            <div class="payment-item">
                                <span class="label">Service Cost:</span>
                                <span class="value">₹${booking.serviceCost || booking.totalAmount - 50}</span>
                            </div>
                            <div class="payment-item">
                                <span class="label">Platform Fee:</span>
                                <span class="value">₹${booking.platformFee || 30}</span>
                            </div>
                            <div class="payment-item">
                                <span class="label">Taxes:</span>
                                <span class="value">₹${booking.taxes || 20}</span>
                            </div>
                            <div class="payment-item total">
                                <span class="label">Total Amount:</span>
                                <span class="value">₹${booking.totalAmount}</span>
                            </div>
                            <div class="payment-method">
                                <span class="label">Payment Method:</span>
                                <span class="value">${booking.paymentMethod || 'UPI'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    ${this.renderBookingActionButtons(booking)}
                </div>
            </div>
        `;

        window.Modal.showCustom('Booking Details', detailsContent);
    }

    /**
     * Show review modal
     */
    showReviewModal(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const reviewContent = `
            <div class="review-modal">
                <div class="review-header">
                    <h3>Rate Your Experience</h3>
                    <p>How was your service with ${booking.providerName}?</p>
                </div>

                <div class="rating-section">
                    <div class="rating-input">
                        <div class="star-rating">
                            ${[1, 2, 3, 4, 5].map(rating => `
                                <input type="radio" name="rating" value="${rating}" id="star${rating}">
                                <label for="star${rating}" class="star">★</label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="review-categories">
                    <h4>Rate Different Aspects</h4>
                    <div class="category-ratings">
                        <div class="category-rating">
                            <span class="category-label">Quality of Work</span>
                            <div class="star-rating mini">
                                ${[1, 2, 3, 4, 5].map(rating => `
                                    <input type="radio" name="quality" value="${rating}" id="quality${rating}">
                                    <label for="quality${rating}" class="star">★</label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="category-rating">
                            <span class="category-label">Punctuality</span>
                            <div class="star-rating mini">
                                ${[1, 2, 3, 4, 5].map(rating => `
                                    <input type="radio" name="punctuality" value="${rating}" id="punctuality${rating}">
                                    <label for="punctuality${rating}" class="star">★</label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="category-rating">
                            <span class="category-label">Behavior</span>
                            <div class="star-rating mini">
                                ${[1, 2, 3, 4, 5].map(rating => `
                                    <input type="radio" name="behavior" value="${rating}" id="behavior${rating}">
                                    <label for="behavior${rating}" class="star">★</label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="review-comment">
                    <label for="reviewComment">Write a Review (Optional)</label>
                    <textarea id="reviewComment" placeholder="Share your experience with others..."></textarea>
                </div>

                <div class="review-actions">
                    <button class="btn-secondary" onclick="window.Modal.close()">Skip</button>
                    <button class="btn-primary" onclick="window.app.bookingView.submitReview('${bookingId}')">Submit Review</button>
                </div>
            </div>
        `;

        window.Modal.showCustom('Rate & Review', reviewContent);
    }

    /**
     * Submit review
     */
    async submitReview(bookingId) {
        try {
            const rating = document.querySelector('input[name="rating"]:checked')?.value;
            const qualityRating = document.querySelector('input[name="quality"]:checked')?.value;
            const punctualityRating = document.querySelector('input[name="punctuality"]:checked')?.value;
            const behaviorRating = document.querySelector('input[name="behavior"]:checked')?.value;
            const comment = document.getElementById('reviewComment')?.value;

            if (!rating) {
                window.Toast.error('Please provide an overall rating');
                return;
            }

            // Update booking with review
            const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                this.bookings[bookingIndex].reviewed = true;
                this.bookings[bookingIndex].review = {
                    rating: parseInt(rating),
                    qualityRating: parseInt(qualityRating),
                    punctualityRating: parseInt(punctualityRating),
                    behaviorRating: parseInt(behaviorRating),
                    comment: comment,
                    reviewedAt: new Date().toISOString()
                };

                // Update in storage
                window.Storage.updateInCollection('bookings', bookingId, this.bookings[bookingIndex]);

                // Create review record
                const review = {
                    id: `review_${Date.now()}`,
                    bookingId: bookingId,
                    customerId: this.app.getCurrentUserId(),
                    providerId: this.bookings[bookingIndex].providerId,
                    rating: parseInt(rating),
                    qualityRating: parseInt(qualityRating),
                    punctualityRating: parseInt(punctualityRating),
                    behaviorRating: parseInt(behaviorRating),
                    comment: comment,
                    serviceType: this.bookings[bookingIndex].serviceType,
                    createdAt: new Date().toISOString()
                };

                window.Storage.addToCollection('reviews', review);

                // Refresh view
                this.renderBookings();

                window.Modal.close();
                window.Toast.success('Thank you for your review!');
            }

        } catch (error) {
            console.error('Error submitting review:', error);
            window.Toast.error('Failed to submit review');
        }
    }

    /**
     * Rebook service
     */
    rebookService(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // Navigate to booking with pre-filled data
        if (window.BookingService) {
            const provider = {
                id: booking.providerId,
                name: booking.providerName,
                services: [booking.serviceType]
            };
            window.BookingService.initBooking(provider, booking.serviceType);
            window.Toast.info('Starting new booking with same provider');
        }
    }

    /**
     * Search bookings
     */
    searchBookings(query) {
        if (!query.trim()) {
            this.applyFilters();
            this.renderBookings();
            return;
        }

        const searchLower = query.toLowerCase();
        this.filteredBookings = this.bookings.filter(booking => {
            return booking.providerName?.toLowerCase().includes(searchLower) ||
                booking.serviceType?.toLowerCase().includes(searchLower) ||
                booking.id.toLowerCase().includes(searchLower) ||
                booking.serviceAddress?.area?.toLowerCase().includes(searchLower);
        });

        this.renderBookings();
    }

    /**
     * Update filter
     */
    updateFilter(input) {
        const { id, value } = input;

        switch (id) {
            case 'serviceFilter':
                this.currentFilters.service = value;
                break;
            case 'dateRangeFilter':
                this.currentFilters.dateRange = value;
                break;
            case 'providerFilter':
                this.currentFilters.provider = value;
                break;
        }

        this.applyFilters();
        this.renderBookings();
    }

    /**
     * Render empty state
     */
    renderEmptyState(message) {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        bookingsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <h3>No Bookings Found</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.app.handleNavigation('home')">
                    Book Your First Service
                </button>
            </div>
        `;
    }

    /**
     * Contact provider
     */
    contactProvider(booking) {
        window.Toast.info(`Connecting you with ${booking.providerName}...`);

        // Mock contact functionality
        setTimeout(() => {
            window.Toast.success(`Connected with ${booking.providerName}`);
        }, 2000);
    }

    /**
     * Utility methods
     */
    formatDateTime(date, time) {
        const bookingDate = new Date(date);
        const dateStr = bookingDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        return `${dateStr} at ${time || '10:00 AM'}`;
    }

    async showConfirmationDialog(title, message, confirmText, cancelText) {
        return new Promise((resolve) => {
            const dialogContent = `
                <div class="confirmation-dialog">
                    <p>${message}</p>
                    <div class="dialog-actions">
                        <button class="btn-secondary" onclick="window.Modal.resolveConfirmation(false)">${cancelText}</button>
                        <button class="btn-danger" onclick="window.Modal.resolveConfirmation(true)">${confirmText}</button>
                    </div>
                </div>
            `;

            window.Modal.showCustom(title, dialogContent);
            window.Modal.resolveConfirmation = resolve;
        });
    }

    /**
     * Public methods
     */
    async refresh() {
        await this.loadBookings();
    }

    async showBookings() {
        await this.loadBookings();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookingView;
}
