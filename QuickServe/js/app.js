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
        this.init();
    }

    async init() {
        try {
            // Initialize loading screen
            this.showLoading();
            
            // Load services data
            await this.loadServices();
            
            // Initialize views
            this.initializeViews();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen
            this.hideLoading();
            
            // Show initial view
            this.showView('home');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.hideLoading();
            this.showError('Failed to load application');
        }
    }

    async loadServices() {
        try {
            const response = await fetch('./services.json');
            this.services = await response.json();
        } catch (error) {
            console.error('Failed to load services:', error);
            this.services = [];
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
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('Loading screen hidden by app.js');
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
