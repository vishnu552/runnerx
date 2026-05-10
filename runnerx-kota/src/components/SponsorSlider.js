'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function SponsorSlider({ sponsors, apiUrl }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(4); 
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(8); 
      } else {
        setItemsPerPage(12); 
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(sponsors.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, totalPages]);

  if (!sponsors || sponsors.length === 0) return null;

  const pages = [];
  for (let i = 0; i < sponsors.length; i += itemsPerPage) {
    pages.push(sponsors.slice(i, i + itemsPerPage));
  }

  return (
    <div className="sponsor-slider-container" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '40px' }}>
      <div 
        className="sponsor-slider-track" 
        style={{ 
          display: 'flex', 
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${currentIndex * 100}%)`,
          width: '100%' 
        }}
      >
        {pages.map((page, pageIdx) => (
          <div 
            key={pageIdx} 
            style={{ 
              flex: '0 0 100%', 
              display: 'grid',
              gridTemplateColumns: itemsPerPage === 4 ? 'repeat(2, 1fr)' : (itemsPerPage === 8 ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)'),
              gridTemplateRows: 'repeat(2, auto)',
              gap: '20px',
              padding: '10px'
            }}
          >
            {page.map((s) => (
              <div key={s.id} className="partner-sponsor-item" style={{ margin: '0 auto', width: '100%' }}>
                <div className="partner-logo-box" style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', padding: '12px' }}>
                  <Image
                    src={s.image?.startsWith('/') ? `${apiUrl}${s.image}` : s.image}
                    alt={s.name || "Partner"}
                    width={120}
                    height={120}
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="partner-sponsor-title" style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                  {s.title || "Partner"}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginTop: '10px',
          position: 'absolute',
          bottom: '10px',
          left: '0',
          right: '0'
        }}>
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === currentIndex ? 'var(--primary)' : '#cbd5e0',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
