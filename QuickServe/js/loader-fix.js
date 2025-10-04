// Backup loader fix - only hide if main app fails to hide loading screen
document.addEventListener('DOMContentLoaded', function() {
    // Set a longer timeout as a failsafe in case the main app fails
    setTimeout(function() {
        var loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.warn('Loading screen failsafe activated - hiding loading screen');
            loadingScreen.style.display = 'none';
        }
    }, 5000); // Hide after 5 seconds as failsafe only
});