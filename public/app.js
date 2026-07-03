const chatForm = document.querySelector("#chatForm");
const chatWindow = document.querySelector("#chatWindow");
const messageInput = document.querySelector("#messageInput");
const statusButton = document.querySelector("#statusButton");
const suggestionButtons = document.querySelectorAll("[data-prompt]");
const navLinks = document.querySelectorAll(".nav-list a");
const assistantPanel = document.querySelector("#assistant");
const viewPanel = document.querySelector("#viewPanel");
const pageTitle = document.querySelector(".page-title h2");

let activeTrip = null;
let activeView = "dashboard";
const CHAT_TIMEOUT_MS = 8000;

const destinationGuides = [
  {
    keys: ["goa"],
    name: "Goa",
    type: "beach nightlife",
    overview: "Goa is famous for beaches, nightlife, Portuguese heritage, seafood, water sports, and relaxed coastal markets.",
    climate: "Warm tropical climate with humid afternoons and breezy evenings near the coast.",
    culture: "Portuguese-influenced coastal culture with churches, music, seafood, beach markets, and festivals.",
    languages: "Konkani, English, Hindi, Marathi",
    currency: "Indian Rupee (INR)",
    map: "West coast of India, along the Arabian Sea",
    images: ["Baga Beach", "Fort Aguada", "Dudhsagar Falls"],
    attractions: ["Baga and Calangute beaches", "Fort Aguada", "Anjuna flea market", "Dudhsagar Falls", "Mandovi sunset cruise", "Basilica of Bom Jesus"],
    food: ["Goan fish curry", "prawn balchao", "bebinca", "poi with xacuti", "vindaloo"],
    packing: ["sunscreen", "swimwear", "flip-flops", "light cotton clothes", "sunglasses"],
    bestTime: "November to February is best for beaches, parties, and water sports.",
    weather: { temp: "28-32°C", condition: "Sunny to partly cloudy", humidity: "60-75%", wind: "10-18 km/h", rain: "Low outside monsoon", outside: "Morning beaches and evening markets" },
    budgetSplit: { transportation: 25, hotel: 30, food: 18, shopping: 5, activities: 17, miscellaneous: 5 }
  },
  {
    keys: ["manali"],
    name: "Manali",
    type: "mountain adventure",
    overview: "Manali is known for Himalayan views, adventure sports, cafes, temples, valleys, and snow-season getaways.",
    climate: "Cool mountain climate; winters can be snowy and summers are pleasant.",
    culture: "Himachali mountain culture with temples, woollens, cafes, local markets, and adventure tourism.",
    languages: "Hindi, Himachali, English",
    currency: "Indian Rupee (INR)",
    map: "Kullu Valley, Himachal Pradesh, India",
    images: ["Solang Valley", "Hadimba Temple", "Old Manali"],
    attractions: ["Solang Valley", "Hadimba Temple", "Old Manali cafes", "Atal Tunnel or Sissu", "Mall Road", "Manu Temple"],
    food: ["siddu", "trout fish", "momos", "thukpa", "hot chocolate in Old Manali"],
    packing: ["warm jacket", "woollen socks", "trek shoes", "moisturizer", "motion sickness tablets"],
    bestTime: "March to June is best for sightseeing; December to February is best for snow.",
    weather: { temp: "5-18°C", condition: "Cool mountain weather", humidity: "45-65%", wind: "8-16 km/h", rain: "Moderate in monsoon, snow possible in winter", outside: "Late morning to afternoon" },
    budgetSplit: { transportation: 32, hotel: 26, food: 16, shopping: 5, activities: 11, miscellaneous: 10 }
  },
  {
    keys: ["kerala", "alleppey", "alappuzha", "kochi", "cochin", "munnar", "wayanad"],
    name: "Kerala",
    type: "backwaters and greenery",
    overview: "Kerala blends backwaters, tea gardens, beaches, spice plantations, Ayurveda, and cultural performances.",
    climate: "Tropical and humid, with lush monsoon greenery and pleasant winter travel weather.",
    culture: "Malayali culture with Kathakali, Ayurveda, temple festivals, seafood, and coconut-rich cuisine.",
    languages: "Malayalam, English, Hindi",
    currency: "Indian Rupee (INR)",
    map: "Southwestern coast of India",
    images: ["Alleppey houseboat", "Munnar tea gardens", "Fort Kochi"],
    attractions: ["Alleppey houseboat", "Munnar tea gardens", "Fort Kochi", "spice plantation", "Kathakali show", "Wayanad viewpoints"],
    food: ["Kerala sadya", "appam with stew", "puttu kadala", "banana chips", "Malabar seafood"],
    packing: ["umbrella", "mosquito repellent", "light cotton clothes", "comfortable sandals", "sunscreen"],
    bestTime: "October to March is comfortable; monsoon is lush but needs rain planning.",
    weather: { temp: "24-31°C", condition: "Humid and green", humidity: "70-85%", wind: "8-14 km/h", rain: "Moderate to high in monsoon", outside: "Morning sightseeing and evening waterfront walks" },
    budgetSplit: { transportation: 24, hotel: 32, food: 18, shopping: 5, activities: 13, miscellaneous: 8 }
  },
  {
    keys: ["jaipur"],
    name: "Jaipur",
    type: "royal heritage",
    overview: "Jaipur is famous for forts, palaces, pink sandstone architecture, bazaars, textiles, jewellery, and Rajasthani food.",
    climate: "Dry semi-arid climate with hot afternoons and cooler winter evenings.",
    culture: "Rajasthani royal culture with handicrafts, folk music, palace museums, markets, and traditional cuisine.",
    languages: "Hindi, Rajasthani, English",
    currency: "Indian Rupee (INR)",
    map: "Rajasthan, northwestern India",
    images: ["Amber Fort", "Hawa Mahal", "City Palace"],
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Johari Bazaar", "Nahargarh Fort"],
    food: ["dal baati churma", "pyaz kachori", "laal maas", "lassi", "ghewar"],
    packing: ["walking shoes", "hat", "sunscreen", "water bottle", "modest clothes for forts and temples"],
    bestTime: "October to March is best because afternoons are cooler for fort visits.",
    weather: { temp: "18-32°C", condition: "Dry and sunny", humidity: "25-45%", wind: "8-18 km/h", rain: "Low except monsoon", outside: "Morning forts and evening bazaars" },
    budgetSplit: { transportation: 24, hotel: 30, food: 20, shopping: 8, activities: 10, miscellaneous: 8 }
  },
  {
    keys: ["dubai"],
    name: "Dubai",
    type: "modern city and desert",
    overview: "Dubai combines skyscrapers, luxury malls, desert safari, marina views, beaches, souks, and global dining.",
    climate: "Hot desert climate; winter is pleasant, summer afternoons are very hot.",
    culture: "Cosmopolitan Emirati city with Islamic customs, global food, malls, souks, and desert experiences.",
    languages: "Arabic, English, Hindi widely understood",
    currency: "UAE Dirham (AED)",
    map: "United Arab Emirates, Persian Gulf coast",
    images: ["Burj Khalifa", "Dubai Marina", "Desert Safari"],
    attractions: ["Burj Khalifa", "Dubai Mall fountain show", "desert safari", "Dubai Marina", "Gold Souk", "Jumeirah Beach"],
    food: ["shawarma", "mandi", "luqaimat", "Arabic mezze", "karak chai"],
    packing: ["passport copies", "light modest outfits", "comfortable shoes", "sunglasses", "universal adapter"],
    bestTime: "November to March is best; summer afternoons are very hot, so plan indoor stops.",
    weather: { temp: "24-36°C", condition: "Sunny and dry", humidity: "45-65%", wind: "10-22 km/h", rain: "Very low", outside: "Evening outdoor activities and morning landmarks" },
    budgetSplit: { transportation: 30, hotel: 35, food: 17, shopping: 5, activities: 8, miscellaneous: 5 }
  }
];

