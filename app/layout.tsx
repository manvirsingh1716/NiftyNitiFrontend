import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NiftyNiti – AI-Powered NIFTY 50 Prediction & Analysis',
  description: 'Predict NIFTY 50 movements using AI-powered tools. Get daily insights, charts, and future trends. Trusted by traders and analysts.',
  keywords: 'Nifty 50 prediction, stock market AI, niftyniti, stock trend forecast, nifty analysis',
  authors: [{ name: 'NiftyNiti Team' }],
  creator: 'NiftyNiti',
  publisher: 'NiftyNiti',
  openGraph: {
    title: 'NiftyNiti – AI-Powered NIFTY 50 Prediction & Analysis',
    description: 'Predict NIFTY 50 movements using AI-powered tools. Get daily insights, charts, and future trends.',
    url: 'https://niftyniti.vercel.app',
    siteName: 'NiftyNiti',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NiftyNiti – AI-Powered NIFTY 50 Prediction & Analysis',
    description: 'Get AI-powered NIFTY 50 predictions and market analysis. Stay ahead in the stock market with our advanced forecasting tools.',
    creator: '@niftyniti',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">NiftyNiti</h3>
            <p className="text-sm text-gray-600">AI-powered NIFTY 50 prediction and analysis platform helping traders make informed decisions.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-gray-600 hover:text-blue-600">Home</a></li>
              <li><a href="#features" className="text-sm text-gray-600 hover:text-blue-600">Features</a></li>
              <li><a href="#about" className="text-sm text-gray-600 hover:text-blue-600">About Us</a></li>
              <li><a href="#contact" className="text-sm text-gray-600 hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</a></li>
              <li><a href="/disclaimer" className="text-sm text-gray-600 hover:text-blue-600">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://twitter.com/niftyniti" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/yourusername/niftyniti" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="mailto:contact@niftyniti.com" className="text-gray-400 hover:text-red-600">
                <span className="sr-only">Email</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {currentYear} NiftyNiti. All rights reserved.</p>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            <span className="block md:inline-block">Data provided for informational purposes only.</span>
            <span className="hidden md:inline-block mx-2">•</span>
            <span className="block md:inline-block mt-2 md:mt-0">Not financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
