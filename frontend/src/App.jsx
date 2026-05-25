import { useState, useEffect, useRef } from "react"
import axios from "axios"

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
      style={{
        height: "500px",
        width: "100%"
      }}
    >

      <div
        className="tradingview-widget-container__widget"
        style={{
          height: "100%",
          width: "100%"
        }}
      />

    </div>

  )

}

export default function App() {

  const [message, setMessage] = useState("")
  const [chat, setChat] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)

  const [chartSymbol, setChartSymbol] =
    useState("NASDAQ:AAPL")

  // ======================
  // FETCH NEWS
  // ======================

  const fetchNews = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/news"
      )

      setNews(response.data)

    }

    catch (error) {

      console.log(error)

    }

  }

  useEffect(() => {

    fetchNews()

  }, [])

  // ======================
  // SEND MESSAGE
  // ======================

  const sendMessage = async () => {

    if (message.trim() === "") return

    setLoading(true)

    // USER MESSAGE

    setChat(prev => [

      ...prev,

      {
        sender: "user",
        text: message
      }

    ])

    // ======================
    // CHART SWITCHING
    // ======================

    const lowerMsg = message.toLowerCase()

    if (lowerMsg.includes("tesla")) {

      setChartSymbol("NASDAQ:TSLA")

    }

    else if (lowerMsg.includes("apple")) {

      setChartSymbol("NASDAQ:AAPL")

    }

    else if (lowerMsg.includes("nvidia")) {

      setChartSymbol("NASDAQ:NVDA")

    }

    else if (lowerMsg.includes("amazon")) {

      setChartSymbol("NASDAQ:AMZN")

    }

    else if (lowerMsg.includes("meta")) {

      setChartSymbol("NASDAQ:META")

    }

    else if (lowerMsg.includes("microsoft")) {

      setChartSymbol("NASDAQ:MSFT")

    }

    else if (lowerMsg.includes("bitcoin")) {

      setChartSymbol("BINANCE:BTCUSDT")

    }

    else if (lowerMsg.includes("ethereum")) {

      setChartSymbol("BINANCE:ETHUSDT")

    }

    else if (lowerMsg.includes("tata")) {

      setChartSymbol("NSE:TATAPOWER")

    }

    else if (lowerMsg.includes("reliance")) {

      setChartSymbol("NSE:RELIANCE")

    }

    try {

      const response = await axios.post(

        "http://127.0.0.1:8000/chat",

        {
          text: message
        }

      )

      setChat(prev => [

        ...prev,

        {
          sender: "jarvis",
          text: response.data.reply
        }

      ])

    }

    catch (error) {

      setChat(prev => [

        ...prev,

        {
          sender: "jarvis",
          text: "Backend connection failed."
        }

      ])

    }

    setLoading(false)

    setMessage("")

  }

  return (

    <div style={{

      minHeight: "100vh",
      background:
        "linear-gradient(135deg,#020617,#0f172a,#111827)",

      color: "white",
      display: "flex",
      fontFamily: "Arial"

    }}>

      {/* SIDEBAR */}

      <div style={{

        width: "260px",
        padding: "30px",
        background: "rgba(255,255,255,0.03)",
        borderRight: "1px solid rgba(255,255,255,0.08)"

      }}>

        <h1 style={{

          color: "#38bdf8",
          fontSize: "34px"

        }}>

          ⚡ JARVIS AI

        </h1>

        <div style={{

          marginTop: "50px",
          lineHeight: "3",
          opacity: 0.85

        }}>

          <p>📊 Dashboard</p>
          <p>🤖 AI Core</p>
          <p>📈 Market Intelligence</p>
          <p>📰 AI News Engine</p>

        </div>

      </div>

      {/* MAIN */}

      <div style={{

        flex: 1,
        padding: "35px"

      }}>

        {/* HEADER */}

        <h1 style={{

          fontSize: "50px",
          fontWeight: "bold",
          background:
            "linear-gradient(90deg,#38bdf8,#a78bfa)",

          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"

        }}>

          Welcome Back, Commander

        </h1>

        <p style={{

          opacity: 0.7,
          marginTop: "10px"

        }}>

          AI systems online and monitoring live markets...

        </p>

        {/* NEWS */}

        <div style={{

          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",

          gap: "18px",
          marginTop: "35px"

        }}>

          {news.map((item, index) => (

            <div
              key={index}
              style={{

                background:
                  "rgba(255,255,255,0.05)",

                border:
                  "1px solid rgba(255,255,255,0.08)",

                borderRadius: "20px",
                padding: "20px"

              }}
            >

              <h3 style={{

                fontSize: "15px",
                lineHeight: "1.7"

              }}>

                {item.title}

              </h3>

              <p style={{

                marginTop: "15px",
                fontWeight: "bold",

                color:

                  item.sentiment === "BULLISH"
                    ? "#22c55e"
                    : item.sentiment === "BEARISH"
                    ? "#ef4444"
                    : "#ffffff"

              }}>

                {item.sentiment}

              </p>

            </div>

          ))}

        </div>

        {/* AI PANEL */}

        <div style={{

          marginTop: "40px",
          padding: "30px",
          borderRadius: "24px",

          background:
            "rgba(255,255,255,0.05)",

          border:
            "1px solid rgba(255,255,255,0.08)"

        }}>

          <h2 style={{

            fontSize: "32px"

          }}>

            🤖 Jarvis AI Assistant

          </h2>

          <p style={{

            opacity: 0.7,
            marginBottom: "30px"

          }}>

            Real-Time AI Market Intelligence System

          </p>

          {/* CHART */}

          <div style={{

            overflow: "hidden",
            borderRadius: "20px",
            marginBottom: "30px"

          }}>

            <TradingViewChart
              symbol={chartSymbol}
            />

          </div>

          {/* CHAT */}

          <div style={{

            maxHeight: "350px",
            overflowY: "auto"

          }}>

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
                  whiteSpace: "pre-line"

                }}
              >

                <strong>

                  {msg.sender === "user"
                    ? "You"
                    : "Jarvis"}:

                </strong>

                {" "}

                {msg.text}

              </div>

            ))}

            {loading && (

              <div style={{

                padding: "15px",
                opacity: 0.7

              }}>

                Jarvis analyzing live markets...

              </div>

            )}

          </div>

          {/* INPUT */}

          <input

            value={message}

            onChange={(e) =>
              setMessage(e.target.value)
            }

            placeholder="Ask Jarvis something..."

            style={{

              marginTop: "25px",
              width: "100%",
              padding: "16px",

              background: "#020617",

              border:
                "1px solid rgba(255,255,255,0.08)",

              borderRadius: "12px",

              color: "white",
              fontSize: "16px",
              outline: "none"

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

              color: "black"

            }}
          >

            Send Command

          </button>

        </div>

      </div>

    </div>

  )

}