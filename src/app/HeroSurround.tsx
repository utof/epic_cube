// app/HeroSurround.tsx

import React from 'react';

// A small, reusable component for our text columns to avoid repetition.
const TextColumn = ({
  words,
  alignment = 'items-end', // 'items-end' for right-align, 'items-start' for left-align
}: {
  words: string[];
  alignment?: 'items-end' | 'items-start';
}) => {
  const textStyles =
    'font-white uppercase tracking-tight text-neutral-800 text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[140px] 2xl:text-[160px] leading-none';

  return (
    // This flex container handles the vertical stacking and alignment of the words.
    <div className={`flex h-full flex-col justify-center gap-4 md:gap-8 ${alignment}`}>
      {words.map((word, index) => (
        <h1 key={index} className={textStyles}>
          {word}
        </h1>
      ))}
    </div>
  );
};

interface HeroSurroundProps {
  cta: React.ReactNode;
  // We accept the parallax offset as a prop to be controlled by the parent.
  parallaxOffset: { x: number; y: number };
}

export const HeroSurround: React.FC<HeroSurroundProps> = ({ cta, parallaxOffset }) => {
  return (
    // The main overlay. It's a grid that takes up the full screen.
    // `pointer-events-none` is still key to let clicks pass through to the canvas.
    <div className="absolute inset-0 z-10 grid h-full w-full grid-cols-[1fr_auto_1fr] p-8 pointer-events-none">
      
      {/* The parallax container. We apply the transform here so all text moves together. */}
      <div
        className="col-span-3 row-span-1 grid h-full w-full grid-cols-subgrid"
        style={{
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          transition: 'transform 0.1s ease-out', // Smooths the parallax movement
        }}
      >
        {/* --- LEFT TEXT COLUMN --- */}
        <div className="col-start-1">
          <TextColumn words={['Holy', 'ITS    A']} alignment="items-end" />
        </div>

        {/* --- CENTER COLUMN (Cube Window & CTA) --- */}
        <div className="col-start-2 flex flex-col items-center justify-center gap-8">
          {/* The invisible window for the cube. Its size dictates the text spacing. */}
          {/* Tweak these responsive values to perfectly frame your 3D cube. */}
          <div className="
            w-60 h-60 
            sm:w-56 sm:h-56 
            md:w-64 md:h-64 
            lg:w-100 lg:h-100
          " />
          
          {/* The CTA container. We re-enable pointer events here. */}
          <div className="pointer-events-auto mt-32">
            {cta}
          </div>
        </div>

        {/* --- RIGHT TEXT COLUMN --- */}
        <div className="col-start-3">
          <TextColumn words={['Shit', 'Cube']} alignment="items-start" />
        </div>
      </div>
    </div>
  );
};