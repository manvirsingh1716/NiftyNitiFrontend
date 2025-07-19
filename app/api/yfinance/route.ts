import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol") ?? "^NSEI"
    const period1 = searchParams.get("period1") ?? ""
    const period2 = searchParams.get("period2") ?? ""
    const interval = searchParams.get("interval") ?? "1d"

    const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol,
    )}?period1=${period1}&period2=${period2}&interval=${interval}`

    const res = await fetch(yfUrl, {
      // Revalidate the proxy response every 30 min
      next: { revalidate: 60 * 30 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Yahoo Finance fetch failed" }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal proxy error" }, { status: 500 })
  }
}
