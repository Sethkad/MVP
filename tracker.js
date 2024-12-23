// Function to get the IP address using ipify API
async function getVisitorIP() {
  try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;  // Return the visitor's IP address
  } catch (error) {
      console.error('Error fetching IP address:', error);
      return 'IP not found';  // Default fallback if API fails
  }
}

// Function to send the tracking data to the server
async function sendTrackingData() {
  const userIP = await getVisitorIP(); // Get the IP address
  const cookies = document.cookie; // Get the cookies from the browser
  const timestamp = new Date().toISOString(); // Get the current timestamp

  // Send the collected data to the server endpoint
  fetch('https://your-server-endpoint.com/track', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          ip: userIP, // Visitor IP address
          cookies: cookies, // Visitor cookies
          timestamp: timestamp // Current timestamp
      })
  })
  .then(response => response.json())
  .then(data => console.log('Data successfully sent to server:', data))
  .catch(error => console.error('Error sending data:', error));
}

// Call the function to send the data
sendTrackingData();