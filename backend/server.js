const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// In-memory cache for fuel prices
let fuelPricesCache = [];
let lastUpdated = null;

// Belgian cities with approximate coordinates
const cityCoordinates = {
  Bruxelles: { lat: 50.8503, lng: 4.3517 },
  Antwerpen: { lat: 51.2194, lng: 4.4025 },
  Gent: { lat: 51.0543, lng: 3.7174 },
  Charleroi: { lat: 50.4108, lng: 4.4446 },
  Liège: { lat: 50.6326, lng: 5.5797 },
  Bruges: { lat: 51.2093, lng: 3.2247 },
  Namur: { lat: 50.4674, lng: 4.872 },
  Leuven: { lat: 50.8798, lng: 4.7005 },
  Mons: { lat: 50.4542, lng: 3.9566 },
  Mechelen: { lat: 51.0259, lng: 4.4775 },
};

// Function to get coordinates for a city
function getCityCoordinates(cityName) {
  // Try exact match first
  if (cityCoordinates[cityName]) {
    return cityCoordinates[cityName];
  }

  // Try partial match
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (
      cityName.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(cityName.toLowerCase())
    ) {
      return coords;
    }
  }

  // Return random coordinates near Belgium if not found
  return {
    lat: 50.8503 + (Math.random() - 0.5) * 2,
    lng: 4.3517 + (Math.random() - 0.5) * 2,
  };
}

// Scraper function
async function scrapeFuelPrices() {
  try {
    console.log("Starting to scrape fuel prices...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Navigate to the fuel prices page
    await page.goto('https://carbu.com/belgie/maximumprijs', {
      waitUntil: 'networkidle0'
    });

    // Extract fuel prices
    const fuelPrices = await page.evaluate(() => {
      const prices = [];
      const rows = document.querySelectorAll('.price_summary table tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const fuelType = cells[0]?.textContent?.trim();
          const priceText = cells[1]?.textContent?.trim();
          
          if (fuelType && priceText) {
            // Convert price from string (e.g., "1,897 €") to number
            const price = parseFloat(priceText.replace('€', '').replace(',', '.').trim());
            
            // Map to standardized fuel types
            let standardizedFuelType = fuelType;
            if (fuelType.includes('Diesel')) standardizedFuelType = 'Diesel';
            else if (fuelType.includes('95')) standardizedFuelType = 'Euro 95';
            else if (fuelType.includes('98')) standardizedFuelType = 'Euro 98';
            else if (fuelType.includes('LPG')) standardizedFuelType = 'LPG';

            // Generate prices for different stations with slight variations
            Object.entries(cityCoordinates).forEach(([city, coords]) => {
              const variation = (Math.random() - 0.5) * 0.1; // ±0.05€ variation
              prices.push({
                id: `${city}-${standardizedFuelType}`.toLowerCase(),
                stationName: `${city} Station`,
                fuelType: standardizedFuelType,
                price: +(price + variation).toFixed(3),
                lat: coords.lat,
                lng: coords.lng,
                updatedAt: new Date().toISOString()
              });
            });
          }
        }
      });
      return prices;
    });

    await browser.close();
    console.log(`Scraped ${fuelPrices.length} fuel prices`);
    
    // Update the cache
    fuelPricesCache = fuelPrices;
    lastUpdated = new Date();
    
    return fuelPrices;
  } catch (error) {
    console.error('Error scraping fuel prices:', error);
    // If scraping fails, return the cached data
    return fuelPricesCache;
  }
}

// Set up cron job to update prices every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled fuel price update');
  await scrapeFuelPrices();
});

// API endpoint to get fuel prices
app.get('/api/fuel-prices', async (req, res) => {
  try {
    // If cache is empty or older than 6 hours, fetch new data
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (!lastUpdated || lastUpdated < sixHoursAgo) {
      await scrapeFuelPrices();
    }
    res.json(fuelPricesCache);
  } catch (error) {
    console.error('Error in /api/fuel-prices:', error);
    res.status(500).json({ error: 'Failed to fetch fuel prices' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initial scraping when server starts
  scrapeFuelPrices();
});
