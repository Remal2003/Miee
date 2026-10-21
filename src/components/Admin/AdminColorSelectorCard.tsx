import React, { useState } from 'react';

interface AdminColorSelectorCardProps {
  value: string;
  onChange: (val: string) => void;
  language: 'ar' | 'en' | 'fr';
}

interface ColorPreset {
  nameAr: string;
  nameFr: string;
  nameEn: string;
  hex: string;
  border?: boolean;
}

const COLOR_PRESETS: ColorPreset[] = [
  { nameAr: 'أسود ليلي', nameFr: 'Noir de minuit', nameEn: 'Midnight Black', hex: '#18181b' },
  { nameAr: 'بيج رملي', nameFr: 'Beige sable', nameEn: 'Sand Beige', hex: '#d4c5b9' },
  { nameAr: 'أبيض عاجي', nameFr: 'Blanc ivoire', nameEn: 'Ivory White', hex: '#faf7f2', border: true },
  { nameAr: 'كحلي ملكي', nameFr: 'Bleu marine', nameEn: 'Royal Navy', hex: '#1e293b' },
  { nameAr: 'زيتي ملكي', nameFr: 'Kaki royal', nameEn: 'Olive Khaki', hex: '#3f4836' },
  { nameAr: 'عنابي برغندي', nameFr: 'Bordeaux', nameEn: 'Burgundy', hex: '#5b1424' },
  { nameAr: 'بني موكا', nameFr: 'Brun moka', nameEn: 'Mocha Brown', hex: '#50382b' },
  { nameAr: 'رمادي لؤلؤي', nameFr: 'Gris perle', nameEn: 'Pearl Grey', hex: '#9ca3af' },
  { nameAr: 'وردي غباري', nameFr: 'Rose poudré', nameEn: 'Dusty Rose', hex: '#d8a4a4' },
  { nameAr: 'أخضر زمردي', nameFr: 'Vert émeraude', nameEn: 'Emerald Green', hex: '#065f46' },
  { nameAr: 'خردلي دافئ', nameFr: 'Moutarde', nameEn: 'Warm Mustard', hex: '#b45309' },
  { nameAr: 'أزرق سماوي', nameFr: 'Bleu ciel', nameEn: 'Sky Blue', hex: '#38bdf8' }
];

// Helper to find a matching swatch color for any color string
export const getKnownColorSwatch = (colorName: string): string => {
  const trimmed = colorName.trim().toLowerCase();
  for (const preset of COLOR_PRESETS) {
    if (
      preset.nameAr.toLowerCase() === trimmed ||
      preset.nameFr.toLowerCase() === trimmed ||
      preset.nameEn.toLowerCase() === trimmed
    ) {
      return preset.hex;
    }
  }
  // Generic keyword matching fallback
  if (trimmed.includes('أسود') || trimmed.includes('noir') || trimmed.includes('black')) return '#18181b';
  if (trimmed.includes('أبيض') || trimmed.includes('blanc') || trimmed.includes('white')) return '#f8f8f8';
  if (trimmed.includes('بيج') || trimmed.includes('beige')) return '#d4c5b9';
  if (trimmed.includes('كحلي') || trimmed.includes('marine') || trimmed.includes('navy')) return '#1e293b';
  if (trimmed.includes('زيتي') || trimmed.includes('kaki') || trimmed.includes('olive')) return '#3f4836';
  if (trimmed.includes('عنابي') || trimmed.includes('bordeaux') || trimmed.includes('burgundy')) return '#5b1424';
  if (trimmed.includes('بني') || trimmed.includes('marron') || trimmed.includes('brown')) return '#50382b';
  if (trimmed.includes('رمادي') || trimmed.includes('gris') || trimmed.includes('grey')) return '#9ca3af';
  if (trimmed.includes('وردي') || trimmed.includes('rose') || trimmed.includes('pink')) return '#d8a4a4';
  if (trimmed.includes('أخضر') || trimmed.includes('vert') || trimmed.includes('green')) return '#065f46';
  if (trimmed.includes('أزرق') || trimmed.includes('bleu') || trimmed.includes('blue')) return '#2563eb';
  if (trimmed.includes('أصفر') || trimmed.includes('jaune') || trimmed.includes('yellow')) return '#eab308';
  return '#737373';
};

