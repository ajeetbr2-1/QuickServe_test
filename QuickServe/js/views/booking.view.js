export const bookingView = {
    boundEventHandlers: [],
    
    init() {
        this.cleanup(); // Clean up any existing listeners first
        this.bindEvents();
    },

    bindEvents() {
        console.log('Booking view events bound');
        // Add any event listeners here and store references for cleanup
    },

    cleanup() {
        // Remove all event listeners
        this.boundEventHandlers.forEach(handler => {
            if (handler.element && handler.event && handler.callback) {
                handler.element.removeEventListener(handler.event, handler.callback);
            }
        });
        this.boundEventHandlers = [];
        console.log('Booking view cleaned up');
    }
};
