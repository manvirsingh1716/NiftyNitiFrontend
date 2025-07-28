import Component from "../nifty-dashboard"
import { Head } from "next/document"

export default function Page() {
  return (
    <>
      <Head>
        <title>NiftyNiti - Predict the Next Move of NIFTY 50</title>

        {/* WebSite Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://niftyniti.in",
            "name": "NiftyNiti",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://niftyniti.in/?s={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }} />

        {/* Organization Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "NiftyNiti",
            "url": "https://niftyniti.in",
            "logo": "https://niftyniti.in/logo.png", // replace with actual logo URL
            "sameAs": [
              "https://twitter.com/yourhandle",
              "https://linkedin.com/in/yourhandle"
            ]
          })
        }} />
      </Head>
      <Component />
    </>
  )
}
