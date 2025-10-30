// loader.js
async function main() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Wait for the service worker to be ready and controlling the page.
      await navigator.serviceWorker.ready;
      console.log('ServiceWorker is ready and controlling the page.');

      loadAppScripts();

    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Failed to initialize application environment. Please try again.</div>';
      }
    }
  } else {
    console.warn('ServiceWorker is not supported.');
    loadAppScripts();
  }
}

function loadAppScripts() {
  console.log('Loading application scripts...');
  
  // 1. Create and append the Babel Standalone script
  const babelScript = document.createElement('script');
  babelScript.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
  babelScript.onload = () => {
    console.log('Babel loaded.');
    // 2. Once Babel is loaded, create and append the main app script
    const appScript = document.createElement('script');
    appScript.type = 'text/babel';
    appScript.setAttribute('data-presets', 'react,typescript');
    appScript.setAttribute('data-type', 'module');
    appScript.src = './index.tsx';
    
    appScript.onerror = () => {
        console.error("Failed to load or execute the main application script (index.tsx).");
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error loading application. Please check the console for details and try clearing your cache.</div>';
        }
    };

    document.body.appendChild(appScript);
    console.log('Application script tag appended.');
  };
  
  babelScript.onerror = () => {
    console.error("Failed to load Babel Standalone script.");
     const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Critical dependency (Babel) failed to load. Please check your internet connection.</div>';
      }
  };

  document.head.appendChild(babelScript);
}

main();