const categoryGuides = [
  {
    match: /gokarna|pondicherry|puducherry|andaman|maldives|bali|phuket/i,
    name: "Beach Destination",
    type: "beach",
    overview: "A coastal trip focused on beaches, seafood, sunsets, and relaxed local markets.",
    climate: "Warm coastal climate with humid afternoons.",
    culture: "Coastal culture with seafood, markets, water activities, and relaxed evenings.",
    languages: "Local language, English, Hindi in tourist areas",
    currency: "Local currency",
    map: "Coastal tourist region",
    images: ["Main Beach", "Sunset View", "Local Market"],
    attractions: ["main beach", "sunset viewpoint", "water activity", "local market", "old town walk"],
    food: ["seafood curry", "local snacks", "coconut-based dishes", "regional dessert"],
    packing: ["sunscreen", "sunglasses", "swimwear", "cotton clothes", "flip-flops"],
    bestTime: "Winter and early summer are usually best for beaches.",
    weather: { temp: "27-33°C", condition: "Warm and humid", humidity: "60-80%", wind: "10-18 km/h", rain: "Depends on season", outside: "Morning and evening" },
    budgetSplit: { transportation: 25, hotel: 30, food: 18, shopping: 5, activities: 17, miscellaneous: 5 }
  },
  {
    match: /shimla|kashmir|srinagar|gulmarg|auli|darjeeling|ooty|coorg|nainital|mussoorie|ladakh|leh/i,
    name: "Hill Destination",
    type: "hill station",
    overview: "A mountain trip focused on viewpoints, local markets, cafes, nature trails, and cool weather.",
    climate: "Cooler climate with chilly mornings and evenings.",
    culture: "Hill-town culture with local markets, warm food, viewpoints, and nature activities.",
    languages: "Local language, Hindi, English in tourist areas",
    currency: "Indian Rupee (INR)",
    map: "Mountain tourism region",
    images: ["Viewpoint", "Local Market", "Nature Trail"],
    attractions: ["viewpoint", "local market", "nature trail", "mountain cafe", "adventure activity"],
    food: ["momos", "soup", "local thali", "tea at a hill cafe"],
    packing: ["warm jacket", "comfortable shoes", "woollen socks", "moisturizer", "basic medicines"],
    bestTime: "Summer is comfortable for sightseeing; winter is better for snow.",
    weather: { temp: "5-20°C", condition: "Cool mountain weather", humidity: "45-70%", wind: "8-16 km/h", rain: "Season dependent", outside: "Late morning to afternoon" },
    budgetSplit: { transportation: 30, hotel: 28, food: 17, shopping: 5, activities: 10, miscellaneous: 10 }
  }
];

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

