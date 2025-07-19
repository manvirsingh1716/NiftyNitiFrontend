"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

// Simple hardcoded data that will definitely work
const HARDCODED_DATA = [
  { date: "2024-01-15", close: 24000, open: 23950, high: 24100, low: 23900, volume: 1000000 },
  { date: "2024-01-16", close: 24150, open: 24000, high: 24200, low: 23980, volume: 1100000 },
  { date: "2024-01-17", close: 24080, open: 24150, high: 24180, low: 24000, volume: 950000 },
  { date: "2024-01-18", close: 24250, open: 24080, high: 24300, low: 24050, volume: 1200000 },
  { date: "2024-01-19", close: 24180, open: 24250, high: 24280, low: 24120, volume: 980000 },
  { date: "2024-01-22", close: 24320, open: 24180, high: 24350, low: 24150, volume: 1050000 },
  { date: "2024-01-23", close: 24280, open: 24320, high: 24340, low: 24200, volume: 1150000 },
  { date: "2024-01-24", close: 24400, open: 24280, high: 24450, low: 24250, volume: 1300000 },
  { date: "2024-01-25", close: 24350, open: 24400, high: 24420, low: 24300, volume: 1080000 },
  { date: "2024-01-26", close: 24500, open: 24350, high: 24550, low: 24320, volume: 1250000 },
]

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

