// QuickServe Application Main Entry Point
import { homeView } from './views/home.view.js';
import { providersView } from './views/providers.view.js';
import { bookingView } from './views/booking.view.js';
import { ApiService } from './services/api.service.js';

class QuickServeApp {
    constructor() {
        this.currentView = 'home';
        this.services = [];
        this.providers = [];
    }

    async init() {
        try {
            console.log('🚀 Starting QuickServe app initialization...');

            // Initialize loading screen
            console.log('⏳ Showing loading screen...');
            this.showLoading();

            // Load services data
            console.log('📋 Loading services data...');
            await this.loadServices();

            // Initialize views
            console.log('🔧 Initializing views...');
            this.initializeViews();

            // Setup event listeners
            console.log('⚡ Setting up event listeners...');
            this.setupEventListeners();

            // Show initial view (this completes the app initialization)
            console.log('🏠 Showing initial view...');
            this.showView('home');

            // Hide loading screen only after view is fully shown
            console.log('✅ App initialization complete, hiding loading screen...');
            this.hideLoading();

            console.log('🎉 QuickServe app fully loaded and ready!');

        } catch (error) {
            console.error('💥 App initialization failed:', error);
            this.hideLoading();
            this.showError('Failed to load application');
        }
    }

    async loadServices() {
        try {
            console.log('🔄 Starting to load services...');

            // Check if Supabase is available and enabled
            if (window.Supabase && window.Supabase.enabled) {
                console.log('🔗 Using Supabase for services...');
                try {
                    const services = await window.Supabase.services.listServices();
                    console.log(`📊 Loaded ${services.length} services from Supabase`);
                    this.services = services.map(service => ({
                        id: service.id,
                        name: service.title || service.name,
                        category: service.category,
                        description: service.description,
                        price: service.price,
                        duration: service.duration || service.duration_text,
                        rating: service.rating || 0,
                        reviews: service.reviews || 0,
                        image: service.images ? service.images[0] : 'assets/images/services/default.jpg',
                        available: service.available !== false,
                        verified: service.verified || false
                    }));
                    return;
                } catch (supabaseError) {
                    console.error('❌ Supabase services failed:', supabaseError);
                    console.log('🔄 Falling back to static services.json...');
                }
            }

            // Fallback to static services.json (for development/testing)
            console.log('📄 Using static services.json...');
            const possiblePaths = [
                './services.json',           // Root level (Vercel standard)
                './public/services.json',    // Public folder (local development)
                '/services.json'             // Absolute path (failsafe)
            ];

            let response = null;
            for (const path of possiblePaths) {
                try {
                    console.log(`📡 Trying path: ${path}`);
                    response = await fetch(path, {
                        cache: 'no-cache',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log(`✅ Response status for ${path}:`, response.status);
                    if (response.ok) {
                        console.log(`🎉 Successfully loaded from ${path}`);
                        break;
                    }
                } catch (e) {
                    console.log(`❌ Path ${path} failed:`, e.message);
                }
            }

            if (!response || !response.ok) {
                console.error('💥 Services.json not found at any expected location');
                throw new Error('Services.json not found at any expected location');
            }

            const services = await response.json();
            console.log(`📊 Loaded ${services.length} services from static file`);
            this.services = services;
        } catch (error) {
            console.error('💥 Failed to load services:', error);
            // Provide fallback services if everything fails
            this.services = [
                {
                    id: 1,
                    name: "Plumbing Repair",
                    category: "Plumbing & Electrical",
                    description: "Professional plumbing services for pipes, leaks, and fixture repairs",
                    price: 500,
                    duration: "2-4 hours",
                    rating: 4.5,
                    reviews: 25,
                    image: "assets/images/services/default.jpg",
                    available: true,
                    verified: true
                },
                {
                    id: 2,
                    name: "Electrical Work",
                    category: "Plumbing & Electrical",
                    description: "Electrical installation, repair, and maintenance services",
                    price: 300,
                    duration: "1-3 hours",
                    rating: 4.2,
                    reviews: 18,
                    image: "assets/images/services/default.jpg",
                    available: true,
                    verified: true
                },
                {
                    id: 3,
                    name: "Carpentry",
                    category: "Home Improvement",
                    description: "Professional carpentry and woodworking services",
                    price: 400,
                    duration: "3-5 hours",
                    rating: 4.7,
                    reviews: 32,
                    image: "assets/images/services/default.jpg",
                    available: true,
                    verified: true
                }
            ];
            console.log('📋 Using fallback services data');
        }
    }

    initializeViews() {
        // Initialize all views
        homeView.init(this.services);
        providersView.init(this.providers);
        bookingView.init();
    }

    setupEventListeners() {
        // Category navigation
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('href').substring(1);
                this.showView(view);
            });
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu);
        }

        // Global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });

        // Update active navigation
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected view
        const viewElement = document.getElementById(`${viewName}View`);
        if (viewElement) {
            viewElement.style.display = 'block';
        }

        // Update active nav
        const activeNav = document.querySelector(`[href="#${viewName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        this.currentView = viewName;
    }

    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            console.log('Loading screen shown by app.js');
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('Loading screen hidden by app.js at', new Date().toISOString());
        } else {
            console.warn('Loading screen element not found when trying to hide');
        }
    }

    showError(message) {
        console.error(message);
        // You can implement a proper error display here
    }

    toggleMobileMenu() {
        const nav = document.querySelector('.nav-wrapper');
        nav.classList.toggle('mobile-open');
    }

    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        // Implement search functionality
        console.log('Searching for:', query);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quickServeApp = new QuickServeApp();
});