export const AdminColorSelectorCard: React.FC<AdminColorSelectorCardProps> = ({
  value,
  onChange,
  language
}) => {
  const [customInput, setCustomInput] = useState('');

  // Parse current colors array from comma-separated string
  const currentColors = React.useMemo(() => {
    return value
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }, [value]);

  const getColorName = (p: ColorPreset): string => {
    if (language === 'fr') return p.nameFr;
    if (language === 'en') return p.nameEn;
    return p.nameAr;
  };

  const toggleColor = (colorName: string) => {
    if (currentColors.includes(colorName)) {
      const updated = currentColors.filter((c) => c !== colorName);
      onChange(updated.join(', '));
    } else {
      const updated = [...currentColors, colorName];
      onChange(updated.join(', '));
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!currentColors.includes(trimmed)) {
      const updated = [...currentColors, trimmed];
      onChange(updated.join(', '));
    }
    setCustomInput('');
  };

  const handleSelectPalette = (names: string[]) => {
    onChange(names.join(', '));
  };

  return (
    <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
            <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
              {language === 'ar'
                ? 'بطاقة الألوان والخيارات المتوفرة'
                : language === 'fr'
                ? 'Carte des couleurs disponibles'
                : 'Available Colors & Palette Card'}
            </h4>
          </div>
        </div>

        {/* Quick Batch Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const basic = language === 'ar'
                ? ['أسود ليلي', 'بيج رملي', 'أبيض عاجي']
                : language === 'fr'
                ? ['Noir de minuit', 'Beige sable', 'Blanc ivoire']
                : ['Midnight Black', 'Sand Beige', 'Ivory White'];
              handleSelectPalette(basic);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            {language === 'ar' ? 'الألوان الأساسية' : language === 'fr' ? 'Couleurs classiques' : 'Classic Colors'}
          </button>
          <button
            type="button"
            onClick={() => {
              const earthy = language === 'ar'
                ? ['بيج رملي', 'بني موكا', 'زيتي ملكي']
                : language === 'fr'
                ? ['Beige sable', 'Brun moka', 'Kaki royal']
                : ['Sand Beige', 'Mocha Brown', 'Olive Khaki'];
              handleSelectPalette(earthy);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            {language === 'ar' ? 'ألوان ترابية' : language === 'fr' ? 'Teintes terre' : 'Earthy Palette'}
          </button>
          <button
            type="button"
            onClick={() => {
              const royal = language === 'ar'
                ? ['أسود ليلي', 'كحلي ملكي', 'عنابي برغندي']
                : language === 'fr'
                ? ['Noir de minuit', 'Bleu marine', 'Bordeaux']
                : ['Midnight Black', 'Royal Navy', 'Burgundy'];
              handleSelectPalette(royal);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            {language === 'ar' ? 'ألوان داكنة' : language === 'fr' ? 'Teintes sombres' : 'Dark Royale'}
          </button>
        </div>
      </div>

      {/* QUICK PRESET CHIPS TOGGLE */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-800 mb-2.5">
          {language === 'ar' ? 'الألوان المتاحة للاختيار السريع:' : 'Quick Select Colors:'}
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {COLOR_PRESETS.map((p) => {
            const name = getColorName(p);
            const isSelected = currentColors.includes(name);
            return (
              <button
                key={p.hex + p.nameAr}
                type="button"
                onClick={() => toggleColor(name)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border border-neutral-900 shadow-xs font-bold'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/50'
                }`}
              >
                {/* Color Dot Swatch */}
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs border border-black/15"
                  style={{ backgroundColor: p.hex }}
                />
                <span>{name}</span>
                {isSelected && <span className="text-orange-400 text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SELECTED COLORS PILLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-900">
            {language === 'ar' ? 'الألوان المسجلة لهذا المنتج حالياً:' : 'Active Colors for this piece:'}{' '}
            <span className="text-orange-600 font-bold font-latin">({currentColors.length})</span>
          </span>
          {currentColors.length > 0 && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-medium"
            >
              {language === 'ar' ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>

        {currentColors.length === 0 ? (
          <p className="text-[11px] text-neutral-400">
            {language === 'ar'
              ? 'لم يتم تحديد أي لون بعد. انقري على الألوان أعلاه أو أضيفي لوناً مخصصاً.'
              : 'No colors selected. Click above presets or add a custom color.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentColors.map((col) => {
              const swatch = getKnownColorSwatch(col);
              return (
                <span
                  key={col}
                  className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: swatch }}
                  />
                  <span>{col}</span>
                  <button
                    type="button"
                    onClick={() => toggleColor(col)}
                    className="w-4 h-4 rounded-full hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-[10px] leading-none transition-colors cursor-pointer"
                    title="حذف"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Add custom color input */}
        <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={
              language === 'ar'
                ? 'إضافة لون مخصص (مثال: برونزي، فستقي، ذهبي...)'
                : 'Add custom color (e.g. Bronze, Pistachio...)'
            }
            className="flex-1 h-9 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 transition-all font-arabic"
          />
          <button
            type="button"
            onClick={() => handleAddCustom()}
            className="h-9 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            {language === 'ar' ? '+ إضافة' : '+ Add'}
          </button>
        </div>
      </div>

      {/* STOREFRONT PREVIEW: How customers see it in the product modal */}
      {currentColors.length > 0 && (
        <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-500 font-medium">
            {language === 'ar' ? 'معاينة ظهور أزرار الألوان في المتجر:' : 'Storefront preview:'}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {currentColors.map((col, idx) => {
              const swatch = getKnownColorSwatch(col);
              const isFirst = idx === 0;
              return (
                <span
                  key={col}
                  className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs ${
                    isFirst
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'bg-white text-neutral-800 border border-neutral-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full border border-black/10"
                    style={{ backgroundColor: swatch }}
                  />
                  <span>{col}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
