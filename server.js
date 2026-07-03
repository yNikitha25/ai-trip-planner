const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5000);
const MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");

const AI_TRIP_PLANNER_SYSTEM_PROMPT = `You are AI Trip Planner, a professional AI travel assistant. Your purpose is to help users plan complete trips with accurate, personalized, and well-organized travel information.

Your Responsibilities:
- Understand the user's request before responding.
- If important information is missing, ask follow-up questions instead of guessing.
- Generate realistic travel plans.
- Keep all dashboard sections synchronized with the current trip.
- Remember the currently active trip during the conversation.

Information to collect before planning:
- Destination
- Budget
- Number of days
- Number of travelers
- Travel dates or season
- Interests such as Adventure, Beaches, Mountains, Historical, Food, Shopping, Nature, Wildlife, etc.
- Hotel preference such as Luxury, Budget, or Standard
- Transportation preference such as Flight, Train, Bus, or Car

If necessary details are missing, ask politely. Example:
"I can help you plan your trip. Could you tell me your destination, budget, number of days, and number of travelers?"

Conversation Rules:
- Answer only travel-related questions.
- Be friendly, professional, and concise.
- Never make up impossible information.
- If the user changes destination, forget the old destination and regenerate everything.
- If the user changes the budget, update all related calculations.
- If the user changes the number of days, regenerate the itinerary and budget.
- Never mix information from two different trips.

For complete trip requests, always include:
1. Trip Summary
2. Destination
3. Duration
4. Budget Breakdown
5. Day-wise Itinerary
6. Hotel Recommendations
7. Tourist Attractions
8. Local Food
9. Weather Overview
10. Packing List
11. Local Transportation
12. Travel Tips
13. Nearby Attractions

Use clear headings and bullet points.

Dashboard Synchronization:
After generating a trip, create data for Dashboard, Destinations, Hotels, Attractions, Weather, Budget, Packing List, Food, Itinerary, and Travel Tips.
Each section must correspond to the same destination.
Example: Destination Goa means Hotels are Goa hotels, Food is Goan cuisine, Weather is Goa weather, Packing is suitable for Goa, Attractions are Goa attractions, and Budget is Goa costs.
Never display information from another destination.

Follow-up Questions:
- If the user asks "Show hotels", show only hotels for the current trip.
- If the user asks "Show food", show only local food for the current destination.
- If the user asks "Weather", show only weather for the current destination.
- If there is no active trip, ask: "Which destination would you like to explore?"

Response Style:
- Always use headings.
- Use bullet points.
- Keep responses readable.
- Avoid unnecessary paragraphs.
- Use realistic estimates for costs.
- Mention if prices are approximate.

Error Handling:
If you do not know an answer, say so honestly and offer the closest helpful alternative. Do not invent facts.

End every complete trip with exactly this sentence:
"Would you like to update the budget, change the destination, view hotels, explore attractions, check the weather, or save this trip?"`;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const destinationGuides = [
  {
    keys: ["goa"],
    type: "beach nightlife",
    attractions: ["Baga and Calangute beaches", "Fort Aguada", "Anjuna flea market", "Dudhsagar Falls", "Mandovi sunset cruise"],
    food: ["Goan fish curry", "prawn balchao", "bebinca", "poi with xacuti"],
    packing: ["sunscreen", "swimwear", "flip-flops", "light cotton clothes", "sunglasses"],
    bestTime: "November to February is best for beaches, parties, and water sports.",
    budgetSplit: { travel: 25, stay: 30, food: 18, activities: 22, buffer: 5 }
  },
  {
    keys: ["manali"],
    type: "mountain adventure",
    attractions: ["Solang Valley", "Hadimba Temple", "Old Manali cafes", "Atal Tunnel or Sissu", "Mall Road"],
    food: ["siddu", "trout fish", "momos", "thukpa", "hot chocolate in Old Manali"],
    packing: ["warm jacket", "woollen socks", "trek shoes", "moisturizer", "motion sickness tablets"],
    bestTime: "March to June is best for sightseeing; December to February is best for snow.",
    budgetSplit: { travel: 32, stay: 26, food: 16, activities: 16, buffer: 10 }
  },
  {
    keys: ["kerala", "alleppey", "alappuzha", "kochi", "cochin", "munnar", "wayanad"],
    type: "backwaters and greenery",
    attractions: ["Alleppey houseboat", "Munnar tea gardens", "Fort Kochi", "spice plantation", "Kathakali show"],
    food: ["Kerala sadya", "appam with stew", "puttu kadala", "banana chips", "Malabar seafood"],
    packing: ["umbrella", "mosquito repellent", "light cotton clothes", "comfortable sandals", "sunscreen"],
    bestTime: "October to March is comfortable; monsoon is lush but needs rain planning.",
    budgetSplit: { travel: 24, stay: 32, food: 18, activities: 18, buffer: 8 }
  },
  {
    keys: ["jaipur"],
    type: "royal heritage",
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Johari Bazaar"],
    food: ["dal baati churma", "pyaz kachori", "laal maas", "lassi", "ghewar"],
    packing: ["walking shoes", "hat", "sunscreen", "water bottle", "modest clothes for forts and temples"],
    bestTime: "October to March is best because afternoons are cooler for fort visits.",
    budgetSplit: { travel: 24, stay: 30, food: 20, activities: 18, buffer: 8 }
  },
  {
    keys: ["dubai"],
    type: "modern city and desert",
    attractions: ["Burj Khalifa", "Dubai Mall fountain show", "desert safari", "Dubai Marina", "Gold Souk"],
    food: ["shawarma", "mandi", "luqaimat", "Arabic mezze", "karak chai"],
    packing: ["passport copies", "light modest outfits", "comfortable shoes", "sunglasses", "universal adapter"],
    bestTime: "November to March is best; summer afternoons are very hot, so plan indoor stops.",
    budgetSplit: { travel: 30, stay: 35, food: 17, activities: 13, buffer: 5 }
  },
  {
    keys: ["paris"],
    type: "romantic culture city",
    attractions: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine river walk", "Notre-Dame area"],
    food: ["croissant", "crepes", "macarons", "French onion soup", "cheese and baguette"],
    packing: ["comfortable walking shoes", "smart casual outfits", "compact umbrella", "travel adapter", "crossbody bag"],
    bestTime: "April to June and September to October are pleasant for walking and museums.",
    budgetSplit: { travel: 28, stay: 38, food: 19, activities: 10, buffer: 5 }
  },
  {
    keys: ["tokyo"],
    type: "urban culture and food",
    attractions: ["Shibuya Crossing", "Asakusa Senso-ji", "teamLab Planets", "Harajuku", "Tokyo Skytree"],
    food: ["ramen", "sushi", "takoyaki", "convenience-store snacks", "matcha desserts"],
    packing: ["IC card/mobile wallet setup", "walking shoes", "portable charger", "translation app", "compact umbrella"],
    bestTime: "March to May and October to November are great for weather and city walks.",
    budgetSplit: { travel: 30, stay: 34, food: 18, activities: 13, buffer: 5 }
  }
];

