import Link from 'next/link';
import Image from 'next/image';

export default function CategoryAccordion({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-row gap-4 h-[500px] group/container">
      {items.map((item, idx) => (
        <Link
          key={idx}
          href={item.link || '#'}
          className={`relative overflow-hidden transition-all duration-700 ease-in-out cursor-pointer group rounded-2xl
            ${idx === 0 ? 'flex-[4] group-hover/container:flex-1' : 'flex-1'}
            hover:!flex-[4] h-full`}
        >
          {item.image && (
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.title || ''}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
            </div>
          )}

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2
              ${idx === 0 ? 'opacity-0 group-hover/container:opacity-100 group-hover:!opacity-0' : 'opacity-100 group-hover:opacity-0'}
              pointer-events-none`}
            >
              <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-[0.25em] -rotate-90 whitespace-nowrap drop-shadow-lg w-max origin-left translate-x-1/2">
                {item.title}
              </h3>
            </div>

            <div className={`w-full relative z-10
              ${idx === 0 ? 'opacity-100 group-hover/container:opacity-0 group-hover:!opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-white text-2xl md:text-3xl font-black italic uppercase leading-none drop-shadow-xl">{item.title}</h3>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center text-black flex-shrink-0 transition-transform duration-500 group-hover:rotate-45 shadow-lg">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
