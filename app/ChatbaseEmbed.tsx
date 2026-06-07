'use client';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import config from '@/client.config';

// Pages publiques du site G+Digital où le chatbot doit apparaître
const SITE_PAGES = ['/', '/agent-ia', '/carte-nfc', '/mentions-legales', '/merci'];

export default function ChatbaseEmbed() {
  const pathname = usePathname();

  // Uniquement sur les pages marketing du site
  if (!SITE_PAGES.includes(pathname)) return null;

  return (
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
  );
}
