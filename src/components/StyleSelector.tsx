import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { TATTOO_STYLES, TattooStyle } from '../constants/styles';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
  isUserPro?: boolean;
}

export function StyleSelector({ selectedStyle, onStyleSelect, isUserPro }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStyle = TATTOO_STYLES.find(s => s.name === selectedStyle) || TATTOO_STYLES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex w-full items-center justify-between bg-white border-2 border-[#1A1A1A] px-6 py-5 transition-all duration-500 hover:shadow-[8px_8px_0px_rgba(227,27,35,0.1)] shadow-[4px_4px_0px_rgba(26,26,26,0.05)]"
      >
        <div className="flex items-center gap-5">
          <div className="relative h-12 w-12 overflow-hidden border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,0.05)] group-hover:scale-110 transition-transform duration-500">
            <img src={currentStyle.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E31B23]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#1A1A1A]/20 group-hover:text-[#E31B23]/40 transition-colors">TATTOO STYLE</span>
            <div className="flex items-center gap-3">
              <span className="font-black text-[#1A1A1A] font-impact uppercase tracking-wider text-lg">{currentStyle.name}</span>
              {currentStyle.isPro && !isUserPro && (
                <div className="flex h-6 w-6 items-center justify-center border-2 border-[#E31B23]/20 bg-[#E31B23]/5">
                  <Diamond className="h-3 w-3 fill-[#E31B23] text-[#E31B23] animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center border-2 border-[#1A1A1A]/10 transition-all duration-500 group-hover:bg-[#E31B23]/10 group-hover:border-[#E31B23]",
          isOpen && "rotate-180 bg-[#E31B23]/20 border-[#E31B23]"
        )}>
          <ChevronDown className={cn("h-5 w-5 text-[#1A1A1A]/20 transition-colors group-hover:text-[#E31B23]", isOpen && "text-[#E31B23]")} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="absolute left-0 top-full z-50 mt-6 w-full md:w-[720px] overflow-hidden bg-white border-2 border-[#1A1A1A] p-10 shadow-[32px_32px_0px_rgba(227,27,35,0.1)] asymmetric-border"
          >
            <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
            
            <div className="relative mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 bg-[#E31B23] animate-pulse" />
                <h4 className="text-[11px] font-mono font-black uppercase tracking-[0.6em] text-[#1A1A1A]/40">SELECT YOUR AESTHETIC</h4>
              </div>
              <span className="text-[10px] font-mono text-[#1A1A1A]/20 uppercase tracking-[0.3em] font-black">
                {TATTOO_STYLES.length} STYLES AVAILABLE
              </span>
            </div>

            <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {TATTOO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onStyleSelect(style.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group relative flex flex-col items-center gap-4 border-2 transition-all duration-500 p-4",
                    selectedStyle === style.name 
                      ? "border-[#E31B23] bg-[#E31B23]/5 shadow-[8px_8px_0px_rgba(227,27,35,0.1)]" 
                      : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/[0.02]"
                  )}
                >
                  <div className="relative aspect-square w-full overflow-hidden border-2 border-[#1A1A1A]/10">
                    <img 
                      src={style.image} 
                      alt={style.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {style.isPro && (
                      <div className="absolute right-3 top-3 bg-white/90 p-2 shadow-xl backdrop-blur-md border-2 border-[#1A1A1A]/10">
                        <Diamond className={cn("h-4 w-4", isUserPro ? "text-[#1A1A1A]/40" : "fill-[#E31B23] text-[#E31B23]")} />
                      </div>
                    )}
                    
                    {selectedStyle === style.name && (
                      <div className="absolute inset-0 border-4 border-[#E31B23]/50 pointer-events-none" />
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-[0.3em] font-impact transition-colors duration-300",
                    selectedStyle === style.name ? "text-[#E31B23]" : "text-[#1A1A1A]/40 group-hover:text-[#1A1A1A]/80"
                  )}>
                    {style.name}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative mt-10 pt-8 border-t-2 border-[#1A1A1A]/5 flex items-center justify-center">
              <p className="text-[10px] font-mono text-[#1A1A1A]/20 uppercase tracking-[0.4em] font-black">
                * PREMIUM STYLES REQUIRE A PRO SUBSCRIPTION
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
