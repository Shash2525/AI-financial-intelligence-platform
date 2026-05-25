import { useState, useEffect, useRef } from "react"
import axios from "axios"


const API = import.meta.env.VITE_API_URL || "https://jarvis-ai-backend-ho5r.onrender.com"


function TradingViewChart({ symbol }) {
  const container = useRef()

  useEffect(() => {
    container.current.innerHTML = ""
    const script = document.createElement("script")
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      hide_top_toolbar: false,
      save_image: false,
      studies: [],
      support_host: "https://www.tradingview.com"
    })
    container.current.appendChild(script)
  }, [symbol])

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "500px", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  )
}

// MARKET TICKER
function MarketTicker() {
  const tickers = [
    { label: "AAPL", value: "+2.1%", bull: true },
    { label: "TSLA", value: "-1.2%", bull: false },
    { label: "BTC",  value: "+4.2%", bull: true },
    { label: "NIFTY", value: "+0.8%", bull: true },
    { label: "NVDA", value: "+3.5%", bull: true },
    { label: "AMZN", value: "-0.4%", bull: false },
    { label: "ETH",  value: "+2.9%", bull: true },
    { label: "META", value: "+1.3%", bull: true },
    { label: "MSFT", value: "-0.2%", bull: false },
    { label: "RELIANCE", value: "+1.1%", bull: true },
  ]

  
  const all = [...tickers, ...tickers]

  return (
    <div style={{
      overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "10px 0",
      whiteSpace: "nowrap",
    }}>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          display: inline-flex;
          animation: ticker-scroll 30s linear infinite;
        }
      `}</style>
      <div className="ticker-inner">
        {all.map((t, i) => (
          <span key={i} style={{
            marginRight: "40px",
            fontSize: "14px",
            fontWeight: "bold",
            color: t.bull ? "#22c55e" : "#ef4444",
          }}>
            {t.label} {t.value}
          </span>
        ))}
      </div>
    </div>
  )
}


function FearGreedMeter({ value = 62 }) {

  const radius = 70
  const stroke = 12
  const normalizedRadius = radius - stroke / 2
  const circumference = Math.PI * normalizedRadius
  const progress = (value / 100) * circumference

  const getLabel = (v) => {
    if (v <= 20) return { text: "Extreme Fear", color: "#ef4444" }
    if (v <= 40) return { text: "Fear",         color: "#f97316" }
    if (v <= 60) return { text: "Neutral",       color: "#eab308" }
    if (v <= 80) return { text: "Greed",         color: "#84cc16" }
    return             { text: "Extreme Greed",  color: "#22c55e" }
  }

  const { text, color } = getLabel(value)

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "24px",
      textAlign: "center",
      flex: "1",
    }}>
      <p style={{ opacity: 0.7, marginBottom: "12px", fontSize: "14px" }}>
        Fear &amp; Greed Index
      </p>
      <svg
        width={radius * 2}
        height={radius + stroke}
        viewBox={`0 0 ${radius * 2} ${radius + stroke}`}
        style={{ overflow: "visible" }}
      >
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        {/* Value text */}
        <text
          x={radius}
          y={radius - 6}
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
        >
          {value}
        </text>
      </svg>
      <p style={{ color, fontWeight: "bold", marginTop: "8px", fontSize: "16px" }}>
        {text}
      </p>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "8px",
        fontSize: "11px",
        opacity: 0.5,
      }}>
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
      </div>
    </div>
  )
}


function MarketSummary({ summary }) {
  return (
    <div style={{
      background: "rgba(56,189,248,0.08)",
      border: "1px solid rgba(56,189,248,0.25)",
      borderRadius: "16px",
      padding: "18px 22px",
      marginBottom: "28px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    }}>
      <span style={{ fontSize: "22px", marginTop: "2px" }}>📡</span>
      <div>
        <p style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "bold", marginBottom: "4px" }}>
          AI MARKET SUMMARY
        </p>
        <p style={{ opacity: 0.85, lineHeight: "1.7", fontSize: "14px" }}>
          {summary || "Fetching live market intelligence..."}
        </p>
      </div>
    </div>
  )
}

// MAIN APP
export default function App() {
  const [message, setMessage]     = useState("")
  const [chat, setChat]           = useState([])
  const [news, setNews]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [chartSymbol, setChartSymbol] = useState("NASDAQ:AAPL")
  const [dots, setDots]           = useState("")
  const [marketSummary, setMarketSummary] = useState("")

  // Refs
  const chatEndRef = useRef(null)

  // TYPING ANIMATION 
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // ====================== AUTO SCROLL CHAT ======================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  // ====================== FETCH NEWS ======================
  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`)
      setNews(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  // ====================== FETCH AI MARKET SUMMARY ======================
  const fetchMarketSummary = async () => {
    try {
      const response = await axios.get(`${API}/market-summary`)
      setMarketSummary(response.data.summary)
    } catch {
      setMarketSummary(
        "US markets bullish today led by tech rally while crude oil weakness supports Asian equities. AI sector outperforming with NVDA up 3.5%."
      )
    }
  }

  useEffect(() => {
    fetchNews()
    fetchMarketSummary()
  }, [])

  // ====================== CHART SWITCHING ======================
  const detectSymbol = (msg) => {
    const lower = msg.toLowerCase()
    if (lower.includes("tesla"))     return "NASDAQ:TSLA"
    if (lower.includes("apple"))     return "NASDAQ:AAPL"
    if (lower.includes("nvidia"))    return "NASDAQ:NVDA"
    if (lower.includes("amazon"))    return "NASDAQ:AMZN"
    if (lower.includes("meta"))      return "NASDAQ:META"
    if (lower.includes("microsoft")) return "NASDAQ:MSFT"
    if (lower.includes("bitcoin"))   return "BINANCE:BTCUSDT"
    if (lower.includes("ethereum"))  return "BINANCE:ETHUSDT"
    if (lower.includes("tata"))      return "NSE:TATAPOWER"
    if (lower.includes("reliance"))  return "NSE:RELIANCE"
    return null
  }

  // ====================== SEND MESSAGE ======================
  const sendMessage = async () => {
    if (message.trim() === "") return

    setLoading(true)

    setChat(prev => [...prev, { sender: "user", text: message }])

    const sym = detectSymbol(message)
    if (sym) setChartSymbol(sym)

    try {
      const response = await axios.post(`${API}/chat`, { text: message })
      setChat(prev => [...prev, { sender: "jarvis", text: response.data.reply }])
    } catch {
      setChat(prev => [...prev, { sender: "jarvis", text: "Backend connection failed." }])
    }

    setLoading(false)
    setMessage("")
  }

  // ====================== SIDEBAR ITEM ======================
  const SidebarItem = ({ icon, label }) => {
    const [hovered, setHovered] = useState(false)
    return (
      <p
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "10px 14px",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "background 0.3s",
          background: hovered ? "rgba(56,189,248,0.15)" : "transparent",
          marginBottom: "4px",
          userSelect: "none",
        }}
      >
        {icon} {label}
      </p>
    )
  }

  // ====================== RENDER ======================
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#020617,#0f172a,#111827)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial",
    }}>

      {/* ── MARKET TICKER ── */}
      <MarketTicker />

      <div style={{ display: "flex", flex: 1 }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: "260px",
          padding: "30px",
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <h1 style={{ color: "#38bdf8", fontSize: "34px", margin: 0 }}>
            ⚡ JARVIS AI
          </h1>

          <div style={{ marginTop: "50px", lineHeight: "1", opacity: 0.85 }}>
            <SidebarItem icon="📊" label="Dashboard" />
            <SidebarItem icon="🤖" label="AI Core" />
            <SidebarItem icon="📈" label="Market Intelligence" />
            <SidebarItem icon="📰" label="AI News Engine" />
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, padding: "35px", overflowY: "auto" }}>

          {/* HEADER */}
          <h1 style={{
            fontSize: "46px",
            fontWeight: "bold",
            lineHeight: "1.2",
            paddingBottom: "10px",
            background: "linear-gradient(90deg,#38bdf8,#a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            Welcome Back, Commander
          </h1>

          <p style={{ opacity: 0.7, marginTop: "10px", marginBottom: "30px" }}>
            AI systems online and monitoring live markets{dots}
          </p>

          {/* AI MARKET SUMMARY */}
          <MarketSummary summary={marketSummary} />

          {/* FEAR & GREED + STATS ROW */}
          <div style={{
            display: "flex",
            gap: "18px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}>
            <FearGreedMeter value={62} />

            {/* Quick stat cards */}
            <div style={{
              flex: "2",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "14px",
            }}>
              {[
                { label: "Markets Open",   value: "NYSE ✅",   color: "#22c55e" },
                { label: "Top Gainer",     value: "NVDA +3.5%", color: "#22c55e" },
                { label: "Top Loser",      value: "TSLA -1.2%", color: "#ef4444" },
                { label: "BTC Dominance",  value: "52.4%",      color: "#38bdf8" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                  <p style={{ fontSize: "12px", opacity: 0.6, margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: s.color, margin: 0 }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* NEWS CARDS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "18px",
            marginBottom: "40px",
          }}>
            {news.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(56,189,248,0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <h3 style={{ fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{
                  marginTop: "15px",
                  fontWeight: "bold",
                  margin: "15px 0 0",
                  color:
                    item.sentiment === "BULLISH" ? "#22c55e"
                    : item.sentiment === "BEARISH" ? "#ef4444"
                    : "#ffffff",
                }}>
                  {item.sentiment}
                </p>
              </div>
            ))}
          </div>

          {/* AI PANEL */}
          <div style={{
            padding: "30px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <h2 style={{ fontSize: "32px", margin: 0 }}>🤖 Jarvis AI Assistant</h2>
            <p style={{ opacity: 0.7, margin: "8px 0 30px" }}>
              Real-Time AI Market Intelligence System
            </p>

            {/* CHART */}
            <div style={{ overflow: "hidden", borderRadius: "20px", marginBottom: "30px" }}>
              <TradingViewChart symbol={chartSymbol} />
            </div>

            {/* CHAT */}
            <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
              {chat.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "15px",
                    padding: "18px",
                    borderRadius: "16px",
                    background:
                      msg.sender === "user"
                        ? "rgba(56,189,248,0.18)"
                        : "rgba(255,255,255,0.07)",
                    lineHeight: "1.8",
                    whiteSpace: "pre-line",
                  }}
                >
                  <strong>{msg.sender === "user" ? "You" : "Jarvis"}:</strong>{" "}
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div style={{ padding: "15px", opacity: 0.7 }}>
                  Jarvis analyzing live markets{dots}
                </div>
              )}

              {/* AUTO SCROLL ANCHOR */}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="Ask Jarvis something... (press Enter to send)"
              style={{
                marginTop: "25px",
                width: "100%",
                padding: "16px",
                background: "#020617",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "white",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(56,189,248,0.5)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,255,255,0.08)"
              }}
            />

            {/* BUTTON */}
            <button
              onClick={sendMessage}
              style={{
                marginTop: "20px",
                padding: "15px 28px",
                background: "#38bdf8",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85"
                e.currentTarget.style.transform = "scale(1.03)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              Send Command
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}