const categoryGuides = [
  {
    match: /gokarna|pondicherry|puducherry|andaman|maldives|bali|phuket/i,
    type: "beach",
    attractions: ["main beach", "sunset viewpoint", "water activity", "local market", "old town walk"],
    food: ["seafood curry", "local snacks", "coconut-based dishes", "regional dessert"],
    packing: ["sunscreen", "sunglasses", "swimwear", "cotton clothes", "flip-flops"],
    bestTime: "Winter and early summer are usually best for beaches.",
    budgetSplit: { travel: 25, stay: 30, food: 18, activities: 22, buffer: 5 }
  },
  {
    match: /shimla|kashmir|srinagar|gulmarg|auli|darjeeling|ooty|coorg|nainital|mussoorie|ladakh|leh/i,
    type: "hill station",
    attractions: ["viewpoint", "local market", "nature trail", "mountain cafe", "adventure activity"],
    food: ["momos", "soup", "local thali", "tea at a hill cafe"],
    packing: ["warm jacket", "comfortable shoes", "woollen socks", "moisturizer", "basic medicines"],
    bestTime: "Summer is comfortable for sightseeing; winter is better for snow.",
    budgetSplit: { travel: 30, stay: 28, food: 17, activities: 15, buffer: 10 }
  }
];

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseBudget(message) {
  const lakhMatch = message.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs)\b/i);
  if (lakhMatch) return Math.round(Number(lakhMatch[1]) * 100000);

  const kMatch = message.match(/([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
  if (kMatch) return Math.round(Number(kMatch[1]) * 1000);

  const amountMatch = message.match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]{2,})(?:\s*(?:rupees|rs|inr))?/i);
  return amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;
}