function extractTripDetails(text) {
  const daysMatch = text.match(/(\d+)\s*-?\s*(?:day|days|d)\b/i);
  const travelersMatch = text.match(/(?:for|with)\s+(\d+)\s*(?:people|person|travelers|travellers|adults|friends|members)?/i);
  const budgetValue = parseBudget(text);
  const destinationMatch = text.match(/(?:to|for|in|visit|trip\s+to)\s+([a-zA-Z][a-zA-Z\s.-]{1,40})(?=\s+(?:under|within|for|with|during|from|and|$)|[,.!?]|$)/i);
  return {
    destination: destinationMatch ? destinationMatch[1].trim() : null,
    days: daysMatch ? Number(daysMatch[1]) : null,
    travelers: travelersMatch ? Number(travelersMatch[1]) : 1,
    budgetValue
  };
}

function guideForDestination(destination) {
  const name = (destination || "").toLowerCase();
  const exactGuide = destinationGuides.find(guide => guide.keys.some(key => name.includes(key)));
  if (exactGuide) return { ...exactGuide, name: exactGuide.name || destination };
  const categoryGuide = categoryGuides.find(guide => guide.match.test(destination || ""));
  if (categoryGuide) return { ...categoryGuide, name: destination || categoryGuide.name };
  return {
    name: destination || "Selected Destination",
    type: "custom trip",
    overview: `${destination || "This destination"} can be planned with local sightseeing, food stops, transport, packing, and budget control.` ,
    climate: "Check current weather before travel.",
    culture: "Local culture, markets, food, and major landmarks vary by area.",
    languages: "Local language and English in tourist areas",
    currency: "Local currency",
    map: `Map search: ${destination || "selected destination"}`,
    images: ["Landmark", "Market", "Food Street"],
    attractions: [`Top landmark in ${destination}`, `Local market in ${destination}`, "popular viewpoint", "cultural stop", "food street"],
    food: ["local speciality", "street food", "regional meal", "popular dessert"],
    packing: ["comfortable shoes", "charger", "ID proof", "medicines", "weather-suitable clothes"],
    bestTime: `Check ${destination} weather and tourist season before booking.`,
    weather: { temp: "Season dependent", condition: "Check live forecast", humidity: "Varies", wind: "Varies", rain: "Varies", outside: "Morning or evening" },
    budgetSplit: { transportation: 26, hotel: 30, food: 18, shopping: 5, activities: 13, miscellaneous: 8 }
  };
}

