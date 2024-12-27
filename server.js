require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a schema and model for storing tracking data
const trackingSchema = new mongoose.Schema({
  ipAddress: String,
  cookies: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  localTime: String, // Client's local time
  timezone: String,  // Client's timezone
  businessInfo: String, // Business info from IPinfo
  domainInfo: Object // Domain info from Hunter.io
});

const TrackingData = mongoose.model('TrackingData', trackingSchema);

// Function to reverse lookup IP address using IPinfo
async function getBusinessInfo(ipAddress) {
  const ipinfoToken = process.env.IPINFO_TOKEN; // Use the token from the environment
  try {
    const response = await fetch(`https://ipinfo.io/${ipAddress}?token=${ipinfoToken}`);
    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('IPinfo data:', data);
    return data.org || 'Unknown Business';
  } catch (error) {
    console.error('Error fetching business info from IPinfo:', error);
    return 'Unknown Business';
  }
}

// Function to query Hunter.io Domain Search API
async function getDomainInfo(domain) {
  const hunterApiKey = process.env.HUNTER_API_KEY; // Hunter.io API Key
  try {
    const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterApiKey}`);
    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Hunter.io data:', data);
    return data.data || {};
  } catch (error) {
    console.error('Error fetching domain info from Hunter.io:', error);
    return {};
  }
}

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'testfile.html'));
});

// Endpoint to handle tracking data
app.post('/track', async (req, res) => {
  const data = req.body;
  console.log('Received data:', data);

  try {
    const businessInfo = await getBusinessInfo(data.ipAddress);

    // Example: Extract domain from request or use a fixed domain
    const domain = data.domain || (req.headers.referer ? new URL(req.headers.referer).hostname : 'example.com');
    const domainInfo = await getDomainInfo(domain);

    // Save the data to MongoDB
    const newTrackingData = new TrackingData({
      ...data,
      businessInfo: businessInfo,
      domainInfo: domainInfo // Save the domain info from Hunter.io
    });

    const savedData = await newTrackingData.save();
    console.log('Data saved to MongoDB:', savedData);
    res.status(200).json({ message: 'Data received and saved successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});