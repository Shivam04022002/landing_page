import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import LandingPage from './pages/LandingPage';
import FloatingButtons from './components/FloatingButtons';

function App() {
  // Initialize Google Analytics and Facebook Pixel
  useEffect(() => {
    // Google Analytics
    const gaId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
    if (gaId && gaId !== 'your_ga_id_here') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaId);
    }

    // Facebook Pixel
    const fbPixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
    if (fbPixelId && fbPixelId !== 'your_pixel_id_here') {
      // eslint-disable-next-line no-unused-expressions
      (function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', fbPixelId);
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Quick Business Loans | Instant Approval | Low Interest Rates</title>
        <meta name="description" content="Get instant business loans with low interest rates. Quick approval, minimal documentation. Apply now for business expansion, inventory, machinery, and working capital needs." />
      </Helmet>
      <div className="min-h-screen bg-orange-50 text-gray-900 overflow-x-hidden">
        <LandingPage />
        <FloatingButtons />
      </div>
    </>
  );
}

export default App;
