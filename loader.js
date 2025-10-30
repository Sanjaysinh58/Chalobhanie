// Definitive solution to the service worker race condition.
if ('serviceWorker' in navigator) {
  const handleError = (error, message) => {
    console.error(message, error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;"><h2>Application failed to load.</h2><p>${message}</p></div>`;
    }
  };

  const loadApp = () => {
    // Now that we can GUARANTEE the SW will intercept the request,
    // we dynamically create and append the main application script tag.
    const appScript = document.createElement('script');
    appScript.type = 'text/babel';
    appScript.setAttribute('data-type', 'module');
    appScript.setAttribute('data-presets', 'react,typescript');
    appScript.src = './index.tsx';
    appScript.onerror = () => handleError(null, "The main application script (index.tsx) failed to load. Please try clearing your cache and reloading.");
    document.body.appendChild(appScript);

    // After appending, we must explicitly tell Babel to process this new script.
    // We poll for Babel as it might not be loaded yet.
    const interval = setInterval(() => {
      if (window.Babel) {
        clearInterval(interval);
        try {
          Babel.transformScriptTags();
        } catch (e) {
            handleError(e, "Babel failed to transpile the application script.")
        }
      }
    }, 50);
  };

  const swUrl = new URL('./sw.js', window.location.origin).href;
  navigator.serviceWorker.register(swUrl)
    .then(registration => {
      console.log('ServiceWorker registration successful:', registration);
      // navigator.serviceWorker.ready resolves when the SW is active and controlling the page.
      return navigator.serviceWorker.ready;
    })
    .then(readyRegistration => {
      console.log('ServiceWorker is active and ready to handle fetches.');
      loadApp();
    })
    .catch(error => {
      handleError(error, 'The Service Worker could not be registered. This app requires a modern browser with Service Worker support enabled.');
    });
} else {
  console.error("Service workers are not supported by this browser.");
  const root = document.getElementById('root');
  if (root) {
      root.innerHTML = '<div style="padding: 2rem; text-align: center; color: red;"><h2>Browser Not Supported</h2><p>This application requires a browser that supports Service Workers.</p></div>';
  }
}
