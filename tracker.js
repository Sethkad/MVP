(function() {
    // Collect visitor data
    const visitorData = {
      url: window.location.href, // Current page URL
      referrer: document.referrer, // Referring URL
      userAgent: navigator.userAgent, // Browser and device info
      cookies: document.cookie, // Any existing cookies
    };
  
    // Send data to your backend
    fetch('https://your-backend-url.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData),
    })
    .then(response => console.log('Tracking data sent successfully:', response.status))
    .catch(error => console.error('Error sending tracking data:', error));
  })();