import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, ImagePlus, Wand2 } from "lucide-react";

export default function MemeManager() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");

  const { data: memes = [], isLoading } = useQuery({
    queryKey: ["memes"],
    queryFn: () => base44.entities.Meme.list("-created_date", 50),
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setGenerating(true);
    try {
      // Upload original image first
      const uploaded = await base44.integrations.Core.UploadFile({ file: selectedFile });
      const originalUrl = uploaded.file_url;

      // Use AI to generate a meme version
      const memePrompt = prompt.trim()
        ? `Create a funny meme based on this image. ${prompt}. Add bold meme-style text captions. Make it humorous and shareable.`
        : "Turn this image into a funny meme. Add bold meme-style top and bottom text captions. Make it hilarious and relatable.";

      const result = await base44.integrations.Core.GenerateImage({
        prompt: memePrompt,
        existing_image_urls: [originalUrl],
      });

      // Get a title via LLM
      const titleRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Give this meme a short funny title (max 5 words). Context: ${prompt || "general meme"}. Return just the title, nothing else.`,
      });

      await base44.entities.Meme.create({
        image_url: result.url,
        original_image_url: originalUrl,
        caption: prompt || "AI generated meme",
        title: titleRes || "Untitled Meme",
      });

      queryClient.invalidateQueries({ queryKey: ["memes"] });
      setSelectedFile(null);
      setPreview(null);
      setPrompt("");
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.Meme.delete(id);
    queryClient.invalidateQueries({ queryKey: ["memes"] });
  };

  return (
    <div className="space-y-6">
      {/* Upload & Generate */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-violet-500" /> Generate Meme with AI
        </h3>

        <div className="space-y-3">
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Original" className="max-h-48 rounded-xl border border-gray-200" />
              <button
                onClick={() => { setSelectedFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-gray-900/60 rounded-full p-1 hover:bg-gray-900/80"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Upload an image to meme-ify</span>
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: describe the meme vibe (e.g. 'Monday morning vibes')"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />

          <Button
            onClick={handleGenerate}
            disabled={!selectedFile || generating}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating meme...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate Meme</>
            )}
          </Button>
        </div>
      </div>

      {/* Meme Library */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-violet-500" /> Meme Library ({memes.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
        ) : memes.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No memes yet. Generate your first one above!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {memes.map((meme) => (
              <div key={meme.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={meme.image_url} alt={meme.title} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold truncate">{meme.title}</p>
                    <button
                      onClick={() => handleDelete(meme.id)}
                      className="mt-1 text-red-300 hover:text-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}