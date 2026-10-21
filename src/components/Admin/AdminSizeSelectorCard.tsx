import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminSizeSelectorCardProps {
  value: string;
  onChange: (val: string) => void;
  language: 'ar' | 'en' | 'fr';
}

const COMMON_PRESETS = [
  { size: 'S', numeric: '38', bust: '90-94', waist: '70-74', length: '140' },
  { size: 'M', numeric: '40', bust: '96-100', waist: '76-80', length: '142' },
  { size: 'L', numeric: '42', bust: '102-106', waist: '82-86', length: '144' },
  { size: 'XL', numeric: '44', bust: '108-114', waist: '88-94', length: '145' },
  { size: 'XXL', numeric: '46', bust: '116-122', waist: '96-102', length: '145' }
];

const NUMERIC_PRESETS = ['38', '40', '42', '44', '46'];

export const AdminSizeSelectorCard: React.FC<AdminSizeSelectorCardProps> = ({
  value,
  onChange,
  language
}) => {
  const [showTable, setShowTable] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Parse current sizes array from comma-separated string
  const currentSizes = React.useMemo(() => {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const toggleSize = (sizeName: string) => {
    if (currentSizes.includes(sizeName)) {
      const updated = currentSizes.filter((s) => s !== sizeName);
      onChange(updated.join(', '));
    } else {
      const updated = [...currentSizes, sizeName];
      onChange(updated.join(', '));
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!currentSizes.includes(trimmed)) {
      const updated = [...currentSizes, trimmed];
      onChange(updated.join(', '));
    }
    setCustomInput('');
  };

  const handleSelectAllStandard = () => {
    const standard = ['S', 'M', 'L', 'XL'];
    onChange(standard.join(', '));
  };

  const handleSelectAllNumeric = () => {
    onChange(NUMERIC_PRESETS.join(', '));
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
                ? 'بطاقة القياسات والمقاسات المتوفرة'
                : language === 'fr'
                ? 'Carte des tailles et mensurations'
                : 'Available Sizes & Measurements Card'}
            </h4>
          </div>
        </div>

        {/* Quick Batch Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleSelectAllStandard}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs font-latin"
            title="S, M, L, XL"
          >
            S - XL
          </button>
          <button
            type="button"
            onClick={handleSelectAllNumeric}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs font-latin"
            title="38, 40, 42, 44, 46"
          >
            38 - 46
          </button>
        </div>
      </div>

      {/* QUICK PRESET CHIPS TOGGLE */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-800 mb-2.5">
          {language === 'ar' ? 'المقاسات المتاحة للاختيار السريع:' : 'Quick Select Sizes:'}
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {COMMON_PRESETS.map((p) => {
            const isSelected = currentSizes.includes(p.size);
            return (
              <button
                key={p.size}
                type="button"
                onClick={() => toggleSize(p.size)}
                className={`min-w-[46px] h-10 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border border-neutral-900 shadow-xs font-latin'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/50 font-latin'
                }`}
              >
                {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                <span>{p.size}</span>
              </button>
            );
          })}

          {/* Numeric chips */}
          {NUMERIC_PRESETS.map((num) => {
            const isSelected = currentSizes.includes(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleSize(num)}
                className={`min-w-[42px] h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-latin ${
                  isSelected
                    ? 'bg-neutral-900 text-white border border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/50'
                }`}
              >
                {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                <span>{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SELECTED SIZES PILLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-900">
            {language === 'ar' ? 'المقاسات المسجلة لهذا المنتج حالياً:' : 'Active Sizes for this piece:'}{' '}
            <span className="text-orange-600 font-bold font-latin">({currentSizes.length})</span>
          </span>
          {currentSizes.length > 0 && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-medium"
            >
              {language === 'ar' ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>

        {currentSizes.length === 0 ? (
          <p className="text-[11px] text-neutral-400">
            {language === 'ar'
              ? 'لم يتم تحديد أي مقاس بعد. انقري على المقاسات أعلاه أو أضيفي مقاساً مخصصاً.'
              : 'No sizes selected. Click above presets or add a custom size.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentSizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold font-latin shadow-xs group"
              >
                <span>{sz}</span>
                <button
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className="w-4 h-4 rounded-full hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-[10px] leading-none transition-colors cursor-pointer"
                  title="حذف"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add custom size input */}
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
                ? 'إضافة مقاس مخصص (مثال: 48، طويل، حر...)'
                : 'Add custom size...'
            }
            className="flex-1 h-9 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 transition-all font-latin"
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

      {/* THE SIZE GUIDE REFERENCE TABLE CARD */}
      <div className="border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="w-full px-4 py-3 bg-neutral-50/60 hover:bg-neutral-100/70 flex items-center justify-between text-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-orange-600 text-sm font-bold">📐</span>
            <span className="font-bold text-xs">
              {language === 'ar'
                ? 'بطاقة جدول القياسات المعيارية بالسنتيمتر (دليل تفصيلي)'
                : 'Standard Size Guide Card (cm)'}
            </span>
          </div>
          <span className="text-neutral-400 text-xs font-mono">{showTable ? '▲ إخفاء' : '▼ إظهار'}</span>
        </button>

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 overflow-x-auto"
            >
              <table className="w-full text-center text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-neutral-200/80 text-neutral-500 font-bold bg-neutral-50">
                    <th className="py-2.5 px-3 text-start">المقاس (Size)</th>
                    <th className="py-2.5 px-3">الرقمي</th>
                    <th className="py-2.5 px-3">محيط الصدر</th>
                    <th className="py-2.5 px-3">محيط الخصر</th>
                    <th className="py-2.5 px-3">الطول التقريبي</th>
                    <th className="py-2.5 px-3 text-end">الحالة / الإضافة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {COMMON_PRESETS.map((row) => {
                    const isSelected = currentSizes.includes(row.size);
                    return (
                      <tr
                        key={row.size}
                        onClick={() => toggleSize(row.size)}
                        className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-orange-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-start font-bold font-latin text-neutral-900">
                          {row.size}
                        </td>
                        <td className="py-2.5 px-3 font-latin text-neutral-600">{row.numeric}</td>
                        <td className="py-2.5 px-3 font-latin text-neutral-700">{row.bust} سم</td>
                        <td className="py-2.5 px-3 font-latin text-neutral-700">{row.waist} سم</td>
                        <td className="py-2.5 px-3 font-latin text-neutral-700">{row.length} سم</td>
                        <td className="py-2.5 px-3 text-end">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-white'
                            }`}
                          >
                            {isSelected ? '✓ مضاف' : '+ اختر'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                <span>💡 يمكنك النقر مباشرة على أي صف في الجدول لإضافة المقاس إلى المنتج فوراً.</span>
                <span className="font-latin">Unit: cm</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STOREFRONT PREVIEW: How customers see it */}
      {currentSizes.length > 0 && (
        <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-500 font-medium">
            {language === 'ar' ? 'معاينة ظهور أزرار المقاسات في المتجر:' : 'Storefront preview:'}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {currentSizes.map((sz) => (
              <span
                key={sz}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-xl text-xs font-latin font-bold text-neutral-900 shadow-xs"
              >
                {sz}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
