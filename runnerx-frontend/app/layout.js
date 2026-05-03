import './globals.css';
import { Roboto, Roboto_Condensed } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
  variable: '--font-roboto',
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto-condensed',
});

export const metadata = {
  title: {
    default: 'RunnerX — My Dashboard',
    template: '%s | RunnerX',
  },
  description: 'Manage your RunnerX marathon registrations, track results, and update your personal information across all RunnerX events.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`${roboto.variable} ${robotoCondensed.variable} ${roboto.className}`}
        style={{ minHeight: '100vh', overflowX: 'hidden', background: '#f8fafc', color: '#0f172a', WebkitFontSmoothing: 'antialiased' }}
      >
        {children}
      </body>
    </html>
  );
}
