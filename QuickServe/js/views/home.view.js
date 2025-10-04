export const homeView = {
    services: [],
    
    init(services = []) {
        this.services = services;
        this.bindEvents();
        this.renderServices();
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.service-tile')) {
                const tile = e.target.closest('.service-tile');
                const serviceId = tile.dataset.service;
                this.handleServiceSelection(serviceId);
            }
        });
    },

    renderServices() {
        const servicesContainer = document.querySelector('.services-grid');
        if (servicesContainer && this.services.length > 0) {
            servicesContainer.innerHTML = this.services.slice(0, 8).map(service =>
                '<div class="service-tile" data-service="' + service.name.toLowerCase().replace(/\s+/g, '-') + '">' +
                    '<div class="service-icon">' +
                        '<img src="' + (service.image || 'assets/images/services/default.jpg') + '" alt="' + service.name + '" onerror="this.src=\'assets/images/services/default.jpg\'">' +
                    '</div>' +
                    '<h3>' + service.name + '</h3>' +
                    '<p>₹' + service.price + '</p>' +
                    '<span class="service-category">' + service.category + '</span>' +
                '</div>'
            ).join('');
        }
    },

    handleServiceSelection(serviceName) {
        const service = this.services.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === serviceName);
        if (service) {
            console.log('Selected service:', service);
            // You can add navigation or modal opening logic here
        }
    }
};
