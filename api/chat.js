export const config = {
  runtime: 'edge',
};

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

export default async function reqHandler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const data = await req.json();
    const message = (data.message || "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Please enter a travel question." }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return new Response(JSON.stringify({
        model: "built-in-fallback",
        reply: "⚠️ Error: The OPENAI_API_KEY is missing. Please add your OpenAI API Key in your Vercel Dashboard -> Settings -> Environment Variables, and redeploy to enable the AI."
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AI_TRIP_PLANNER_SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `OpenAI API Error: ${errorText}` }), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const json = await response.json();
    return new Response(JSON.stringify({
      model: "gpt-4o-mini",
      reply: json.choices[0].message.content
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
