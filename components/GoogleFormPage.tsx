import React from 'https://aistudiocdn.com/react@^19.2.0';

const GoogleFormPage: React.FC = () => {
  // IMPORTANT: Replace this placeholder with your actual Google Form URL.
  // To get the correct URL, go to your form, click "Send", go to the "<>" (Embed) tab,
  // and copy the URL from the `src` attribute of the iframe code.
  const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfzJ4QQIJMui-le2fu9Q_6CnAMnyVFjvzuECLItlrvPbrCTlg/viewform?embedded=true';

  return (
    // The height is calculated as: 100vh - header (4rem) - bottom nav (4rem) - main content top padding (1rem) = 100vh - 9rem.
    // This ensures the iframe fits perfectly within the available screen space without causing unnecessary scrolling.
    <div className="w-full h-[calc(100vh-9rem)] bg-white dark:bg-slate-800">
      <iframe
        src={GOOGLE_FORM_EMBED_URL}
        width="100%"
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Comment Form"
        style={{ border: 'none' }}
      >
        Loading…
      </iframe>
    </div>
  );
};

export default GoogleFormPage;