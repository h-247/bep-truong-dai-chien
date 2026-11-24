import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bếp Trưởng Đại Chiến - Game Nấu Ăn Phối Hợp Trực Tuyến',
  description: 'Trò chơi nấu ăn phối hợp đồng đội trực tuyến 2-8 người, hỗ trợ điện thoại di động và máy tính',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#212121" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('unhandledrejection', function(event) {
                  var r = event.reason;
                  var msg = r && (r.message || String(r));
                  if (msg && (
                    msg.indexOf('send was called before connect') !== -1 ||
                    msg.indexOf('WebSocket closed without opened') !== -1 ||
                    msg.indexOf('failed to connect to websocket') !== -1
                  )) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#212121] text-[#ECECEC]`}
      >
        {children}
      </body>
    </html>
  );
}