function buildBudget(trip) {
  const split = trip.guide.budgetSplit;
  const total = trip.budgetValue || 30000;
  const items = Object.entries(split).map(([key, percent]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    amount: Math.round(total * percent / 100),
    percent
  }));
  return { total, items };
}

function createTripFromText(text) {
  const details = extractTripDetails(text);
  if (!details.destination || !details.days || !details.budgetValue) return null;
  const guide = guideForDestination(details.destination);
  return {
    destination: guide.name || details.destination,
    days: details.days,
    travelers: details.travelers,
    budgetValue: details.budgetValue,
    budget: formatINR(details.budgetValue),
    guide,
    sourceText: text,
    updatedAt: new Date()
  };
}

function addUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user";
  row.innerHTML = `<div class="message user"><span class="user-text"></span><span class="message-time">${currentTime()} ✓</span></div>`;
  row.querySelector(".user-text").textContent = text;
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addBotText(text) {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.innerHTML = `<div class="message-avatar">🤖</div><div class="message bot"><p></p><span class="message-time dark">${currentTime()}</span></div>`;
  row.querySelector("p").textContent = text;
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return row;
}

function updateTripSummary() {
  // Active trip is kept in state for sidebar pages; dashboard summary boxes are intentionally hidden.
}

function setActiveTrip(trip) {
  if (!trip) return;
  activeTrip = trip;
  updateTripSummary();
  if (activeView !== "dashboard") renderView(activeView);
}

function emptyTripHtml() {
  return `<div class="empty-state"><h3>No active trip yet</h3><p>Plan a trip in Dashboard first, for example: Plan a 5-day trip to Goa under ₹30,000 for 2 people.</p></div>`;
}

function card(title, body) {
  return `<article class="detail-card"><h4>${title}</h4>${body}</article>`;
}

