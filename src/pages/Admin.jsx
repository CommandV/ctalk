import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Users, Zap, CreditCard, RotateCcw, Sticker, Loader2, ShieldOff, BarChart2, UserSearch } from "lucide-react";
import SubjectManager from "../components/admin/SubjectManager";
import PostManager from "../components/admin/PostManager";
import UserManager from "../components/admin/UserManager";
import CardManager from "../components/admin/CardManager";
import CycleManager from "../components/admin/CycleManager";
import MemeManager from "../components/admin/MemeManager";
import AdminCardGift from "../components/admin/AdminCardGift";
import AdminTakeCards from "../components/admin/AdminTakeCards";
import AdminPackGrant from "../components/admin/AdminPackGrant";
import PollManager from "../components/admin/PollManager";
import UserDetailViewer from "../components/admin/UserDetailViewer";
import { base44 } from "@/api/base44Client";

export default function Admin() {
  const [authState, setAuthState] = useState("loading"); // loading | admin | denied

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user?.role === "admin") setAuthState("admin");
      else setAuthState("denied");
    }).catch(() => setAuthState("denied"));
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <ShieldOff className="w-14 h-14 text-red-400" />
        <p className="text-xl font-bold text-slate-700">Access Denied</p>
        <p className="text-slate-500 text-sm">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-slate-500 mt-1">Manage subjects, posts, and users</p>
        </div>

        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1 h-auto flex-wrap gap-1">
            <TabsTrigger
              value="subjects"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <Zap className="w-4 h-4" /> Subjects
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <MessageSquare className="w-4 h-4" /> Posts
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <CreditCard className="w-4 h-4" /> Cards
            </TabsTrigger>
            <TabsTrigger
              value="cycles"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <RotateCcw className="w-4 h-4" /> Cycles
            </TabsTrigger>
            <TabsTrigger
              value="memes"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <Sticker className="w-4 h-4" /> Memes
            </TabsTrigger>
            <TabsTrigger
              value="polls"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <BarChart2 className="w-4 h-4" /> Polls
            </TabsTrigger>
            <TabsTrigger
              value="profiles"
              className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2.5"
            >
              <UserSearch className="w-4 h-4" /> User Intel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <SubjectManager />
          </TabsContent>
          <TabsContent value="posts">
            <PostManager />
          </TabsContent>
          <TabsContent value="users">
            <UserManager />
          </TabsContent>
          <TabsContent value="cards">
            <CardManager />
            <AdminCardGift />
            <AdminPackGrant />
            <AdminTakeCards />
          </TabsContent>
          <TabsContent value="cycles">
            <CycleManager />
          </TabsContent>
          <TabsContent value="memes">
            <MemeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}