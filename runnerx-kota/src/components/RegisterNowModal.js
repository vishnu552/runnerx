'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterNowModal({ isOpen, onClose, events }) {
  if (!isOpen) return null;

  // Split events into Kota (Site For KTA) and others
  const kotaEvents = events.filter(e => e.siteFor === 'KTA');
  const otherEvents = events.filter(e => e.siteFor !== 'KTA');

  const getCityFromCode = (code) => {
     switch(code) {
        case 'KTA': return 'Kota';
        case 'JDH': return 'Jodhpur';
        case 'UDP': return 'Udaipur';
        default: return code;
     }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 flex items-center gap-3">
             <span className="bg-sky-500 text-white px-3 py-1 rounded inline-block">RUNNERX</span>
             AVAILABLE EVENTS
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Main Site Event (Kota) */}
          {kotaEvents.length > 0 && (
            <div className="mb-12">
               <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-slate-200 flex-grow"></div>
                  <h3 className="text-sm font-bold text-sky-600 uppercase tracking-widest italic">KOTA MARATHON 2026</h3>
                  <div className="h-px bg-slate-200 flex-grow"></div>
               </div>
               
               <div className="grid gap-6">
                 {kotaEvents.map(event => (
                   <EventCard key={event.id} event={event} isPrimary={true} />
                 ))}
               </div>
            </div>
          )}

          {/* Other City Events */}
          <div className="mt-4">
             <div className="text-center mb-8">
                <p className="text-slate-500 font-medium mb-1">Expanding across Rajasthan</p>
                <h3 className="text-lg font-bold text-slate-800 uppercase italic">RunnerX is also conducting other events in different cities</h3>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                {otherEvents.length > 0 ? (
                  otherEvents.map(event => (
                    <EventCard key={event.id} event={event} city={getCityFromCode(event.siteFor)} />
                  ))
                ) : (
                  <div className="md:col-span-2 py-10 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                     <p className="text-slate-400 font-medium">Coming soon to more cities near you!</p>
                  </div>
                )}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by RunnerX Event Management System</p>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, isPrimary = false, city }) {
  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className={`group relative flex flex-col md:flex-row overflow-hidden rounded-xl border-2 transition-all ${isPrimary ? 'border-sky-500 bg-white' : 'border-slate-100 hover:border-sky-200 bg-slate-50/50'}`}>
       
       <div className={`p-6 md:w-1/4 ${isPrimary ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'} flex flex-col items-center justify-center text-center`}>
          <div className="text-3xl font-black leading-none">{date.getDate()}</div>
          <div className="text-xs uppercase font-bold tracking-tighter mt-1">{date.toLocaleDateString('en-US', { month: 'short' })} {date.getFullYear()}</div>
          <div className="h-px w-8 bg-current opacity-30 my-2"></div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">{dayName}</div>
       </div>

       <div className="p-6 flex-grow flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPrimary ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-600'}`}>
                {city || 'Local Site'}
             </span>
             {isPrimary && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-600">PRIMARY</span>}
          </div>
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-800 line-clamp-1">{event.title}</h4>
          <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             {event.venue}, {event.city}
          </p>
       </div>

       <div className="p-6 flex items-center justify-center md:border-l border-slate-100">
          <Link 
            href={`/event-register/${event.id}`}
            className={`whitespace-nowrap rounded-lg px-8 py-3 text-sm font-black italic uppercase tracking-wider shadow-lg transition-transform active:translate-y-0 hover:-translate-y-0.5 ${isPrimary ? 'bg-[#00a0ff] text-white shadow-sky-200' : 'bg-slate-800 text-white shadow-slate-200'}`}
          >
            Register Now →
          </Link>
       </div>
    </div>
  );
}
