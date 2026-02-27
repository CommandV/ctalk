import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sticker, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemePicker({ onSelect }) {
  const [open, setOpen] = useState(false);

  const { data: memes = [], isLoading } = useQuery({
    queryKey: ["memes"],
    queryFn: () => base44.entities.Meme.list("-created_date", 50),
    enabled: open,
  });

  const handlePick = (meme) => {
    onSelect(meme.image_url, meme.title);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-violet-500 transition-colors shrink-0 pb-0.5"
        title="Pick a meme"
      >
        <Sticker className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sticker className="w-5 h-5 text-violet-500" /> Meme Library
                </h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 flex-1">
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
                ) : memes.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">No memes available yet!</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {memes.map((meme) => (
                      <button
                        key={meme.id}
                        onClick={() => handlePick(meme)}
                        className="rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all group"
                      >
                        <img src={meme.image_url} alt={meme.title} className="w-full aspect-square object-cover" />
                        <p className="text-xs font-medium text-gray-600 group-hover:text-violet-600 px-2 py-1 truncate text-left">
                          {meme.title}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}