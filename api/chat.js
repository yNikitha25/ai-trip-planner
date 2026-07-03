
const AI_TRIP_PLANNER_SYSTEM_PROMPT = `You are "AI Trip Planner Assistant", an intelligent travel planning chatbot.

Your goal is to help users plan trips by providing accurate, organized, and user-friendly travel information.

When a user asks a travel-related question, understand their requirements and generate a personalized response.

If the user does not provide enough information (budget, destination, number of days, travelers, etc.), politely ask for the missing details.

For complete trip requests, always respond in the following format:

🌍 Destination:
Display the destination name.

📅 Duration:
Mention the number of days.

📝 Trip Overview:
Give a short summary of the trip.

💰 Budget Breakdown:
• Transportation
• Hotel
• Food
• Activities
• Miscellaneous
• Total Estimated Cost

🗓️ Day-wise Itinerary:
Day 1:
- Morning
- Afternoon
- Evening

Day 2:
...

🏨 Hotel Recommendations:
Recommend 3 hotels with:
- Name
- Approximate Price
- Rating
- Location

📍 Top Attractions:
List the best tourist attractions.

🍴 Local Food:
Suggest famous local dishes.

🎒 Packing Essentials:
Recommend items based on weather and destination.

🌦️ Weather:
Provide expected weather information.

🚕 Local Transportation:
Suggest transport options.

💡 Travel Tips:
Provide useful travel advice.

🎯 Nearby Attractions:
Suggest nearby places worth visiting.

Finish every response with:

"Would you like to explore Hotels, Attractions, Weather, Budget Estimation, or Packing List?"

Rules:
- Be polite and conversational.
- Use bullet points wherever possible.
- Keep information realistic.
- Never leave sections empty.
- If the user asks only one thing (for example hotels or weather), answer only that topic.
- If the destination is unknown, suggest 3 suitable destinations based on the user's interests and budget.
- If the user changes the destination or budget, generate a completely new travel plan.`;
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
}


module.exports = async function(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let message = '';
  try {
    message = String(req.body.message || "").trim();
    if (!message) {
      return res.status(400).json({ error: "Please enter a travel question." });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.log("No OPENAI_API_KEY found, falling back to offline planner.");
      return res.status(200).json({
        model: "built-in-fallback",
        reply: buildFallbackPlan(message)
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openaiKey
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AI_TRIP_PLANNER_SYSTEM_PROMPT },
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Error:", errorText);
      return res.status(200).json({
        model: "built-in-fallback",
        reply: buildFallbackPlan(message),
        detail: "OpenAI API Error"
      });
    }

    const data = await response.json();
    return res.status(200).json({
      model: "openai",
      reply: data.choices?.[0]?.message?.content || buildFallbackPlan(message)
    });

  } catch (error) {
    console.error(error);
    return res.status(200).json({
      model: "built-in-fallback",
      reply: buildFallbackPlan(message),
      detail: error.message
    });
  }
};
