import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * On mobile: renders a bottom-drawer action sheet (like iOS).
 * On desktop: renders a standard styled select button + dropdown.
 */
export default function MobileDrawerSelect({ value, onValueChange, options, placeholder = "Select…", className = "" }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const selected = options.find((o) => o.value === value);

  const handleSelect = (val) => {
    onValueChange(val);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400 ${className}`}
      >
        <span className={selected ? "" : "text-gray-400"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-black/40"
            />

            {isMobile ? (
              /* iOS-style action sheet from bottom */
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                className="fixed bottom-0 left-0 right-0 z-[90] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl pb-safe"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between py-4 px-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-sm font-medium transition-colors
                        ${opt.value === value
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-gray-800 dark:text-gray-200"
                        }`}
                    >
                      <span>{opt.label}</span>
                      {opt.value === value && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Desktop dropdown */
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="fixed z-[90] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden min-w-[200px]"
                style={{ top: "auto", left: "auto" }}
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                      ${opt.value === value ? "text-violet-600 dark:text-violet-400" : "text-gray-800 dark:text-gray-200"}`}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}