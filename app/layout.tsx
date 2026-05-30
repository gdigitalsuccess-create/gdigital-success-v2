import type { Metadata } from 'next';
import Script from 'next/script';
import { LangProvider } from '@/lib/LangContext';
import config from '@/client.config';
import './globals.css';

export const metadata: Metadata = {
  title: config.content.fr.pageTitle,
  description: `${config.tagline} — Création de sites web, agents IA et automatisation pour les entreprises.`,
  metadataBase: new URL(config.domain),
  openGraph: {
    type: 'website',
    title: config.content.fr.pageTitle,
    description: `${config.tagline} — Création de sites web, agents IA et automatisation pour les entreprises.`,
    url: config.domain,
    images: [{ url: '/assets/logo.png' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
        <link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
        {/* Google Analytics */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`} />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.ga4Id}');
        `}</Script>
      </head>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        <Script id="chatbase-embed" strategy="afterInteractive">{`
          window.embeddedChatbotConfig = { chatbotId: "${config.chatbaseId}", domain: "www.chatbase.co" };
          (function() {
            var s = document.createElement("script");
            s.src = "https://www.chatbase.co/embed.min.js";
            s.setAttribute("chatbotId", "${config.chatbaseId}");
            s.setAttribute("domain", "www.chatbase.co");
            s.defer = true;
            document.body.appendChild(s);
          })();
        `}</Script>
      </body>
    </html>
  );
}
