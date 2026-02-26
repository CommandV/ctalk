import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PostComposer({ userProfile, activeSubject, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

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
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: userProfile.avatar_color || "#6366F1" }}
        >
          {userProfile.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="bg-transparent border-0 text-white placeholder:text-slate-600 resize-none text-[15px] p-0 focus-visible:ring-0 min-h-[60px]"
            rows={2}
          />

          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-3 rounded-xl overflow-hidden inline-block"
              >
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-slate-500 hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-white/[0.05]"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              onClick={handleSubmit}
              disabled={posting || (!content.trim() && !imageFile)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl px-5 h-9 text-sm gap-2"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}