from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from groq import Groq
from dotenv import load_dotenv

import yfinance as yf
from yahooquery import search

import feedparser
import os

# =====================================
# LOAD ENV
# =====================================

load_dotenv()

# =====================================
# GROQ CLIENT
# =====================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# =====================================
# FASTAPI
# =====================================

app = FastAPI()

# =====================================
# CORS
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# MEMORY
# =====================================

conversation_history = []

# =====================================
# REQUEST MODEL
# =====================================

class Message(BaseModel):
    text: str

# =====================================
# HOME ROUTE
# =====================================

@app.get("/")
def home():

    return {
        "message": "Jarvis AI Backend Running"
    }

# =====================================
# MARKET ROUTE
# =====================================

@app.get("/market")
def market_data():

    stocks = [
        "AAPL",
        "TSLA",
        "NVDA",
        "META"
    ]

    market = []

    for ticker in stocks:

        try:

            stock = yf.Ticker(ticker)

            data = stock.history(period="2d")

            if data.empty:
                continue

            current_price = round(
                data["Close"].iloc[-1],
                2
            )

            previous_price = round(
                data["Close"].iloc[-2],
                2
            )

            change_percent = round(
                (
                    (
                        current_price - previous_price
                    ) / previous_price
                ) * 100,
                2
            )

            market.append({

                "ticker": ticker,
                "price": current_price,
                "change": change_percent

            })

        except Exception as e:

            print("MARKET ERROR:", e)

    return market

# =====================================
# NEWS ROUTE
# =====================================

@app.get("/news")
def get_news():

    headlines = []

    try:

        feed = feedparser.parse(
            "https://news.google.com/rss/search?q=stock+market"
        )

        bullish_words = [

            "surge",
            "growth",
            "profit",
            "bullish",
            "record",
            "beats",
            "upgrade"

        ]

        bearish_words = [

            "crash",
            "drop",
            "loss",
            "bearish",
            "decline",
            "risk",
            "downgrade"

        ]

        for entry in feed.entries[:10]:

            title = entry.title.lower()

            sentiment = "NEUTRAL"

            for word in bullish_words:

                if word in title:
                    sentiment = "BULLISH"

            for word in bearish_words:

                if word in title:
                    sentiment = "BEARISH"

            headlines.append({

                "title": entry.title,
                "link": entry.link,
                "sentiment": sentiment

            })

        return headlines

    except Exception as e:

        print("NEWS ERROR:", e)

        return []

# =====================================
# STOCK DATA
# =====================================

def get_stock_data(company_name):

    try:

        company_name = company_name.lower()

        stock_map = {

            # INDIA

            "tata power": "TATAPOWER.NS",
            "tata motors": "TATAMOTORS.NS",
            "tcs": "TCS.NS",
            "infosys": "INFY.NS",
            "reliance": "RELIANCE.NS",
            "hdfc": "HDFCBANK.NS",
            "sbi": "SBIN.NS",
            "adani power": "ADANIPOWER.NS",
            "zomato": "ZOMATO.NS",
            "pnb": "PNB.NS",
            "punjab national bank": "PNB.NS",

            # US

            "apple": "AAPL",
            "tesla": "TSLA",
            "nvidia": "NVDA",
            "amazon": "AMZN",
            "microsoft": "MSFT",
            "meta": "META",
            "google": "GOOGL",

            # CRYPTO

            "bitcoin": "BTC-USD",
            "ethereum": "ETH-USD"

        }

        ticker = None

        # FIND TICKER

        for key in stock_map:

            if key in company_name:

                ticker = stock_map[key]

                break

        # FALLBACK SEARCH

        if not ticker:

            result = search(company_name)

            quotes = result.get("quotes")

            if not quotes:
                return None

            ticker = quotes[0]["symbol"]

        # FETCH DATA

        stock = yf.Ticker(ticker)

        data = stock.history(period="2d")

        if data.empty or len(data) < 2:
            return None

        latest_price = round(
            data["Close"].iloc[-1],
            2
        )

        previous_close = round(
            data["Close"].iloc[-2],
            2
        )

        volume = int(
            data["Volume"].iloc[-1]
        )

        return {

            "ticker": ticker,
            "price": latest_price,
            "previous_close": previous_close,
            "volume": volume

        }

    except Exception as e:

        print("STOCK ERROR:", e)

        return None

