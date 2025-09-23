// Simple direct script to immediately hide the loading screen
document.addEventListener('DOMContentLoaded', function() {
    // Quick fix for the loading screen
    setTimeout(function() {
        var loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 1500); // Hide after 1.5 seconds
});