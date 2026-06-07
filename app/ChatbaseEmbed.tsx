'use client';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import config from '@/client.config';

export default function ChatbaseEmbed() {
  const pathname = usePathname();

  // Ne pas charger sur les cartes NFC ni les pages admin/dashboard client
  if (
    pathname.startsWith('/c/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin')
  ) return null;

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