function list(items) {
  return `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDestinations(trip) {
  const g = trip.guide;
  const terrainLabel = g.type.includes("beach") ? "Popular Beaches" : g.type.includes("mountain") || g.type.includes("hill") ? "Popular Hills" : "Popular Cities / Areas";
  return `<div class="destination-page">
    <section class="destination-hero">
      <div>
        <span>${g.type}</span>
        <h3>${trip.destination}</h3>
        <p>${g.overview}</p>
      </div>
      <div class="map-card">
        <strong>Map Location</strong>
        <p>${g.map}</p>
      </div>
    </section>

    <div class="fact-strip">
      <div><strong>Best Time</strong><span>${g.bestTime}</span></div>
      <div><strong>Climate</strong><span>${g.climate}</span></div>
      <div><strong>Currency</strong><span>${g.currency}</span></div>
      <div><strong>Languages</strong><span>${g.languages}</span></div>
    </div>

    <div class="detail-grid two-col">
      ${card("Destination Overview", `<p>${g.overview}</p>`)}
      ${card("Local Culture", `<p>${g.culture}</p>`)}
      ${card(terrainLabel, list(g.attractions.slice(0, 4)))}
      ${card("Famous Places", list(g.attractions))}
    </div>

    <section class="destination-images" aria-label="Top destination images">
      ${g.images.map((image, index) => `<article><div>${index + 1}</div><strong>${image}</strong><span>${trip.destination}</span></article>`).join("")}
    </section>
  </div>`;
}
function sectionIntro(title, trip, copy) {
  return `<section class="section-intro"><div><span>${trip.destination}</span><h3>${title}</h3><p>${copy}</p></div><aside><strong>${trip.days} Days</strong><span>${trip.budget}</span><small>${trip.travelers} traveler(s)</small></aside></section>`;
}

function renderHotels(trip) {
  const base = Math.max(1200, Math.round((trip.budgetValue * trip.guide.budgetSplit.hotel / 100) / Math.max(trip.days - 1, 1)));
  const areas = trip.guide.attractions.slice(0, 5);
  const hotels = ["Comfort Inn", "Heritage Stay", "Central Residency", "View Point Resort", "Premium Retreat", "Family Suites"].map((name, index) => ({
    name: `${trip.destination} ${name}`,
    rating: (4.1 + Math.min(index, 4) * 0.1).toFixed(1),
    price: formatINR(base + index * 650),
    address: `Near ${areas[index % areas.length]}`,
    distance: `${(1 + index * 0.8).toFixed(1)} km from main tourist area`,
    amenities: ["Wi-Fi", "Breakfast", index % 2 ? "Travel desk" : "Parking", index % 3 ? "Room service" : "Airport pickup", "Clean rooms"],
    suitable: ["Budget travelers", "Families", "Couples", "Sightseeing trips", "Comfort stays", "Groups"][index],
    description: `A practical stay for a ${trip.guide.type} trip with easy access to ${areas[index % areas.length]}. Prices are approximate and should be verified before booking.`
  }));
  return `${sectionIntro("Hotels", trip, `Recommended stays are generated only for ${trip.destination} and recalculated from the active trip budget.`)}<div class="detail-grid">${hotels.map(hotel => card(hotel.name, `<p><strong>Rating:</strong> ${hotel.rating}/5</p><p><strong>Price Per Night:</strong> ${hotel.price}</p><p><strong>Address:</strong> ${hotel.address}</p><p><strong>Distance:</strong> ${hotel.distance}</p><p><strong>Amenities:</strong> ${hotel.amenities.join(", ")}</p><p><strong>Suitable For:</strong> ${hotel.suitable}</p><p>${hotel.description}</p>`)).join("")}</div>`;
}

function renderAttractions(trip) {
  return `${sectionIntro("Attractions", trip, `Destination-specific places to visit in ${trip.destination}, with timing, fees, and time required.`)}<div class="detail-grid">${trip.guide.attractions.map((name, index) => card(name, `<p>${name} is a recommended ${trip.destination} stop for this ${trip.guide.type} trip.</p><p><strong>Entry Fee:</strong> ${index % 2 ? "₹50-₹300 approx" : "Free / varies by activity"}</p><p><strong>Best Visiting Time:</strong> ${index < 2 ? "Morning" : index < 4 ? "Afternoon" : "Evening"}</p><p><strong>Time Required:</strong> ${index % 2 ? "1-2 hours" : "2-3 hours"}</p><p><strong>Distance from Hotel:</strong> ${2 + index * 2} km approx</p><p><strong>Tip:</strong> Keep tickets, transport, and weather in mind before finalizing the day.</p>`)).join("")}</div>`;
}

function renderFood(trip) {
  return `${sectionIntro("Food", trip, `Local dishes and approximate meal costs for ${trip.destination}.`)}<div class="detail-grid">${trip.guide.food.map((dish, index) => card(dish, `<p><strong>Description:</strong> A famous local food item to try during your ${trip.destination} trip.</p><p><strong>Type:</strong> ${/fish|prawn|trout|seafood|laal|shawarma|mandi/i.test(dish) ? "Non-Vegetarian" : "Vegetarian / varies"}</p><p><strong>Spice Level:</strong> ${index % 3 === 0 ? "Medium" : index % 3 === 1 ? "Mild" : "Spicy"}</p><p><strong>Recommended Restaurant:</strong> Well-rated local restaurant near ${trip.guide.attractions[index % trip.guide.attractions.length]}</p><p><strong>Approximate Price:</strong> ${formatINR(120 + index * 70)}</p><p><strong>Best Time:</strong> ${index % 2 ? "Lunch" : "Dinner"}</p>`)).join("")}</div>`;
}

function renderWeather(trip) {
  const w = trip.guide.weather;
  return `${sectionIntro("Weather", trip, `Expected travel weather for ${trip.destination}. Verify live forecast before departure.`)}<div class="weather-board">
    ${card("Temperature", `<p>${w.temp}</p>`)}
    ${card("Weather Condition", `<p>${w.condition}</p>`)}
    ${card("Humidity", `<p>${w.humidity}</p>`)}
    ${card("Wind Speed", `<p>${w.wind}</p>`)}
    ${card("Rain Chances", `<p>${w.rain}</p>`)}
    ${card("Best Time to Go Outside", `<p>${w.outside}</p>`)}
  </div>`;
}

function renderPacking(trip) {
  const isCold = /warm|woollen|jacket|snow|mountain|hill/i.test(trip.guide.packing.join(" ") + trip.guide.type);
  return `${sectionIntro("Packing List", trip, `Packing suggestions are based on ${trip.destination}, weather, and planned activities.`)}<div class="detail-grid two-col">
    ${card("Clothing", list(trip.guide.packing.concat([isCold ? "thermal layer" : "comfortable day outfit", "sleepwear"]))) }
    ${card("Electronics", list(["phone charger", "power bank", "camera", "adapter if needed", "offline maps downloaded"]))}
    ${card("Medicines", list(["basic first aid", "personal medicines", "motion sickness tablets", "ORS packets", "pain relief balm"]))}
    ${card("Documents", list(["ID proof", "booking confirmations", "emergency contacts", "passport/visa if international", "travel insurance if needed"]))}
    ${card("Accessories", list(["day bag", "water bottle", "sunglasses", isCold ? "gloves / cap" : "umbrella or cap", "small lock"]))}
    ${card("Activity Specific", list(trip.guide.type.includes("beach") ? ["swimwear", "waterproof pouch", "beach towel"] : trip.guide.type.includes("mountain") ? ["trek shoes", "warm socks", "light backpack"] : ["walking shoes", "shopping tote", "portable charger"]))}
  </div>`;
}

function renderBudget(trip) {
  const budget = buildBudget(trip);
  return `${sectionIntro("Budget Estimator", trip, `Budget is recalculated from the active trip amount: ${formatINR(budget.total)}.`)}<div class="budget-layout"><div class="detail-grid two-col">
    ${budget.items.map(item => card(item.label, `<p>${formatINR(item.amount)} (${item.percent}%)</p><div class="bar"><span style="width:${item.percent}%"></span></div><small>Approximate ${item.label.toLowerCase()} allowance for ${trip.destination}.</small>`)).join("")}
    ${card("Total Budget", `<p>${formatINR(budget.total)}</p><div class="pie-note">Pie chart data: ${budget.items.map(item => `${item.label} ${item.percent}%`).join(", ")}</div>`)}
  </div><aside class="budget-total"><strong>${formatINR(budget.total)}</strong><span>Total Estimated Budget</span><p>Costs are approximate and should be verified for live prices.</p></aside></div>`;
}

function renderItinerary(trip) {
  return `${sectionIntro("Itinerary", trip, `Detailed ${trip.days}-day plan for ${trip.destination}.`)}<div class="itinerary-list">${Array.from({ length: trip.days }, (_, i) => {
    const attraction = trip.guide.attractions[i % trip.guide.attractions.length];
    const second = trip.guide.attractions[(i + 1) % trip.guide.attractions.length];
    const food = trip.guide.food[i % trip.guide.food.length];
    return card(`Day ${i + 1}`, `<p><strong>Morning:</strong> Visit ${attraction}.</p><p><strong>Afternoon:</strong> Try ${food} and explore ${second}.</p><p><strong>Evening:</strong> Market, sunset, cafe, or relaxed walk.</p><p><strong>Night:</strong> Dinner near hotel and rest. Keep transport booked for the next day.</p>`);
  }).join("")}</div>`;
}

function renderTips(trip) {
  return `${sectionIntro("Travel Tips", trip, `Practical advice for a smooth ${trip.destination} trip.`)}<div class="detail-grid two-col">
    ${card("Safety Tips", list(["Keep valuables secure", "Use trusted transport", "Share itinerary with family", "Avoid isolated areas late night", "Save hotel address offline"]))}
    ${card("Emergency Numbers", `<p>India: 112. For international trips, verify the local emergency number before travel.</p>`)}
    ${card("Local Language", `<p>${trip.guide.languages}</p>`)}
    ${card("Currency", `<p>${trip.guide.currency}</p>`)}
    ${card("Transportation Tips", list(["Pre-check fares", "Use maps", "Keep offline location saved", "Use rental vehicles only where safe", "Avoid unverified agents"]))}
    ${card("Cultural Etiquette", `<p>${trip.guide.culture}</p>`)}
    ${card("Things to Avoid", list(["Unverified bookings", "Overpacking", "Ignoring weather", "Last-minute peak season travel", "Carrying too much cash"] ))}
    ${card("Best Time", `<p>${trip.guide.bestTime}</p>`)}
  </div>`;
}
function renderProfile() {
  return `<div class="detail-grid two-col">${card("Traveler Profile", `<p>Hello, Traveler!</p><p>Your active trip powers every section of this dashboard.</p>`)}${card("Current Preference", `<p>${activeTrip ? `${activeTrip.destination}, ${activeTrip.days} days, ${activeTrip.budget}` : "No active trip yet."}</p>`)}</div>`;
}

const renderers = {
  destinations: renderDestinations,
  hotels: renderHotels,
  attractions: renderAttractions,
  food: renderFood,
  weather: renderWeather,
  packing: renderPacking,
  budget: renderBudget,
  itinerary: renderItinerary,
  tips: renderTips
};

function viewName(view) {
  return ({ dashboard: "Dashboard", destinations: "Destinations", itinerary: "Itinerary Planner", budget: "Budget Estimator", hotels: "Hotels", attractions: "Attractions", weather: "Weather", packing: "Packing List", food: "Food", tips: "Travel Tips", profile: "Profile" })[view] || "Dashboard";
}

function renderView(view) {
  activeView = view;
  window.scrollTo({ top: 0, behavior: "smooth" });
  pageTitle.textContent = viewName(view);
  navLinks.forEach(link => link.classList.toggle("active", normalizeView(link.getAttribute("href")) === view));
  if (view === "dashboard") {
    assistantPanel.hidden = false;
    viewPanel.hidden = true;
    return;
  }
  assistantPanel.hidden = true;
  viewPanel.hidden = false;
  if (view === "profile") {
    viewPanel.innerHTML = `<div class="detail-heading"><h3>Profile</h3><p>Your travel profile and active trip context.</p></div>${renderProfile()}`;
    return;
  }
  if (!activeTrip) {
    viewPanel.innerHTML = emptyTripHtml();
    return;
  }
  const renderer = renderers[view];
  viewPanel.innerHTML = `<div class="detail-heading"><h3>${viewName(view)} for ${activeTrip.destination}</h3><p>Synced with active trip: ${activeTrip.days} days, ${activeTrip.budget}, ${activeTrip.travelers} traveler(s).</p></div>${renderer ? renderer(activeTrip) : emptyTripHtml()}`;
}

function normalizeView(hash) {
  const view = (hash || "#assistant").replace("#", "");
  if (view === "assistant") return "dashboard";
  return view;
}

async function sendMessage(text) {
  addUserMessage(text);
  const trip = createTripFromText(text);
  if (trip) setActiveTrip(trip);

  const loading = addBotText("Planning the best travel answer for you...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    const response = await fetch("/api/chat", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The assistant could not answer right now.");
    loading.querySelector("p").textContent = data.reply;
  } catch (error) {
    loading.querySelector("p").textContent = trip ? `Active trip updated for ${trip.destination}. Open the sidebar sections for hotels, attractions, weather, food, budget, itinerary, packing, and tips.` : "I am ready, but the chat request did not finish. Please include destination, number of days, and budget, then try again.";
  }
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  messageInput.value = "";
  sendMessage(message);
});

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    renderView(normalizeView(link.getAttribute("href")));
  });
});

suggestionButtons.forEach(button => {
  button.addEventListener("click", () => {
    const label = button.textContent.toLowerCase();
    if (label.includes("hotel")) return renderView("hotels");
    if (label.includes("attraction")) return renderView("attractions");
    if (label.includes("weather")) return renderView("weather");
    if (label.includes("budget")) return renderView("budget");
    if (label.includes("packing")) return renderView("packing");
    messageInput.value = button.dataset.prompt;
    messageInput.focus();
  });
});

statusButton.addEventListener("click", () => {
  addBotText("Every navigation section now uses the current active trip. Create a trip first, then open Destinations, Hotels, Attractions, Weather, Food, Budget, Packing List, Itinerary, or Travel Tips.");
});

addBotText("Hi! Plan a trip with destination, days, and budget. Once created, every sidebar page will update for that active trip.");
updateTripSummary();
renderView("dashboard");





