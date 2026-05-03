import React from 'react';

const PageHero = ({ 
  title, 
  titleAccent, 
  bgImage, 
  className = "" 
}) => {
  return (
    <section 
      className={`relative w-full overflow-hidden flex items-center justify-center text-center bg-cover bg-center min-h-[300px] md:min-h-[400px] mt-[calc(var(--header-height,72px)+var(--countdown-height,42px))] ${className}`}
      style={bgImage ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImage})`,
      } : {
        background: 'linear-gradient(135deg, #001f3f, #001122)' // Deep Navy fallback
      }}
    >
      <div className="container relative z-20 px-4 py-16 md:py-24">
        
        <h1 className="font-black italic tracking-wider uppercase text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight drop-shadow-lg text-white">
          {title} {titleAccent && <span className="text-white">{titleAccent}</span>}
        </h1>
      </div>
    </section>
  );
};

export default PageHero;
