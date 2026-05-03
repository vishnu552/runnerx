"use client";

import { useState, useEffect, useCallback } from 'react';
import { getGalleryImages } from '@/lib/api';

export default function GalleryClient({ initialItems, availableYears, defaultYear }) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (selectedYear && selectedYear !== defaultYear) {
      fetchItems(selectedYear);
    } else if (selectedYear === defaultYear) {
      setItems(initialItems);
    }
  }, [selectedYear, defaultYear, initialItems]);

  async function fetchItems(year) {
    setLoading(true);
    try {
      const data = await getGalleryImages('KTA', year);
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch gallery items:", error);
    } finally {
      setLoading(false);
    }
  }

  const openLightbox = (index) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  }, []);

  const navigateLightbox = useCallback((direction) => {
    if (selectedIndex === null) return;
    let nextIndex = selectedIndex + direction;
    if (nextIndex < 0) nextIndex = items.length - 1;
    if (nextIndex >= items.length) nextIndex = 0;
    setSelectedIndex(nextIndex);
  }, [selectedIndex, items.length]);

  // Handle Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, closeLightbox, navigateLightbox]);

  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Year Selection (Left Aligned Select Box) */}
      <div className="flex flex-col items-start mb-10">
        <label 
          htmlFor="year-select" 
          className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3"
        >
          Choose Event Year
        </label>
        <div className="relative w-full max-w-[240px]">
          <select 
            id="year-select"
            value={selectedYear || ''} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full appearance-none px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold cursor-pointer outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50 transition-all"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year} Event</option>
            ))}
            {availableYears.length === 0 && (
              <option value="">No Events Found</option>
            )}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-500 font-medium animate-pulse">Reliving the moments...</p>
        </div>
      ) : (
        <>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, idx) => {
                const isVideo = item.mediaType === 'VIDEO' || item.imagePath.match(/\.(mp4|webm|ogg)$/i);
                
                return (
                  <div 
                    key={item.id || idx} 
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
                    onClick={() => openLightbox(idx)}
                  >
                    {isVideo ? (
                      <div className="w-full h-full relative">
                        <video 
                          src={item.imagePath} 
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-sky-500 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.imagePath} 
                        alt="" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <div className="text-6xl mb-6">📸</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Memories Found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We haven't uploaded photos for the {selectedYear} marathon yet. They'll be appearing here very soon!
              </p>
            </div>
          )}
        </>
      )}

      {/* Modern Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
            onClick={closeLightbox}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 hidden md:flex"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 hidden md:flex"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main Content Container */}
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="relative group/img max-h-[85vh] w-full flex items-center justify-center">
              {items[selectedIndex].mediaType === 'VIDEO' || items[selectedIndex].imagePath.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  src={items[selectedIndex].imagePath} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img 
                  src={items[selectedIndex].imagePath} 
                  alt="" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            
            <div className="text-center text-white/40 animate-in slide-in-from-bottom-4 duration-500">
              <p className="text-xs font-black uppercase tracking-[0.3em]">
                {selectedIndex + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
