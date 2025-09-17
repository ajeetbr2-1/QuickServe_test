/**
 * API Service Layer
 * Handles all backend communication and data synchronization
 */

class ApiService {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.retryAttempts = 3;
        this.timeoutDuration = 10000;
        this.authToken = Storage.getItem('authToken');
        this.refreshToken = Storage.getItem('refreshToken');
        this.interceptors = {
            request: [],
            response: []
        };

        this.initializeInterceptors();
    }

    /**
     * Get base URL based on environment
     */
    getBaseURL() {
        // Prefer runtime-configured base URL (for Vercel/static hosting)
        if (typeof window !== 'undefined') {
            // 1) window.ENV.API_BASE_URL from public config.js
            const envBase = window.ENV && window.ENV.API_BASE_URL;
            if (typeof envBase === 'string') {
                // Treat empty string as disabled
                return envBase.trim() === '' ? null : envBase;
            }

            // 2) Optional meta tag <meta name="api-base-url" content="https://...">
            const meta = document.querySelector && document.querySelector('meta[name="api-base-url"]');
            if (meta && meta.content) return meta.content || null;

            // 3) Fallbacks (keep simple, no localhost coupling)
            if (window.location.hostname.includes('staging')) {
                return 'https://api-staging.quickserve.com/v1';
            }
            return 'https://api.quickserve.com/v1';
        }

        // Node/test env
        const base = process.env.API_BASE_URL;
        return base && base.trim() !== '' ? base : null;
    }

    /**
     * Initialize request and response interceptors
     */
    initializeInterceptors() {
        // Request interceptor for authentication
        this.addRequestInterceptor((config) => {
            if (this.authToken) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${this.authToken}`
                };
            }

            // Add correlation ID for tracing
            config.headers['X-Correlation-ID'] = this.generateCorrelationId();

            // Add client info
            config.headers['X-Client-Version'] = '1.0.0';
            config.headers['X-Platform'] = this.getPlatform();

            return config;
        });

        // Response interceptor for error handling
        this.addResponseInterceptor(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Handle 401 errors with token refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshAuthToken();
                        return this.request(originalRequest);
                    } catch (refreshError) {
                        this.handleAuthFailure();
                        throw refreshError;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(successHandler, errorHandler) {
        this.interceptors.response.push({ successHandler, errorHandler });
    }

    /**
     * Main request method
     */
    async request(config) {
        // Apply request interceptors
        let finalConfig = { ...config };
        for (const interceptor of this.interceptors.request) {
            finalConfig = interceptor(finalConfig) || finalConfig;
        }

        // Set default headers
        finalConfig.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...finalConfig.headers
        };

        let lastError;

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await this.makeRequest(finalConfig);

                // Apply response interceptors
                let finalResponse = response;
                for (const interceptor of this.interceptors.response) {
                    try {
                        finalResponse = interceptor.successHandler(finalResponse) || finalResponse;
                    } catch (interceptorError) {
                        console.warn('Response interceptor error:', interceptorError);
                    }
                }

                return finalResponse;

            } catch (error) {
                lastError = error;

                // Apply error interceptors
                for (const interceptor of this.interceptors.response) {
                    if (interceptor.errorHandler) {
                        try {
                            const result = await interceptor.errorHandler(error);
                            if (result) return result;
                        } catch (interceptorError) {
                            console.warn('Error interceptor failed:', interceptorError);
                        }
                    }
                }

                // Don't retry on certain errors
                if (this.shouldNotRetry(error)) {
                    break;
                }

                // Wait before retry
                if (attempt < this.retryAttempts) {
                    await this.delay(this.getRetryDelay(attempt));
                }
            }
        }

        throw lastError;
    }

    /**
     * Make the actual HTTP request
     */
    async makeRequest(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

        try {
            // If baseURL is disabled/null and relative URL provided, block the request gracefully
            const url = config.url.startsWith('http')
                ? config.url
                : (this.baseURL ? `${this.baseURL}${config.url}` : (() => { throw new ApiError(400, 'API disabled', { message: 'API base URL not set' }); })());

            const response = await fetch(url, {
                method: config.method || 'GET',
                headers: config.headers,
                body: config.data ? JSON.stringify(config.data) : undefined,
                signal: controller.signal,
                ...config
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new ApiError(response.status, response.statusText, await this.parseErrorResponse(response));
            }

            const data = await this.parseResponse(response);
            return { data, status: response.status, headers: response.headers };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new ApiError(408, 'Request Timeout', { message: 'Request timed out' });
            }

            throw error;
        }
    }

    /**
     * Parse response based on content type
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            return await response.json();
        } else if (contentType?.includes('text/')) {
            return await response.text();
        } else {
            return await response.blob();
        }
    }

    /**
     * Parse error response
     */
    async parseErrorResponse(response) {
        try {
            return await response.json();
        } catch {
            return { message: response.statusText };
        }
    }

    /**
     * HTTP GET request
     */
    async get(url, params = {}, config = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return this.request({
            method: 'GET',
            url: fullUrl,
            ...config
        });
    }

    /**
     * HTTP POST request
     */
    async post(url, data = {}, config = {}) {
        return this.request({
            method: 'POST',
            url,
            data,
            ...config
        });
    }

    /**
     * HTTP PUT request
     */
    async put(url, data = {}, config = {}) {
        return this.request({
            method: 'PUT',
            url,
            data,
            ...config
        });
    }

    /**
     * HTTP PATCH request
     */
    async patch(url, data = {}, config = {}) {
        return this.request({
            method: 'PATCH',
            url,
            data,
            ...config
        });
    }

    /**
     * HTTP DELETE request
     */
    async delete(url, config = {}) {
        return this.request({
            method: 'DELETE',
            url,
            ...config
        });
    }

    /**
     * File upload request
     */
    async upload(url, formData, config = {}) {
        return this.request({
            method: 'POST',
            url,
            data: formData,
            headers: {
                // Don't set Content-Type for FormData, let browser set it
                ...config.headers
            },
            ...config
        });
    }

    /**
     * Refresh authentication token
     */
    async refreshAuthToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.refreshToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            this.setAuthTokens(data.accessToken, data.refreshToken);

            return data.accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    /**
     * Set authentication tokens
     */
    setAuthTokens(accessToken, refreshToken) {
        this.authToken = accessToken;
        this.refreshToken = refreshToken;

        Storage.setItem('authToken', accessToken);
        if (refreshToken) {
            Storage.setItem('refreshToken', refreshToken);
        }
    }

    /**
     * Clear authentication tokens
     */
    clearAuthTokens() {
        this.authToken = null;
        this.refreshToken = null;

        Storage.removeItem('authToken');
        Storage.removeItem('refreshToken');
    }

    /**
     * Handle authentication failure
     */
    handleAuthFailure() {
        this.clearAuthTokens();

        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }

        // Emit auth failure event
        document.dispatchEvent(new CustomEvent('auth:failure'));
    }

    /**
     * Check if error should not be retried
     */
    shouldNotRetry(error) {
        // Don't retry on client errors (400-499) except 408, 429
        if (error instanceof ApiError) {
            const status = error.status;
            return status >= 400 && status < 500 && status !== 408 && status !== 429;
        }

        return false;
    }

    /**
     * Get retry delay
     */
    getRetryDelay(attempt) {
        // Exponential backoff: 1s, 2s, 4s
        return Math.pow(2, attempt - 1) * 1000;
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate correlation ID for tracing
     */
    generateCorrelationId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get platform information
     */
    getPlatform() {
        if (typeof window === 'undefined') return 'server';

        const userAgent = navigator.userAgent;
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.get('/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    /**
     * Get API status
     */
    async getStatus() {
        try {
            const response = await this.get('/status');
            return response.data;
        } catch (error) {
            console.error('Status check failed:', error);
            return { status: 'unknown', error: error.message };
        }
    }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(status, statusText, data = {}) {
        super(data.message || statusText);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

/**
 * API Endpoints Configuration
 */
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password'
    },

    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        UPLOAD_AVATAR: '/users/avatar',
        PREFERENCES: '/users/preferences',
        ADDRESSES: '/users/addresses'
    },

    // Services
    SERVICES: {
        LIST: '/services',
        DETAILS: (id) => `/services/${id}`,
        SEARCH: '/services/search',
        CATEGORIES: '/services/categories',
        FEATURED: '/services/featured'
    },

    // Providers
    PROVIDERS: {
        LIST: '/providers',
        DETAILS: (id) => `/providers/${id}`,
        SEARCH: '/providers/search',
        REVIEWS: (id) => `/providers/${id}/reviews`,
        AVAILABILITY: (id) => `/providers/${id}/availability`
    },

    // Bookings
    BOOKINGS: {
        CREATE: '/bookings',
        LIST: '/bookings',
        DETAILS: (id) => `/bookings/${id}`,
        UPDATE: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
        TRACK: (id) => `/bookings/${id}/track`
    },

    // Payments
    PAYMENTS: {
        PROCESS: '/payments',
        HISTORY: '/payments/history',
        REFUND: (id) => `/payments/${id}/refund`,
        METHODS: '/payments/methods'
    },

    // Reviews
    REVIEWS: {
        CREATE: '/reviews',
        UPDATE: (id) => `/reviews/${id}`,
        DELETE: (id) => `/reviews/${id}`,
        HELPFUL: (id) => `/reviews/${id}/helpful`
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        PREFERENCES: '/notifications/preferences'
    },

    // Admin
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        PROVIDERS: '/admin/providers',
        BOOKINGS: '/admin/bookings',
        ANALYTICS: '/admin/analytics',
        SETTINGS: '/admin/settings'
    }
};

/**
 * Specialized API service classes
 */

// Authentication API
class AuthApiService {
    constructor(apiService) {
        this.api = apiService;
    }

    async login(credentials) {
        const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

        if (response.data.accessToken) {
            this.api.setAuthTokens(response.data.accessToken, response.data.refreshToken);
        }

        return response.data;
    }

    async register(userData) {
        const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

        if (response.data.accessToken) {
            this.api.setAuthTokens(response.data.accessToken, response.data.refreshToken);
        }

        return response.data;
    }

    async logout() {
        try {
            await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } finally {
            this.api.clearAuthTokens();
        }
    }

    async verifyEmail(token) {
        return this.api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    }

    async forgotPassword(email) {
        return this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    }

    async resetPassword(token, newPassword) {
        return this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password: newPassword });
    }
}

// Booking API
class BookingApiService {
    constructor(apiService) {
        this.api = apiService;
    }

    async createBooking(bookingData) {
        const response = await this.api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
        return response.data;
    }

    async getBookings(params = {}) {
        const response = await this.api.get(API_ENDPOINTS.BOOKINGS.LIST, params);
        return response.data;
    }

    async getBookingDetails(bookingId) {
        const response = await this.api.get(API_ENDPOINTS.BOOKINGS.DETAILS(bookingId));
        return response.data;
    }

    async updateBooking(bookingId, updates) {
        const response = await this.api.patch(API_ENDPOINTS.BOOKINGS.UPDATE(bookingId), updates);
        return response.data;
    }

    async cancelBooking(bookingId, reason) {
        const response = await this.api.post(API_ENDPOINTS.BOOKINGS.CANCEL(bookingId), { reason });
        return response.data;
    }

    async trackBooking(bookingId) {
        const response = await this.api.get(API_ENDPOINTS.BOOKINGS.TRACK(bookingId));
        return response.data;
    }
}

// Payment API
class PaymentApiService {
    constructor(apiService) {
        this.api = apiService;
    }

    async processPayment(paymentData) {
        const response = await this.api.post(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData);
        return response.data;
    }

    async getPaymentHistory(params = {}) {
        const response = await this.api.get(API_ENDPOINTS.PAYMENTS.HISTORY, params);
        return response.data;
    }

    async requestRefund(paymentId, reason) {
        const response = await this.api.post(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), { reason });
        return response.data;
    }

    async getPaymentMethods() {
        const response = await this.api.get(API_ENDPOINTS.PAYMENTS.METHODS);
        return response.data;
    }
}

// Initialize API services
const apiService = new ApiService();
const authApi = new AuthApiService(apiService);
const bookingApi = new BookingApiService(apiService);
const paymentApi = new PaymentApiService(apiService);

// Export for global use
window.ApiService = apiService;
window.AuthApi = authApi;
window.BookingApi = bookingApi;
window.PaymentApi = paymentApi;
window.API_ENDPOINTS = API_ENDPOINTS;
window.ApiError = ApiError;

console.log('🔌 API Service layer initialized');
