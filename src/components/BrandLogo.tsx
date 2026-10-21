import React from 'react';

interface BrandLogoProps {
  className?: string;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "", textColor }) => {
  const colorClass = textColor || (className.includes('text-white') ? 'text-white' : 'text-ink');
  return (
    <div dir="ltr" className={`inline-flex flex-col items-end select-none leading-none group transition-transform hover:scale-105 ${colorClass} ${className}`}>
      <span className={`text-[11px] sm:text-[12px] font-bold font-latin tracking-tight leading-none pr-0.5 ${colorClass}`}>
        Closet
      </span>
      <span className={`text-[32px] sm:text-[38px] font-extrabold font-latin tracking-tighter leading-none -mt-0.5 ${colorClass}`}>
        Miee
      </span>
    </div>
  );
};