function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function buildBudgetLines(totalBudget, split) {
  if (!totalBudget) {
    return `Travel: ${split.travel}%\nStay: ${split.stay}%\nFood: ${split.food}%\nActivities: ${split.activities}%\nBuffer: ${split.buffer}%`;
  }

  return [
    `Travel: ${formatINR(totalBudget * split.travel / 100)} (${split.travel}%)`,
    `Stay: ${formatINR(totalBudget * split.stay / 100)} (${split.stay}%)`,
    `Food: ${formatINR(totalBudget * split.food / 100)} (${split.food}%)`,
    `Activities: ${formatINR(totalBudget * split.activities / 100)} (${split.activities}%)`,
    `Buffer: ${formatINR(totalBudget * split.buffer / 100)} (${split.buffer}%)`
  ].join("\n");
}
function extractTripDetails(message) {
  const daysMatch = message.match(/(\d+)\s*-?\s*(?:day|days|d)\b/i);
  const budgetValue = parseBudget(message);
  const destinationMatch = message.match(/(?:to|for|in|visit|trip\s+to)\s+([a-zA-Z][a-zA-Z\s.-]{1,40})(?=\s+(?:under|within|for|in|with|during|from|and|$)|[,.!?]|$)/i);

  return {
    destination: destinationMatch ? destinationMatch[1].trim() : "your selected destination",
    days: daysMatch ? Number(daysMatch[1]) : 3,
    budget: budgetValue ? formatINR(budgetValue) : "your budget",
    budgetValue
  };
}

function profileForDestination(destination) {
  const name = destination.toLowerCase();
  const exactGuide = destinationGuides.find(guide => guide.keys.some(key => name.includes(key)));
  if (exactGuide) return exactGuide;

  return categoryGuides.find(profile => profile.match.test(destination)) || {
    type: "custom trip",
    attractions: [`top-rated landmark in ${destination}`, `local market in ${destination}`, `popular viewpoint or cultural stop`, `well-reviewed food street`, `relaxed evening area`],
    food: ["local speciality", "street food", "regional meal", "popular dessert"],
    packing: ["comfortable shoes", "charger", "ID proof", "medicines", "weather-suitable clothes"],
    bestTime: `Check ${destination} weather before booking and keep one flexible slot for delays or rest.`,
    budgetSplit: { travel: 26, stay: 30, food: 18, activities: 18, buffer: 8 }
  };
}

function isSectionOnlyRequest(message) {
  return /\b(hotel|hotels|food|weather|attraction|attractions|packing|budget|transport|nearby|tips)\b/i.test(message) && !/\b(plan|itinerary|trip)\b/i.test(message);
}

function missingTripDetails(message) {
  const details = extractTripDetails(message);
  const missing = [];
  if (details.destination === "your selected destination") missing.push("destination");
  if (!/(\d+)\s*-?\s*(?:day|days|d)\b/i.test(message)) missing.push("number of days");
  if (!details.budgetValue) missing.push("budget");
  return missing;
}

function buildMissingDetailsReply(message) {
  const missing = missingTripDetails(message);
  if (missing.length === 0 || isSectionOnlyRequest(message)) return null;

  return `Sure, I can plan that for you. Please share the missing detail${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.\n\nExample: Plan a 5-day trip to Goa under ₹30,000 for 2 people.`;
}

