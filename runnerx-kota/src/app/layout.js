import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGlobalContent, getCategories, getSponsors, getEvents } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { eventInfo as fallbackEventInfo, categories as fallbackCategories } from '@/data/categories';
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
    default: 'RunnerX Kota Marathon | Run Through the Heart of Hadoti',
    template: '%s | RunnerX Kota Marathon',
  },
  description:
    'Join the 1st Edition of RunnerX Kota Marathon — 3 KM, 5 KM, 10 KM & Half Marathon. Run through the scenic Chambal Riverfront in Kota, Rajasthan. November 15, 2026.',
  keywords: ['marathon', 'kota', 'running', 'half marathon', 'rajasthan', 'chambal', 'fun run', '5k', '10k'],
  openGraph: {
    title: 'RunnerX Kota Marathon',
    description: 'Run Through the Heart of Hadoti — 1st Edition, November 15, 2026',
    type: 'website',
  },
};

export default async function RootLayout({ children }) {
  const [globalContent, categoriesData, sponsorsData, eventsData, user] = await Promise.all([
    getGlobalContent(),
    getCategories(),
    getSponsors(),
    getEvents(),
    getCurrentUser()
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

  const dateIsoObj = nearestEvent ? nearestEvent.date : (globalContent?.event_info?.date_iso || '2026-11-15T05:30:00+05:30');

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
    social: {
      instagram: globalContent?.social?.instagram || fallbackEventInfo.social.instagram,
      facebook: globalContent?.social?.facebook || fallbackEventInfo.social.facebook,
      twitter: globalContent?.social?.twitter || fallbackEventInfo.social.twitter,
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`${roboto.variable} ${robotoCondensed.variable} ${roboto.className} min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased`}>
        <Header eventInfo={eventInfo} categories={categories} sponsors={sponsors} user={user} />
        <main>{children}</main>
        <Footer eventInfo={eventInfo} />
      </body>
    </html>
  );
}
