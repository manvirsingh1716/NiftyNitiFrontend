"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react"

interface StockData {
  date: string
  close: number
  open: number
  high: number
  low: number
  volume: number
}

interface PredictionData {
  prediction: number
  error?: string
}

const timeRanges = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
]

export default function Component() {
  const [selectedRange, setSelectedRange] = useState("3M")
  const [stockData, setStockData] = useState<StockData[]>([])
  const [prediction, setPrediction] = useState<number | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [predictionLoading, setPredictionLoading] = useState(false)

  // Fetch NIFTY 50 data from yfinance
  const fetchStockData = async (days: number) => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Using yfinance through a proxy API or direct fetch
      const response = await fetch(
        `/api/yfinance?symbol=%5ENSEI&period1=${Math.floor(
          startDate.getTime() / 1000,
        )}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`,
      )
      const data = await response.json()

      const result = data.chart.result[0]
      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]

      const formattedData: StockData[] = timestamps
        .map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split("T")[0],
          close: Math.round(quotes.close[index] || 0),
          open: Math.round(quotes.open[index] || 0),
          high: Math.round(quotes.high[index] || 0),
          low: Math.round(quotes.low[index] || 0),
          volume: Math.round(quotes.volume[index] || 0),
        }))
        .filter((item) => item.close > 0)

      setStockData(formattedData)
    } catch (error) {
      console.error("Error fetching stock data:", error)
      // Fallback to mock data if API fails
      generateFallbackData(days)
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data if yfinance fails
  const generateFallbackData = (days: number) => {
    const data: StockData[] = []
    let basePrice = 22000
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const change = (Math.random() - 0.5) * 300
      basePrice += change
      const open = basePrice
      const high = basePrice + Math.random() * 150
      const low = basePrice - Math.random() * 150
      const close = low + Math.random() * (high - low)

      data.push({
        date: date.toISOString().split("T")[0],
        close: Math.round(close),
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        volume: Math.round(Math.random() * 1000000 + 500000),
      })

      basePrice = close
    }

    setStockData(data)
  }

  // Fetch features from backend
  const fetchFeatures = async () => {
    try {
      const response = await fetch("https://niftyniti.onrender.com/features")
      const data = await response.json()
      setFeatures(data.features)
    } catch (error) {
      console.error("Error fetching features:", error)
    }
  }

  // Calculate features from stock data
  const calculateFeatures = (data: StockData[]) => {
    if (data.length < 20) return {}

    const closes = data.map((d) => d.close)
    const volumes = data.map((d) => d.volume)
    const latest = data[data.length - 1]

    // Calculate basic technical indicators
    const sma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5
    const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20

    // Calculate RSI (simplified)
    const gains = []
    const losses = []
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1]
      if (change > 0) gains.push(change)
      else losses.push(Math.abs(change))
    }
    const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14
    const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14
    const rsi = 100 - 100 / (1 + avgGain / avgLoss)

    return {
      close: latest.close,
      volume: latest.volume,
      high: latest.high,
      low: latest.low,
      open: latest.open,
      sma_5: sma5,
      sma_10: sma10,
      sma_20: sma20,
      rsi: rsi,
      volatility:
        Math.sqrt(
          closes.slice(-20).reduce((sum, price, i, arr) => {
            if (i === 0) return 0
            const return_rate = (price - arr[i - 1]) / arr[i - 1]
            return sum + Math.pow(return_rate, 2)
          }, 0) / 19,
        ) * 100,
    }
  }

  // Get prediction from backend
  const getPrediction = async () => {
    if (stockData.length === 0 || features.length === 0) return

    try {
      setPredictionLoading(true)
      const calculatedFeatures = calculateFeatures(stockData)

      // Map calculated features to backend expected features
      const featureData: { [key: string]: number } = {}
      features.forEach((feature) => {
        featureData[feature] = calculatedFeatures[feature as keyof typeof calculatedFeatures] || 0
      })

      const response = await fetch("https://niftyniti.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(featureData),
      })

      const data: PredictionData = await response.json()

      if (data.error) {
        console.error("Prediction error:", data.error)
      } else {
        setPrediction(data.prediction)
      }
    } catch (error) {
      console.error("Error getting prediction:", error)
    } finally {
      setPredictionLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  useEffect(() => {
    const range = timeRanges.find((r) => r.label === selectedRange)
    fetchStockData(range?.days || 90)
  }, [selectedRange])

  useEffect(() => {
    if (stockData.length > 0 && features.length > 0) {
      getPrediction()
    }
  }, [stockData, features])

  const currentPrice = stockData[stockData.length - 1]?.close || 0
  const previousPrice = stockData[stockData.length - 2]?.close || 0
  const change = currentPrice - previousPrice
  const changePercent = previousPrice ? ((change / previousPrice) * 100).toFixed(2) : "0.00"

  const predictionChange = prediction ? prediction - currentPrice : 0
  const predictionChangePercent =
    prediction && currentPrice ? ((predictionChange / currentPrice) * 100).toFixed(2) : "0.00"

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">₹{data.close.toLocaleString()}</p>
          <div className="text-xs text-gray-500 mt-1">
            <p>High: ₹{data.high.toLocaleString()}</p>
            <p>Low: ₹{data.low.toLocaleString()}</p>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading NIFTY 50 data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NIFTY 50</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
                <span
                  className={`flex items-center gap-1 text-lg font-medium ${
                    change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)} ({changePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price Chart</CardTitle>
              <div className="flex gap-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant={selectedRange === range.label ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRange(range.label)}
                    className={selectedRange === range.label ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString([], { month: "short", day: "numeric" })
                    }}
                  />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Tomorrow's Prediction
              {predictionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Predicted Price</p>
                <p className="text-3xl font-bold text-gray-900">₹{prediction.toLocaleString()}</p>
                <p className={`text-lg font-medium mt-2 ${predictionChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {predictionChange >= 0 ? "+" : ""}
                  {predictionChange.toFixed(2)} ({predictionChangePercent}%)
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-4 ${
                    predictionChange >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {predictionChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {predictionChange >= 0 ? "BULLISH" : "BEARISH"}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Getting prediction...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
