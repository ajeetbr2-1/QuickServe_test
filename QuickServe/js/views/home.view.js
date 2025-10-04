export const homeView = {
    services: [],
    boundEventHandler: null,
    
    init(services = []) {
        this.services = services;
        this.cleanup(); // Clean up any existing listeners first
        this.bindEvents();
        this.renderServices();
    },

    bindEvents() {
        // Store reference to bound function so we can remove it later
        this.boundEventHandler = (e) => {
            if (e.target.closest('.service-tile')) {
                const tile = e.target.closest('.service-tile');
                const serviceId = tile.dataset.serviceId;
                this.handleServiceSelection(serviceId);
            }
        };
        document.addEventListener('click', this.boundEventHandler);
    },

    cleanup() {
        // Remove existing event listener if it exists
        if (this.boundEventHandler) {
            document.removeEventListener('click', this.boundEventHandler);
            this.boundEventHandler = null;
        }
    },

    renderServices() {
        const servicesContainer = document.querySelector('.services-grid');
        if (servicesContainer && this.services.length > 0) {
            servicesContainer.innerHTML = this.services.slice(0, 8).map(service => 
                '<div class="service-tile" data-service-id="' + service.id + '">' +
                    '<div class="service-icon">' +
                        '<img src="' + service.image + '" alt="' + service.name + '" onerror="this.src=\'/services/default.jpg\'">' +
                    '</div>' +
                    '<h3>' + service.name + '</h3>' +
                    '<p>₹' + service.price + '</p>' +
                    '<span class="service-category">' + service.category + '</span>' +
                '</div>'
            ).join('');
        }
    },

    handleServiceSelection(serviceId) {
        const service = this.services.find(s => s.id == serviceId);
        if (service) {
            console.log('Selected service:', service);
        }
    }
};
