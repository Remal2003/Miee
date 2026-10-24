import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Ticker: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="h-[34px] bg-ink text-[#f7f5f1] overflow-hidden flex items-center whitespace-nowrap text-[10px] select-none">
      <div className="flex items-center gap-7 animate-ticker">
        {/* Repeat list to ensure continuous smooth infinite marquee */}
        {[
          ...t.announcements,
          ...t.announcements,
          ...t.announcements,
          ...t.announcements,
          ...t.announcements,
          ...t.announcements
        ].map((text, idx) => (
          <React.Fragment key={idx}>
            <span className="tracking-wide font-medium">{text}</span>
            <span className="inline-block w-1 h-1 bg-orange rounded-full" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
