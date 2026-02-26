import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Loader2, Image as ImageIcon, FileSpreadsheet, ExternalLink, Lock } from "lucide-react";
import { format } from "date-fns";

export default function PostManager() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const queryClient = useQueryClient();

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);
    const response = await base44.functions.invoke("exportToSheets");
    setExportResult(response.data);
    setExporting(false);
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 200),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => base44.entities.Subject.list("-created_date", 50),
  });

  const handleDelete = async (postId) => {
    await base44.entities.Post.delete(postId);
    queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.content?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || p.subject_id === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Manage Posts</h3>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 text-sm"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export to Sheets
          </Button>
        </div>

        {exportResult && (
          <div className={`mb-4 p-4 rounded-xl border text-sm ${exportResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            {exportResult.success ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-emerald-800">
                  <Lock className="w-4 h-4" />
                  Export successful — AES-256-CBC encrypted
                </div>
                <p className="text-emerald-700 text-xs">
                  {exportResult.totalPosts} posts from {exportResult.totalUsers} users exported. The decryption key is stored in a separate sheet.
                </p>
                <a
                  href={exportResult.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-emerald-700 font-medium hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Spreadsheet
                </a>
              </div>
            ) : (
              <p className="text-red-700">{exportResult.error}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or users..."
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-slate-500 text-sm mb-3">{filtered.length} posts</p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No posts found</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 text-sm">@{post.username}</span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-400 text-xs">
                      {post.created_date && format(new Date(post.created_date), "MMM d, h:mm a")}
                    </span>
                    {post.image_url && <ImageIcon className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>
                  <p className="text-slate-400 text-xs mt-1">Subject: {post.subject_title || "—"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}