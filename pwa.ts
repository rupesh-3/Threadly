// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Skip PWA update checks in development mode
    const isDevelopment = !location.hostname.includes('vercel') && 
                          !location.hostname.includes('netlify') &&
                          !location.hostname.includes('github.io') &&
                          (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
        
        // Only check for updates in production
        if (!isDevelopment) {
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('🔄 New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        } else {
          console.log('📱 PWA update checks disabled in development mode');
        }
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed (offline mode enabled):', error);
      });
  });
}