# =====================================
# STOCK NEWS
# =====================================

def get_stock_news(company_name):

    try:

        query = company_name.replace(" ", "+")

        url = f"https://news.google.com/rss/search?q={query}+stock"

        feed = feedparser.parse(url)

        news_list = []

        for entry in feed.entries[:5]:

            news_list.append({

                "title": entry.title,
                "link": entry.link

            })

        return news_list

    except Exception as e:

        print("NEWS FETCH ERROR:", e)

        return []

# =====================================
# SENTIMENT ENGINE
# =====================================

def calculate_sentiment(stock_data, news_data):

    if not stock_data:
        return "NEUTRAL"

    score = 0

    # PRICE ACTION

    if stock_data["price"] > stock_data["previous_close"]:

        score += 2

    else:

        score -= 2

    # VOLUME

    if stock_data["volume"] > 10000000:

        score += 1

    # NEWS ANALYSIS

    bullish_words = [

        "surge",
        "growth",
        "profit",
        "beats",
        "strong",
        "bullish",
        "upgrade"

    ]

    bearish_words = [

        "drop",
        "loss",
        "weak",
        "bearish",
        "lawsuit",
        "decline",
        "risk",
        "crash"

    ]

    for news in news_data:

        title = news["title"].lower()

        for word in bullish_words:

            if word in title:
                score += 1

        for word in bearish_words:

            if word in title:
                score -= 1

    # FINAL LABEL

    if score >= 5:
        return "VERY BULLISH"

    elif score >= 2:
        return "BULLISH"

    elif score >= -1:
        return "NEUTRAL"

    elif score >= -4:
        return "BEARISH"

    else:
        return "HIGH RISK"

# =====================================
# CHAT ROUTE
# =====================================

@app.post("/chat")
def chat(message: Message):

    try:

        user_text = message.text

        conversation_history.append({

            "role": "user",
            "content": user_text

        })

        # ==========================
        # FINANCE DETECTION
        # ==========================

        finance_keywords = [

            "stock",
            "price",
            "market",
            "share",
            "crypto",
            "tesla",
            "apple",
            "nvidia",
            "bitcoin",
            "tata",
            "reliance",
            "adani",
            "pnb"

        ]

        is_finance_query = any(

            word in user_text.lower()

            for word in finance_keywords

        )

        # ==========================
        # STOCK DATA
        # ==========================

        stock_data = get_stock_data(user_text)

        print("STOCK DATA:", stock_data)

        # ==========================
        # NEWS DATA
        # ==========================

        news_data = get_stock_news(user_text)

        # ==========================
        # SENTIMENT
        # ==========================

        sentiment = calculate_sentiment(
            stock_data,
            news_data
        )

        # ==========================
        # FINANCE MODE
        # ==========================

        if is_finance_query:

            if not stock_data:

                return {
                    "reply":
                    "Unable to fetch live market data right now."
                }

            news_text = ""

            for news in news_data[:5]:

                news_text += f"• {news['title']}\n"

            risk_level = "MODERATE"

            if sentiment == "HIGH RISK":

                risk_level = "HIGH"

            elif sentiment == "VERY BULLISH":

                risk_level = "LOW"

            reply = f"""
━━━━━━━━━━━━━━━━━━━
📈 {stock_data['ticker']}
━━━━━━━━━━━━━━━━━━━

💰 Current Price:
${stock_data['price']}

📊 Previous Close:
${stock_data['previous_close']}

📦 Trading Volume:
{stock_data['volume']}

🧠 AI Sentiment:
{sentiment}

⚠ Risk Level:
{risk_level}

📰 Top Headlines:
{news_text}

📌 Market Insight:
The stock is currently showing
{sentiment.lower()} momentum
based on price action,
volume activity,
and recent market news.
"""

            return {
                "reply": reply
            }

        # ==========================
        # NORMAL CHAT MODE
        # ==========================

        completion = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role": "system",
                    "content": """
                    You are Jarvis,
                    a futuristic AI assistant.

                    Be concise,
                    intelligent,
                    and professional.
                    """
                },

                *conversation_history

            ]

        )

        reply = completion.choices[0].message.content

        return {
            "reply": reply
        }

    except Exception as e:

        print("CHAT ERROR:", e)

        return {
            "reply": f"Backend Error: {str(e)}"
        }