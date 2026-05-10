'use client';

import { useEffect, useState } from 'react';
import CategoryAccordion from './CategoryAccordion';
import CategorySlider from './CategorySlider';

const DESKTOP_BREAKPOINT = '(min-width: 768px)';

export default function CategorySection({ items }) {
  // null until matchMedia evaluates client-side. Keeping both rendered during
  // SSR + first paint preserves SEO content and avoids a layout flash; after
  // hydration, we drop the unused subtree to free up listeners and DOM nodes.
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_BREAKPOINT);
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isDesktop === null) {
    return (
      <>
        <div className="hidden md:block">
          <CategoryAccordion items={items} />
        </div>
        <div className="md:hidden">
          <CategorySlider items={items} />
        </div>
      </>
    );
  }

  return isDesktop ? <CategoryAccordion items={items} /> : <CategorySlider items={items} />;
}
