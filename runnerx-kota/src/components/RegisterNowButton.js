'use client';

import { useState } from 'react';
import RegisterNowModal from './RegisterNowModal';

export default function RegisterNowButton({ allEvents, className, style, label = "Register Now →" }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className={className || "btn btn-primary"} 
        style={style}
      >
        {label}
      </button>

      <RegisterNowModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        events={allEvents} 
      />
    </>
  );
}
