import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MemePicker from "./MemePicker";
import { canPostMemes } from "./bonuses";

export default function PostComposer({ userProfile, activeSubject, onPostCreated, uniqueCardCount = 0 }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();
  const memeAllowed = canPostMemes(uniqueCardCount);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    setPosting(true);

    let image_url = null;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }

    await base44.entities.Post.create({
      content: content.trim(),
      image_url,
      username: userProfile.username,
      subject_id: activeSubject.id,
      subject_title: activeSubject.title,
    });

    setContent("");
    removeImage();
    setPosting(false);
    onPostCreated();
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-32 rounded-xl border border-gray-200" />
                <button
                  onClick={removeImage}
                  className="absolute top-1.5 right-1.5 bg-gray-900/60 rounded-full p-1 hover:bg-gray-900/80 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ backgroundColor: userProfile.avatar_color || "#6366F1" }}
          >
            {userProfile.username[0].toUpperCase()}
          </div>

          <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="bg-transparent border-0 text-gray-800 placeholder:text-gray-400 resize-none text-sm p-0 focus-visible:ring-0 min-h-[24px] max-h-32 leading-relaxed"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-gray-400 hover:text-violet-500 transition-colors pb-0.5"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
              {memeAllowed && (
                <MemePicker
                  onSelect={(url) => {
                    setImageFile(null);
                    setImagePreview(url);
                  }}
                />
              )}
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <Button
            onClick={handleSubmit}
            disabled={posting || (!content.trim() && !imageFile)}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-full w-10 h-10 p-0 shrink-0 flex items-center justify-center"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}