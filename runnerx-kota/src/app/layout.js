import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGlobalContent, getCategories, getSponsors, getEvents, getPageContent } from '@/lib/api';
import { eventInfo as fallbackEventInfo, categories as fallbackCategories } from '@/data/categories';
import { Roboto, Roboto_Condensed } from 'next/font/google';
import Script from 'next/script';

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
  title: 'Kota Half Marathon | Challenge Your Limits',
  description:
    'Challenge yourself at Kota Half Marathon and experience the energy, determination, and spirit of a world-class running event.',
  keywords: ['marathon', 'kota', 'running', 'half marathon', 'rajasthan', 'chambal', 'fun run', '5k', '10k'],
  openGraph: {
    title: 'Kota Half Marathon | Challenge Your Limits',
    description:
      'Challenge yourself at Kota Half Marathon and experience the energy, determination, and spirit of a world-class running event.',
    type: 'website',
  },
  icons: {
    icon: '/favIcon.png',
    shortcut: '/favIcon.png',
    apple: '/favIcon.png',
  },
};

export default async function RootLayout({ children }) {
  const [globalContent, homeContent, categoriesData, sponsorsData, eventsData] = await Promise.all([
    getGlobalContent(),
    getPageContent('home', 'KTA'),
    getCategories(),
    getSponsors(),
    getEvents(),
  ]);
  const categories = categoriesData || fallbackCategories;
  const sponsors = sponsorsData || [];
  
  let nearestEvent = null;
  if (eventsData && eventsData.length > 0) {
    const futureEvents = eventsData.filter(e => new Date(e.date) > new Date());
    if (futureEvents.length > 0) {
      futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      nearestEvent = futureEvents[0];
    } else {
      nearestEvent = eventsData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }
  }

  const getOrdinalNum = (n) => n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
  
  let formattedDisplayDate = fallbackEventInfo.date; // e.g. "15th November 2026"
  if (nearestEvent) {
    const dObj = new Date(nearestEvent.date);
    const day = getOrdinalNum(dObj.getDate());
    const month = dObj.toLocaleDateString('en-US', { month: 'long' });
    const year = dObj.getFullYear();
    formattedDisplayDate = `${day} ${month} ${year}`;
  } else if (globalContent?.event_info?.date) {
    formattedDisplayDate = globalContent.event_info.date;
  }

  const countdownTarget = homeContent?.countdown?.target_date;
  const isValidIso = (v) => typeof v === 'string' && !isNaN(new Date(v).getTime());
  const dateIsoObj = nearestEvent
    ? nearestEvent.date
    : (isValidIso(countdownTarget) ? countdownTarget : '2026-11-15T05:30:00+05:30');

  // Create an eventInfo object matching the shape of the existing one
  const eventInfo = {
    name: nearestEvent?.title || globalContent?.event_info?.name || fallbackEventInfo.name,
    tagline: globalContent?.event_info?.tagline || fallbackEventInfo.tagline,
    date: formattedDisplayDate,
    dateIso: dateIsoObj,
    location: globalContent?.event_info?.location || fallbackEventInfo.location,
    startVenue: globalContent?.event_info?.start_venue || fallbackEventInfo.startVenue,
    edition: globalContent?.event_info?.edition || fallbackEventInfo.edition,
    expectedParticipants: globalContent?.event_info?.expected_participants || fallbackEventInfo.expectedParticipants,
    email: globalContent?.event_info?.email || fallbackEventInfo.email,
    phone: globalContent?.event_info?.phone || fallbackEventInfo.phone,
    headerHighlight: globalContent?.header?.header_highlight || "",
    social: {
      instagram: globalContent?.social?.instagram || fallbackEventInfo.social.instagram,
      facebook: globalContent?.social?.facebook || fallbackEventInfo.social.facebook,
      twitter: globalContent?.social?.twitter || fallbackEventInfo.social.twitter,
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body className={`${roboto.variable} ${robotoCondensed.variable} ${roboto.className} min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased`}>
        <Header eventInfo={eventInfo} categories={categories} sponsors={sponsors} />
        <main>{children}</main>
        <Footer eventInfo={eventInfo} />
      </body>
    </html>
  );
}
