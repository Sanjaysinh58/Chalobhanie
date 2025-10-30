// A re-architected, more robust loading mechanism to definitively solve the blank page issue.

/**
 * Displays a critical error message to the user in the main app container.
 * @param {string} message - The primary error message to display.
 * @param {Error|null} error - The associated error object, if any.
 */
const handleError = (message, error) => {
  console.error(message, error || '');
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">
                        <h2 style="font-size: 1.5rem; font-weight: bold;">Application failed to load.</h2>
                        <p style="margin-top: 0.5rem;">${message}</p>
                      </div>`;
  }
};

/**
 * Fetches the application's source code, transpiles it from TSX to pure JavaScript,
 * and injects it into the document to be executed.
 */
const loadApp = async () => {
  try {
    // 1. Wait until the Babel library is available from its CDN script.
    let attempts = 0;
    while (!window.Babel && attempts < 100) { // Poll for 5 seconds max
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    if (!window.Babel) {
      throw new Error("Babel.js did not load from its CDN. Cannot transpile the application.");
    }

    // 2. Fetch the main TSX file as plain text. This bypasses browser MIME type checks.
    const response = await fetch('./index.tsx');
    if (!response.ok) {
      throw new Error(`Failed to fetch the main application file (index.tsx). Status: ${response.status}`);
    }
    const tsxCode = await response.text();

    // 3. Manually transpile the fetched code from text to executable JavaScript.
    const transformed = window.Babel.transform(tsxCode, {
      presets: ['react', 'typescript'],
      filename: 'index.tsx' // A hint for Babel to use the correct parsers.
    });

    if (!transformed || !transformed.code) {
        throw new Error("Babel transformation failed and returned empty code.");
    }
    
    // 4. Create a new script tag, set its type to 'module' (crucial for 'import' statements to work),
    //    and inject the pure JavaScript code.
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = transformed.code;
    document.body.appendChild(script);

  } catch (error) {
    handleError("An error occurred during application setup. Please try clearing your cache and reloading.", error);
  }
};

// --- Main Execution ---

// Load the application using the new robust method.
loadApp();

// In parallel, register the service worker for offline capabilities and faster subsequent loads.
// The app's initial startup no longer depends on the service worker being ready.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = new URL('./sw.js', window.location.origin).href;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration);
      }).catch(error => {
        console.warn('ServiceWorker registration failed. Offline functionality may not be available.', error);
      });
  });
}