function buildFallbackPlan(message) {
  const missingReply = buildMissingDetailsReply(message);
  if (missingReply) return missingReply;

  const { destination, days, budget, budgetValue } = extractTripDetails(message);
  const profile = profileForDestination(destination);
  const dayCount = Math.min(days, 10);
  const split = profile.budgetSplit;
  const budgetLines = buildBudgetLines(budgetValue, split);
  const hotelBudget = budgetValue ? budgetValue * split.stay / 100 : 9000;
  const perNight = Math.max(1200, Math.round(hotelBudget / Math.max(days - 1, 1)));
  const dayLines = Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const attraction = profile.attractions[index % profile.attractions.length];
    const food = profile.food[index % profile.food.length];
    return `Day ${day}:\n- Morning: Start with ${attraction}.\n- Afternoon: Try ${food} and visit a nearby local area.\n- Evening: Relax, shop, or enjoy a scenic walk/night view.`;
  }).join("\n\n");

  return `🌍 Destination:\n${destination}\n\n📅 Duration:\n${days} Days\n\n📝 Trip Overview:\nA ${profile.type} focused trip covering local attractions, food, practical transport, packing, and budget planning for ${destination}.\n\n💰 Budget Breakdown:\n${budgetLines}\nTotal Estimated Cost: ${budget}\n\n🗓️ Day-wise Itinerary:\n${dayLines}\n\n🏨 Hotel Recommendations:\n- Name: Budget Comfort Stay\n  Approximate Price per Night: ${formatINR(perNight)}\n  Rating: 4.1/5\n  Location: Central / main tourist area\n  Suitable For: Budget travelers\n- Name: City View / Local Boutique Hotel\n  Approximate Price per Night: ${formatINR(perNight + 900)}\n  Rating: 4.3/5\n  Location: Near popular attractions\n  Suitable For: Couples and families\n- Name: Premium Leisure Resort\n  Approximate Price per Night: ${formatINR(perNight + 1800)}\n  Rating: 4.5/5\n  Location: Scenic or quieter area\n  Suitable For: Comfort-focused travelers\n\n📍 Top Attractions:\n${profile.attractions.map(item => `- ${item}`).join("\n")}\n\n🍴 Local Food:\n${profile.food.map(item => `- ${item}`).join("\n")}\n\n🎒 Packing Essentials:\n${profile.packing.map(item => `- ${item}`).join("\n")}\n\n🌦️ Weather:\n${profile.bestTime}\n\n🚕 Local Transportation:\n- Cab / taxi for comfort\n- Local bus or metro where available\n- Rental bike/scooter if safe and permitted\n- Walking for markets and compact tourist areas\n\n💡 Travel Tips:\n- Best time to visit: ${profile.bestTime}\n- Safety: Keep ID, phone, and cash secure in crowded areas.\n- Local language: Use English/Hindi or the common local language where applicable.\n- Currency: Indian Rupee for Indian destinations; verify currency for international trips.\n- Emergency number: 112 in India; verify local emergency numbers abroad.\n- Avoid: Overpaying without checking prices and booking non-refundable stays without verifying reviews.\n\n🎯 Nearby Attractions:\n${profile.attractions.slice(1, 4).map(item => `- ${item}`).join("\n")}\n\nWould you like to update the budget, change the destination, view hotels, explore attractions, check the weather, or save this trip?`;
}
async function handleChat(req, res) {
  let message = "";

  try {
    const rawBody = await readRequestBody(req);
    const payload = JSON.parse(rawBody || "{}");
    message = String(payload.message || "").trim();

    if (!message) {
      sendJson(res, 400, { error: "Please enter a travel question." });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content: AI_TRIP_PLANNER_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    clearTimeout(timeout);

    if (!ollamaResponse.ok) {
      const text = await ollamaResponse.text();
      sendJson(res, 200, {
        model: "built-in-fallback",
        reply: buildFallbackPlan(message),
        detail: text
      });
      return;
    }

    const data = await ollamaResponse.json();
    sendJson(res, 200, {
      model: MODEL,
      reply: data.message && data.message.content ? data.message.content : buildFallbackPlan(message)
    });
  } catch (error) {
    sendJson(res, 200, {
      model: "built-in-fallback",
      reply: buildFallbackPlan(message),
      detail: error.message
    });
  }
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    handleChat(req, res);
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Trip Planner dashboard running at http://localhost:${PORT}`);
  console.log(`Using Ollama model: ${MODEL}`);
});








