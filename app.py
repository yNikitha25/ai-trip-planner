import json
import os
import re
import urllib.error
import urllib.request
from html import escape

import streamlit as st


OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")

QUESTIONS = [
    {
        "key": "places",
        "label": "Places",
        "question": "Which place or places do you want to visit?",
        "placeholder": "Example: Goa, Manali, Kerala",
    },
    {
        "key": "budget",
        "label": "Budget",
        "question": "What is your total budget for the trip? Please mention the amount in INR.",
        "placeholder": "Example: ₹30,000",
    },
    {
        "key": "days",
        "label": "Number of days",
        "question": "How many days do you want to travel?",
        "placeholder": "Example: 5 days",
    },
    {
        "key": "interests",
        "label": "Interests",
        "question": "What are your interests?",
        "placeholder": "Example: beaches, food, adventure, shopping",
    },
    {
        "key": "season",
        "label": "Season",
        "question": "Which season or month are you planning to travel in?",
        "placeholder": "Example: December, summer, monsoon",
    },
    {
        "key": "people",
        "label": "Number of people",
        "question": "How many people are going on this trip?",
        "placeholder": "Example: 2 adults",
    },
]


def setup_page() -> None:
    st.set_page_config(
        page_title="AI Trip Planner",
        page_icon="AI",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    st.markdown(
        """
        <style>
        :root {
            --blue: #075ee8;
            --ink: #0d1633;
            --muted: #697386;
            --line: #dfe7f3;
            --soft: #f6f9ff;
        }

        .stApp {
            background: #ffffff;
            color: var(--ink);
        }

        [data-testid="stHeader"] {
            display: none;
        }

        [data-testid="stAppViewContainer"] > .main .block-container {
            max-width: none;
            padding: 0 2rem 1.2rem;
        }

        [data-testid="stSidebar"] {
            background: linear-gradient(180deg, #fbfdff 0%, #f0f7ff 100%);
            border-right: 1px solid var(--line);
            min-width: 315px;
        }

        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
            margin-bottom: 0;
        }

        .brand {
            display: flex;
            gap: 12px;
            align-items: center;
            margin: 18px 0 28px;
        }

        .brand-icon {
            display: grid;
            width: 54px;
            height: 54px;
            place-items: center;
            border-radius: 18px;
            background: #ddecff;
            font-size: 30px;
        }

        .brand-title {
            color: #0846b8;
            font-size: 28px;
            font-weight: 800;
            line-height: 1;
        }

        .brand-subtitle {
            color: #182138;
            font-size: 15px;
            margin-top: 6px;
        }

        .nav-item {
            display: flex;
            gap: 14px;
            align-items: center;
            padding: 13px 14px;
            border-radius: 8px;
            color: #0f172a;
            font-size: 17px;
            margin: 5px 0;
        }

        .nav-item.active {
            background: #ddebff;
            color: #0047bc;
            font-weight: 700;
        }

        [data-testid="stSidebar"] .stButton > button {
            width: 100%;
            justify-content: flex-start;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #0f172a;
            font-size: 16px;
            font-weight: 500;
            padding: 0.78rem 0.85rem;
            margin: 0.12rem 0;
        }

        [data-testid="stSidebar"] .stButton > button:hover {
            background: #ddebff;
            color: #0047bc;
        }

        .help-card {
            margin-top: 28px;
            padding: 14px;
            border: 1px solid #cfe1ff;
            border-radius: 8px;
            background: #f2f7ff;
        }

        .travel-art {
            margin: 20px 0;
            text-align: center;
            font-size: 58px;
            line-height: 1.1;
        }

        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 88px;
            padding: 0 2px;
            border-bottom: 1px solid var(--line);
            margin-bottom: 28px;
        }

        .page-title {
            display: flex;
            align-items: center;
            gap: 18px;
            font-size: 28px;
            font-weight: 800;
        }

        .user-chip {
            display: flex;
            align-items: center;
            gap: 16px;
            color: #0f172a;
            font-size: 16px;
        }

        .chat-shell {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: #ffffff;
            min-height: calc(100vh - 7.35rem);
            box-shadow: 0 18px 60px rgba(30, 58, 138, 0.08);
            overflow: hidden;
        }

        .assistant-head {
            text-align: center;
            padding: 20px 24px 18px;
            border-bottom: 1px solid var(--line);
        }

        .assistant-title {
            font-size: 24px;
            font-weight: 800;
            margin-top: 6px;
        }

        .assistant-subtitle {
            color: #26324d;
            font-size: 16px;
            margin-top: 8px;
        }

        .summary-grid {
            display: none;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            padding: 18px 20px 0;
        }

        .summary-pill {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--soft);
            padding: 10px 12px;
            color: #334155;
            font-size: 14px;
            min-height: 42px;
            overflow-wrap: anywhere;
        }

        .chat-area {
            min-height: 575px;
            padding: 20px 24px 10px;
        }

        .content-card {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 18px 60px rgba(30, 58, 138, 0.08);
            padding: 28px;
            min-height: calc(100vh - 8.5rem);
        }

        .chat-row {
            display: flex;
            gap: 14px;
            margin: 20px 0;
            align-items: flex-start;
        }

        .chat-row.user-row {
            justify-content: flex-end;
        }

        .avatar {
            display: grid;
            place-items: center;
            flex: 0 0 46px;
            width: 46px;
            height: 46px;
            border-radius: 999px;
            background: #e9f2ff;
            color: #075ee8;
            border: 1px solid #d4e5ff;
            font-size: 22px;
        }

        .chat-bubble {
            max-width: min(820px, 82%);
            border-radius: 8px;
            font-size: 16px;
            line-height: 1.55;
        }

        .user-bubble {
            color: white;
            padding: 18px 22px;
            background: linear-gradient(135deg, #075ee8, #0078ff);
            box-shadow: 0 10px 28px rgba(7, 94, 232, 0.22);
        }

        .assistant-bubble {
            padding: 20px 24px;
            background: #fbfdff;
            border: 1px solid var(--line);
            box-shadow: 0 14px 45px rgba(30, 58, 138, 0.09);
        }

        .assistant-bubble ul {
            margin: 6px 0 16px 1.1rem;
            padding: 0;
        }

        .assistant-bubble li {
            margin: 4px 0;
        }

        .response-heading {
            margin: 14px 0 8px;
            font-weight: 800;
            color: #101935;
        }

        .bubble-time {
            margin-top: 8px;
            color: #8a94a6;
            font-size: 13px;
        }

        .stButton > button {
            border-radius: 8px;
            border: 1px solid #b8d0ff;
            color: #075ee8;
            background: #ffffff;
            font-weight: 600;
        }

        .stButton > button:hover {
            border-color: #075ee8;
            color: #075ee8;
        }

        .stTextInput input {
            border-radius: 999px;
            min-height: 58px;
            border: 1px solid var(--line);
            padding-left: 18px;
            font-size: 16px;
        }

        [data-testid="stForm"] {
            border: 0;
            padding: 20px 0 0;
            border-top: 1px solid var(--line);
        }

        @media (max-width: 900px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            .topbar {
                align-items: flex-start;
                flex-direction: column;
                gap: 12px;
            }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def reset_trip() -> None:
    st.session_state.answers = {}
    st.session_state.question_index = 0
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hi, I will ask a few questions first, then I will create your trip plan.",
        },
        {"role": "assistant", "content": QUESTIONS[0]["question"]},
    ]
    st.session_state.completed = False


def ensure_state() -> None:
    if "messages" not in st.session_state:
        reset_trip()
    if "active_page" not in st.session_state:
        st.session_state.active_page = "Dashboard"


def sidebar() -> None:
    with st.sidebar:
        st.markdown(
            """
            <div class="brand">
                <div class="brand-icon">🌴</div>
                <div>
                    <div class="brand-title">AI Trip Planner</div>
                    <div class="brand-subtitle">Plan Smarter. Travel Better.</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        nav_items = [
            ("🏠", "Dashboard"),
            ("📍", "Destinations"),
            ("🗓️", "Itinerary Planner"),
            ("💵", "Budget Estimator"),
            ("🏨", "Hotels"),
            ("📷", "Attractions"),
            ("⛅", "Weather"),
            ("🧳", "Packing List"),
            ("🍽️", "Food"),
            ("💡", "Travel Tips"),
            ("👤", "Profile"),
        ]
        for icon, label in nav_items:
            prefix = "● " if st.session_state.active_page == label else ""
            if st.button(f"{prefix}{icon}  {label}", key=f"nav_{label}", use_container_width=True):
                st.session_state.active_page = label
                st.rerun()
        st.markdown('<div class="travel-art">🧳<br><span style="font-size: 42px;">🗺️</span></div>', unsafe_allow_html=True)
        st.markdown(
            """
            <div class="help-card">
                <strong>Need Help?</strong><br>
                <span>Ask our AI assistant anytime.</span>
            </div>
            """,
            unsafe_allow_html=True,
        )


def topbar() -> None:
    page_title = st.session_state.get("active_page", "Dashboard")
    st.markdown(
        f"""
        <div class="topbar">
            <div class="page-title"><span>☰</span><span>{page_title}</span></div>
            <div class="user-chip"><span style="font-size: 30px;">☀️</span><span style="font-size: 34px;">👤</span><span>Hello, Traveler!</span><span>⌄</span></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def summary_grid() -> None:
    answers = st.session_state.answers
    cards = []
    for item in QUESTIONS:
        value = answers.get(item["key"], "pending")
        cards.append(f'<div class="summary-pill"><strong>{item["label"]}:</strong> {value}</div>')
    st.markdown(f'<div class="summary-grid">{"".join(cards)}</div>', unsafe_allow_html=True)


def call_trip_model(prompt: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an India trip planning assistant. The user's trip details are already "
                    "collected: places, budget, number of days, interests, season, and number of people. "
                    "Reply like a polished dashboard chatbot card. Always include these sections in this "
                    "order with bold headings: Great choice opening, Overview, Itinerary, Budget Breakdown, "
                    "Hotel Suggestions, Must Try Food, Packing Essentials, Season Notes, and a helpful "
                    "follow-up question. Keep it complete, practical, and easy to scan."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }
    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8"))
        return data.get("message", {}).get("content", "I could not generate a trip plan.")


def number_from_text(text: str, default: int) -> int:
    match = re.search(r"\d+", text.replace(",", ""))
    return int(match.group(0)) if match else default


def budget_breakdown(total_budget: int) -> dict[str, int]:
    return {
        "Travel": round(total_budget * 0.20),
        "Hotel": round(total_budget * 0.32),
        "Food": round(total_budget * 0.18),
        "Activities": round(total_budget * 0.20),
        "Remaining": round(total_budget * 0.10),
    }


def day_plan(destination: str, interests: str, days: int) -> list[str]:
    templates = [
        f"Arrival, hotel check-in, relaxed local sightseeing in {destination}, and dinner at a popular local restaurant.",
        f"Main attractions based on your interests: {interests}. Add photo stops and local markets.",
        "Adventure, nature, beaches, viewpoints, museums, or cultural places depending on the destination.",
        "Food trail, shopping, nearby hidden spots, and a relaxed evening experience.",
        "Short morning visit, packing, checkout, local food, and departure.",
    ]
    plan = []
    for index in range(days):
        item = templates[index] if index < len(templates) else "Flexible day for nearby attractions, rest, cafes, and shopping."
        plan.append(f"**Day {index + 1}:** {item}")
    return plan


def local_fallback_plan() -> str:
    answers = st.session_state.answers
    destination = answers.get("places", "your selected destination")
    budget_text = answers.get("budget", "30000")
    days_text = answers.get("days", "5")
    interests = answers.get("interests", "sightseeing, food, and relaxation")
    season = answers.get("season", "your selected season")
    people = answers.get("people", "your group")
    days = max(1, min(number_from_text(days_text, 5), 14))
    total_budget = max(number_from_text(budget_text, 30000), 1000)
    split = budget_breakdown(total_budget)
    itinerary = "\n".join(f"- {item}" for item in day_plan(destination, interests, days))

    return f"""
Great choice! Here is your complete trip plan for **{destination}**.

**Overview**
- **Destination:** {destination}
- **Duration:** {days_text}
- **Total Budget:** {budget_text}
- **Travelers:** {people}
- **Interests:** {interests}
- **Season:** {season}

**Itinerary**
{itinerary}

**Budget Breakdown**
- Travel: ₹{split["Travel"]:,}
- Hotel: ₹{split["Hotel"]:,}
- Food: ₹{split["Food"]:,}
- Activities: ₹{split["Activities"]:,}
- Remaining / buffer: ₹{split["Remaining"]:,}

**Hotel Suggestions**
- Budget: clean guesthouses, hostels, or homestays near the main area.
- Mid-range: 3-star hotels with breakfast and easy transport access.
- Comfort: resorts or boutique stays if the group wants a relaxed experience.
- Please verify live prices and availability before booking.

**Must Try Food**
- Try the destination's local thali or regional meal.
- Add street snacks, popular sweets, and one highly rated local restaurant.
- Keep one flexible meal for a food market or cafe recommended by locals.

**Packing Essentials**
- Comfortable walking shoes, ID proof, medicines, charger, power bank, sunscreen, sunglasses, and reusable water bottle.
- Pack clothes based on **{season}** and carry one light jacket for early mornings or night travel.

**Season Notes**
- Since you are planning in **{season}**, check local weather 2 to 3 days before departure.
- Keep transport time flexible if there is rain, snow, festival traffic, or weekend crowding.

Would you like hotel recommendations or nearby attractions for **{destination}**?
"""


def trip_context() -> dict[str, str]:
    answers = st.session_state.answers
    return {
        "destination": answers.get("places", "your selected destination"),
        "budget": answers.get("budget", "your budget"),
        "days": answers.get("days", "your trip duration"),
        "interests": answers.get("interests", "your interests"),
        "season": answers.get("season", "your travel season"),
        "people": answers.get("people", "your group"),
    }


def action_response(action: str) -> str:
    context = trip_context()
    destination = context["destination"]
    budget = context["budget"]
    season = context["season"]
    interests = context["interests"]
    days = context["days"]
    total_budget = max(number_from_text(budget, 30000), 1000)
    split = budget_breakdown(total_budget)

    responses = {
        "Hotels": f"""
**Hotel Recommendations for {destination}**
- **Budget:** hostels, homestays, or guesthouses near the main market / transport area.
- **Mid-range:** 3-star hotels with breakfast, good reviews, and easy cab access.
- **Comfort:** boutique resorts or premium stays if you want a relaxed experience.
- For **{budget}**, keep around ₹{split["Hotel"]:,} for stay.
- Check live prices, cancellation policy, distance from attractions, and recent reviews before booking.
""",
        "Attractions": f"""
**Top Attractions for {destination}**
- Start with the most famous landmark or viewpoint on Day 1.
- Add experiences that match your interests: **{interests}**.
- Keep one local market, sunset point, food street, or cultural spot in the evening.
- For a **{days}** trip, avoid overloading every day. Keep travel time and rest breaks.
""",
        "Weather": f"""
**Weather Guidance for {destination}**
- Planned season/month: **{season}**.
- Carry clothes suitable for that season and check the forecast 2 to 3 days before leaving.
- If it is monsoon, carry rain protection and keep backup indoor options.
- If it is winter or a hill station, pack layers, jacket, socks, and moisturizer.
""",
        "Budget": f"""
**Budget Estimation**
- Total budget: **{budget}**
- Travel: ₹{split["Travel"]:,}
- Hotel: ₹{split["Hotel"]:,}
- Food: ₹{split["Food"]:,}
- Activities: ₹{split["Activities"]:,}
- Buffer / shopping: ₹{split["Remaining"]:,}

Tip: Book transport and stay early, then keep daily food and activity limits.
""",
        "Packing": f"""
**Packing List for {destination}**
- ID proof, tickets, wallet, medicines, charger, power bank, and reusable water bottle.
- Comfortable walking shoes and weather-appropriate clothes for **{season}**.
- Sunscreen, sunglasses, cap, toiletries, sanitizer, and small first-aid kit.
- Pack light but keep one extra outfit for delays or weather changes.
""",
        "Food": f"""
**Food Recommendations for {destination}**
- Try the local thali or regional meal first.
- Add street snacks, sweets, and one famous local drink.
- Choose restaurants near your sightseeing route to save travel time.
- Keep one special dinner for a highly rated local restaurant.
""",
        "Destinations": f"""
**Destination Ideas**
- For beaches: Goa, Gokarna, Pondicherry, Andaman.
- For hills: Manali, Munnar, Ooty, Coorg, Darjeeling.
- For culture: Jaipur, Udaipur, Varanasi, Mysore, Hampi.
- Based on your current plan, **{destination}** is a good fit for **{interests}**.
""",
        "Itinerary Planner": local_fallback_plan(),
        "Budget Estimator": f"""
**Budget Estimator**
- Your entered budget: **{budget}**
- Recommended split:
  - Travel: ₹{split["Travel"]:,}
  - Hotel: ₹{split["Hotel"]:,}
  - Food: ₹{split["Food"]:,}
  - Activities: ₹{split["Activities"]:,}
  - Buffer: ₹{split["Remaining"]:,}
""",
        "Travel Tips": f"""
**Travel Tips**
- Keep digital and physical copies of ID proof.
- Book hotels near your main route to reduce transport cost.
- Start sightseeing early to avoid crowds.
- Keep one flexible half-day for delays, weather, or rest.
- Verify local rules, weather, and ticket timings before travel.
""",
        "Profile": """
**Traveler Profile**
- Name: Traveler
- Preference: Smart budget planning, practical itineraries, and local experiences.
- Tip: Complete one chat plan first so every dashboard section can personalize better.
""",
    }
    return responses.get(action, "I can help with this section after you complete your trip details.")


def markdown_to_bubble_html(text: str) -> str:
    html_parts = []
    list_open = False

    for raw_line in text.strip().splitlines():
        line = raw_line.strip()
        if not line:
            if list_open:
                html_parts.append("</ul>")
                list_open = False
            continue

        line = escape(line)
        line = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", line)

        if line.startswith("- "):
            if not list_open:
                html_parts.append("<ul>")
                list_open = True
            html_parts.append(f"<li>{line[2:]}</li>")
            continue

        if list_open:
            html_parts.append("</ul>")
            list_open = False

        if line.startswith("<strong>") and line.endswith("</strong>"):
            html_parts.append(f'<div class="response-heading">{line}</div>')
        else:
            html_parts.append(f"<p>{line}</p>")

    if list_open:
        html_parts.append("</ul>")

    return "".join(html_parts)


def render_message(message: dict[str, str]) -> None:
    role = message["role"]
    content = markdown_to_bubble_html(message["content"])

    if role == "user":
        st.markdown(
            f"""
            <div class="chat-row user-row">
                <div class="chat-bubble user-bubble">{content}<div class="bubble-time">10:30 AM ✓</div></div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    st.markdown(
        f"""
        <div class="chat-row assistant-row">
            <div class="avatar">🤖</div>
            <div class="chat-bubble assistant-bubble">{content}<div class="bubble-time">10:30 AM</div></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def answer_follow_up(user_text: str) -> str:
    context = trip_context()
    prompt = f"""
The user already created a trip plan with this context:
Destination: {context["destination"]}
Budget: {context["budget"]}
Days: {context["days"]}
Interests: {context["interests"]}
Season: {context["season"]}
People: {context["people"]}

Now answer this follow-up clearly and practically:
{user_text}
"""
    try:
        return call_trip_model(prompt)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        lowered = user_text.lower()
        if "hotel" in lowered:
            return action_response("Hotels")
        if "budget" in lowered or "cost" in lowered:
            return action_response("Budget")
        if "pack" in lowered:
            return action_response("Packing")
        if "food" in lowered:
            return action_response("Food")
        if "weather" in lowered or "season" in lowered:
            return action_response("Weather")
        if "attraction" in lowered or "place" in lowered:
            return action_response("Attractions")
        return action_response("Travel Tips")


def build_prompt() -> str:
    answers = st.session_state.answers
    return f"""
Create a practical India trip plan using these details:
Places to visit: {answers["places"]}
Budget: {answers["budget"]}
Number of days: {answers["days"]}
Interests: {answers["interests"]}
Season or month: {answers["season"]}
Number of people: {answers["people"]}

Respond with:
Start with: "Great choice! Here's your trip plan..."

Use this exact format:

**Overview**
- Destination:
- Duration:
- Total Budget:
- Travelers:
- Interests:
- Season:

**Itinerary**
- **Day 1:**
- **Day 2:**
- Continue until all days are covered.

**Budget Breakdown**
- Travel:
- Hotel:
- Food:
- Activities:
- Remaining / buffer:

**Hotel Suggestions**
- Budget:
- Mid-range:
- Luxury / comfort:

**Must Try Food**
- List 4 to 6 foods or local food experiences.

**Packing Essentials**
- List weather and destination-specific items.

**Season Notes**
- Explain what to expect in the selected season and any cautions.

End with: "Would you like hotel recommendations or nearby attractions for this trip?"
"""


def generate_trip_plan() -> None:
    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": "Thanks. I have all the details. Preparing your trip plan...",
        }
    )
    try:
        reply = call_trip_model(build_prompt())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        reply = local_fallback_plan()

    st.session_state.messages[-1] = {"role": "assistant", "content": reply}
    st.session_state.completed = True


def handle_user_message(user_text: str) -> None:
    st.session_state.messages.append({"role": "user", "content": user_text})

    if st.session_state.completed:
        st.session_state.messages.append({"role": "assistant", "content": answer_follow_up(user_text)})
        return

    current_index = st.session_state.question_index
    current_question = QUESTIONS[current_index]
    st.session_state.answers[current_question["key"]] = user_text
    st.session_state.question_index += 1

    if st.session_state.question_index < len(QUESTIONS):
        next_question = QUESTIONS[st.session_state.question_index]
        st.session_state.messages.append({"role": "assistant", "content": next_question["question"]})
    else:
        generate_trip_plan()


def chat_panel() -> None:
    st.markdown('<div class="chat-shell">', unsafe_allow_html=True)
    st.markdown(
        """
        <div class="assistant-head">
            <div style="font-size: 38px;">🤖</div>
            <div class="assistant-title">AI Trip Planner Assistant</div>
            <div class="assistant-subtitle">Answer a few questions and I will plan the perfect journey.</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    summary_grid()
    st.markdown('<div class="chat-area">', unsafe_allow_html=True)

    for message in st.session_state.messages:
        render_message(message)

    col1, col2, col3, col4, col5 = st.columns(5)
    quick_actions = [
        (col1, "Show Hotels", "Hotels"),
        (col2, "Top Attractions", "Attractions"),
        (col3, "Weather", "Weather"),
        (col4, "Budget Estimation", "Budget"),
        (col5, "Packing List", "Packing"),
    ]
    for column, button_label, action in quick_actions:
        with column:
            if st.button(button_label, use_container_width=True, key=f"quick_{action}"):
                st.session_state.messages.append({"role": "user", "content": button_label})
                st.session_state.messages.append({"role": "assistant", "content": action_response(action)})
                st.rerun()

    current = QUESTIONS[min(st.session_state.question_index, len(QUESTIONS) - 1)]
    with st.form("planner_chat_form", clear_on_submit=True):
        prompt_col, send_col = st.columns([12, 1])
        with prompt_col:
            prompt = st.text_input(
                "Travel query",
                placeholder=current["placeholder"],
                label_visibility="collapsed",
            )
        with send_col:
            submitted = st.form_submit_button("➤", use_container_width=True)

    if submitted and prompt.strip():
        handle_user_message(prompt.strip())
        st.rerun()

    if st.button("Start New Trip", use_container_width=False):
        reset_trip()
        st.rerun()

    st.caption("AI responses may not always be 100% accurate. Please verify important details.")
    st.markdown("</div></div>", unsafe_allow_html=True)


def page_panel(page: str) -> None:
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.subheader(page)

    if page == "Dashboard":
        chat_panel()
    elif page == "Destinations":
        st.markdown(action_response("Destinations"))
    elif page == "Itinerary Planner":
        if st.session_state.completed:
            st.markdown(local_fallback_plan())
        else:
            st.info("Complete the chatbot questions first, then the itinerary planner will show a full day-wise plan.")
    elif page == "Budget Estimator":
        st.markdown(action_response("Budget Estimator"))
    elif page == "Hotels":
        st.markdown(action_response("Hotels"))
    elif page == "Attractions":
        st.markdown(action_response("Attractions"))
    elif page == "Weather":
        st.markdown(action_response("Weather"))
    elif page == "Packing List":
        st.markdown(action_response("Packing"))
    elif page == "Food":
        st.markdown(action_response("Food"))
    elif page == "Travel Tips":
        st.markdown(action_response("Travel Tips"))
    elif page == "Profile":
        st.markdown(action_response("Profile"))

    if page != "Dashboard":
        st.divider()
        if st.button("Back to Dashboard", use_container_width=False):
            st.session_state.active_page = "Dashboard"
            st.rerun()
    st.markdown("</div>", unsafe_allow_html=True)


def main() -> None:
    setup_page()
    ensure_state()
    sidebar()
    topbar()
    active_page = st.session_state.get("active_page", "Dashboard")
    if active_page == "Dashboard":
        chat_panel()
    else:
        page_panel(active_page)


if __name__ == "__main__":
    main()
