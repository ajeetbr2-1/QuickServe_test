function initializeQuickServe()
// Example: fetch(...)
.then(() => {...})
.catch(() => {...})
.finally(() => {
  document.getElementById('loader').style.display = 'none';
});

window.addEventListener("DOMContentLoaded", function() {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 4000);
  }
});

// If app already uses async init, wrap and end with hiding loader in finally block.