interface ApiLog {
  timestamp: string
  endpoint: string
  status: "success" | "error" | "loading"
  message: string
  data?: any
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
  const [stockData, setStockData] = useState<StockData[]>(HARDCODED_DATA)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock")
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])

  // Add log entry
  const addLog = (
    endpoint: string,
    status: "success" | "error" | "loading",
    message: string,
    data?: any,
    error?: string,
  ) => {
    const log: ApiLog = {
      timestamp: new Date().toLocaleTimeString(),
      endpoint,
      status,
      message,
      data,
      error,
    }
    setApiLogs((prev) => [log, ...prev.slice(0, 9)]) // Keep last 10 logs
    console.log(`[API LOG] ${endpoint}: ${message}`, data || error || "")
  }

  // Generate more realistic mock data
  const generateMockData = (days: number): StockData[] => {
    addLog("generateMockData", "loading", `Generating ${days} days of mock data`)

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

    addLog("generateMockData", "success", `Generated ${data.length} data points`, {
      firstPoint: data[0],
      lastPoint: data[data.length - 1],
      totalPoints: data.length,
    })

    return data
  }

  // Fetch NIFTY 50 data from yfinance
  const fetchStockData = async (days: number) => {
    try {
      setLoading(true)
      addLog("/api/yfinance", "loading", `Fetching ${days} days of NIFTY data`)

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const url = `/api/yfinance?symbol=%5ENSEI&period1=${Math.floor(
        startDate.getTime() / 1000,
      )}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`

      addLog("/api/yfinance", "loading", `Making request to: ${url}`)

      const response = await fetch(url)

      addLog(
        "/api/yfinance",
        response.ok ? "success" : "error",
        `Response status: ${response.status} ${response.statusText}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      addLog("/api/yfinance", "success", "Raw API response received", {
        hasChart: !!data.chart,
        hasResult: !!data.chart?.result,
        resultLength: data.chart?.result?.length || 0,
        firstResult: data.chart?.result?.[0] ? "exists" : "missing",
      })

      if (data.error || !data.chart?.result?.[0]) {
        throw new Error("Invalid data structure")
      }

      const result = data.chart.result[0]
      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]

      addLog("/api/yfinance", "success", "Parsing data structure", {
        timestampsLength: timestamps?.length || 0,
        quotesKeys: quotes ? Object.keys(quotes) : [],
        sampleTimestamp: timestamps?.[0],
        sampleClose: quotes?.close?.[0],
      })

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
        .filter((item): item is StockData => item !== null)

      if (formattedData.length > 0) {
        addLog("/api/yfinance", "success", `Successfully formatted ${formattedData.length} data points`, {
          firstPoint: formattedData[0],
          lastPoint: formattedData[formattedData.length - 1],
          priceRange: {
            min: Math.min(...formattedData.map((d) => d.close)),
            max: Math.max(...formattedData.map((d) => d.close)),
          },
        })
        setStockData(formattedData)
        setDataSource("api")
      } else {
        throw new Error("No valid data points after formatting")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addLog("/api/yfinance", "error", `API failed: ${errorMessage}`, null, errorMessage)

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
      addLog("/features", "loading", "Fetching ML features")

      const response = await fetch("https://niftyniti.onrender.com/features")

      addLog("/features", response.ok ? "success" : "error", `Features API response: ${response.status}`)

      const data = await response.json()
      const featureNames = data.features.map((feature: [string, string]) => feature[0])

      addLog("/features", "success", `Received ${featureNames.length} features`, {
        features: featureNames,
      })

      setFeatures(featureNames)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addLog("/features", "error", `Features fetch failed: ${errorMessage}`, null, errorMessage)

      const fallbackFeatures = ["Prev_Close", "5MA", "10MA", "Return"]
      setFeatures(fallbackFeatures)
      addLog("/features", "success", "Using fallback features", { features: fallbackFeatures })
    }
  }

  // Calculate features from stock data
  const calculateFeatures = (data: StockData[]) => {
    if (data.length < 10) {
      addLog("calculateFeatures", "error", `Insufficient data: ${data.length} points (need 10+)`)
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

    addLog("calculateFeatures", "success", "Features calculated", calculatedFeatures)
    return calculatedFeatures
  }

  // Get prediction from backend
  const getPrediction = async () => {
    if (stockData.length === 0 || features.length === 0) {
      addLog("/predict", "error", `Cannot predict: stockData=${stockData.length}, features=${features.length}`)
      return
    }

    try {
      setPredictionLoading(true)
      addLog("/predict", "loading", "Calculating features and requesting prediction")

      const calculatedFeatures = calculateFeatures(stockData)

      if (Object.keys(calculatedFeatures).length === 0) {
        addLog("/predict", "error", "No features calculated, skipping prediction")
        return
      }

      const response = await fetch("https://niftyniti.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculatedFeatures),
      })

      addLog("/predict", response.ok ? "success" : "error", `Prediction API response: ${response.status}`)

      const data: PredictionData = await response.json()

      if (data.error) {
        addLog("/predict", "error", `Prediction error: ${data.error}`, null, data.error)
      } else {
        addLog("/predict", "success", `Prediction received: ₹${data.prediction}`, {
          prediction: data.prediction,
          currentPrice: stockData[stockData.length - 1]?.close,
          change: data.prediction - (stockData[stockData.length - 1]?.close || 0),
        })
        setPrediction(data.prediction)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addLog("/predict", "error", `Prediction failed: ${errorMessage}`, null, errorMessage)
    } finally {
      setPredictionLoading(false)
    }
  }

  // Initialize
  useEffect(() => {
    addLog("init", "loading", "Component mounted, initializing...")
    fetchFeatures()
  }, [])

  // Fetch data when range changes
  useEffect(() => {
    const range = timeRanges.find((r) => r.label === selectedRange)
    if (range) {
      addLog("rangeChange", "loading", `Range changed to ${selectedRange} (${range.days} days)`)
      fetchStockData(range.days)
    }
  }, [selectedRange])

  // Get prediction when data is ready
  useEffect(() => {
    if (stockData.length > 0 && features.length > 0) {
      addLog(
        "predictionTrigger",
        "loading",
        `Triggering prediction: ${stockData.length} data points, ${features.length} features`,
      )
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
        {/* API Status Dashboard */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              API Status Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-600">Stock Data API</div>
                <div
                  className={`flex items-center gap-2 mt-1 ${dataSource === "api" ? "text-green-600" : "text-yellow-600"}`}
                >
                  {dataSource === "api" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm">{dataSource === "api" ? "Live Data" : "Mock Data"}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-600">Features API</div>
                <div
                  className={`flex items-center gap-2 mt-1 ${features.length > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {features.length > 0 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span className="text-sm">{features.length} features loaded</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-600">Prediction API</div>
                <div
                  className={`flex items-center gap-2 mt-1 ${prediction ? "text-green-600" : predictionLoading ? "text-yellow-600" : "text-gray-600"}`}
                >
                  {prediction ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : predictionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {prediction ? "Prediction Ready" : predictionLoading ? "Loading..." : "Waiting"}
                  </span>
                </div>
              </div>
            </div>

            {/* API Logs */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent API Calls</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {apiLogs.map((log, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border-l-2 border-l-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className="font-mono text-blue-600">{log.endpoint}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : log.status === "error"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-gray-700 mt-1">{log.message}</div>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-gray-500 cursor-pointer">Data</summary>
                        <pre className="text-xs bg-gray-50 p-1 rounded mt-1 overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.error && (
                      <div className="text-red-600 text-xs mt-1 bg-red-50 p-1 rounded">Error: {log.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Simple Test Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Simple Test Chart (Hardcoded Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HARDCODED_DATA}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
