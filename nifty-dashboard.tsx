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
  { label: "1D", days: 1 },
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
  const [loading, setLoading] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock")


  // Generate more realistic mock data
  const generateMockData = (days: number): StockData[] => {

    const data: StockData[] = []
    let basePrice = 24400
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const change = (Math.random() - 0.5) * 200
      basePrice += change
      const open = basePrice + (Math.random() - 0.5) * 50
      const high = Math.max(open, basePrice) + Math.random() * 100
      const low = Math.min(open, basePrice) - Math.random() * 100
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

    return data
  }

  // Fetch NIFTY 50 data from yfinance
  const fetchStockData = async (days: number) => {
    try {
      setLoading(true)

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // For 1 day, we need to use a smaller interval (1h) to get intraday data
      const interval = days === 1 ? '1h' : '1d';
      
      const url = `/api/yfinance?symbol=%5ENSEI&period1=${Math.floor(
        startDate.getTime() / 1000,
      )}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=${interval}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error || !data.chart?.result?.[0]) {
        throw new Error("Invalid data structure")
      }

      const result = data.chart.result[0]
      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]

      if (!timestamps || !quotes) {
        throw new Error("Missing timestamps or quotes data")
      }

      const formattedData: StockData[] = timestamps
        .map((timestamp: number, index: number) => {
          const close = quotes.close[index]
          if (!close || close <= 0) return null

          return {
            date: new Date(timestamp * 1000).toISOString().split("T")[0],
            close: Math.round(close),
            open: Math.round(quotes.open[index] || close),
            high: Math.round(quotes.high[index] || close),
            low: Math.round(quotes.low[index] || close),
            volume: Math.round(quotes.volume[index] || 0),
          }
        })
        .filter((item: StockData | null): item is StockData => item !== null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      const mockData = generateMockData(days)
      setStockData(mockData)
      setDataSource("mock")
    } finally {
      setLoading(false)
    }
  }

  // Fetch features from backend
  const fetchFeatures = async () => {
    try {
      const response = await fetch("https://niftyniti.onrender.com/features")

      const data = await response.json()
      const featureNames = data.features.map((feature: [string, string]) => feature[0])

      setFeatures(featureNames)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      const fallbackFeatures = ["Prev_Close", "5MA", "10MA", "Return"]
      setFeatures(fallbackFeatures)
    }
  }

  // Calculate features from stock data
  const calculateFeatures = (data: StockData[]) => {
    if (data.length < 10) {
      return {}
    }

    const closes = data.map((d) => d.close)
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]

    const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5
    const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10
    const returnValue = previous ? (latest.close - previous.close) / previous.close : 0

    const calculatedFeatures = {
      Prev_Close: previous?.close || latest.close,
      "5MA": Number.parseFloat(ma5.toFixed(2)),
      "10MA": Number.parseFloat(ma10.toFixed(2)),
      Return: Number.parseFloat(returnValue.toFixed(4)),
    }

    return calculatedFeatures
  }

  // Get prediction from backend
  const getPrediction = async () => {
    if (stockData.length === 0 || features.length === 0) {
      return
    }

    try {
      setPredictionLoading(true)

      const calculatedFeatures = calculateFeatures(stockData)

      if (Object.keys(calculatedFeatures).length === 0) {
        return
      }

      const response = await fetch("https://niftyniti.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculatedFeatures),
      })

      const data: PredictionData = await response.json()

      if (data.error) {
        throw new Error(data.error)
      } else {
        setPrediction(data.prediction)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
    } finally {
      setPredictionLoading(false)
    }
  }

  // Initialize
  useEffect(() => {
    fetchFeatures()
  }, [])

  // Fetch data when range changes
  useEffect(() => {
    const range = timeRanges.find((r) => r.label === selectedRange)
    if (range) {
      fetchStockData(range.days)
    }
  }, [selectedRange])

  // Get prediction when data is ready
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
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    dataSource === "api" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {dataSource === "api" ? "Live Data" : "Demo Data"}
                </span>
                <span className="text-xs text-gray-500 ml-2">{stockData.length} data points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <Card className="mb-6">
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

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price Chart ({stockData.length} points)</CardTitle>
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
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : stockData && stockData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => {
                        try {
                          const date = new Date(value)
                          return date.toLocaleDateString([], { month: "short", day: "numeric" })
                        } catch {
                          return value
                        }
                      }}
                    />
                    <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `₹${Math.round(value / 1000)}K`} />
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
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No chart data available</p>
                  <p className="text-sm text-gray-400">Data length: {stockData?.length || 0}</p>
                  <Button onClick={() => fetchStockData(90)} className="mt-2">
                    Reload Data
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
