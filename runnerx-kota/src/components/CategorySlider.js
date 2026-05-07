'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategorySlider({ items }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Sync dots with scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const index = Math.round(scrollLeft / clientWidth);
        setCurrentIndex(index);
      }
    };

    const scroller = scrollRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (scroller) scroller.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-scroll logic (optional, but keep it if user liked it, just make it smoother)
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (currentIndex + 1) % items.length;
        scrollRef.current.scrollTo({
          left: nextIndex * scrollRef.current.clientWidth,
          behavior: 'smooth'
        });
      }
    }, 5000); // Slower interval for better UX
    
    return () => clearInterval(interval);
  }, [currentIndex, items.length]);

  if (!items || items.length === 0) return null;

  const scrollToSection = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="md:hidden w-full">
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-0 h-[400px] rounded-2xl shadow-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.link || '#'} 
            className="relative flex-shrink-0 w-full h-full block snap-center"
          >
            <Image
              src={item.image || "/images/overview-runner.png"}
              alt={item.title}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[var(--brand-yellow)] text-xs font-bold uppercase tracking-widest mb-1 block">Category</span>
                  <h3 className="text-white text-3xl font-black italic uppercase leading-none tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-black shadow-xl transform transition-transform active:scale-90">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Dots - Now outside and below the image */}
      <div className="flex justify-center items-center gap-3 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              i === currentIndex 
              ? 'w-10 bg-[var(--brand-blue)] shadow-[0_0_10px_rgba(0,160,255,0.4)]' 
              : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

