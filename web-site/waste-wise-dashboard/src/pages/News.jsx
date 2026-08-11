import React, { useState } from "react";

function News() {
  const [readItems, setReadItems] = useState([]);

  const Icons = {
    Megaphone: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-0.8"/></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  };

  const newsData = [
    { id: 1, type: "Tender", title: "Waste Collection Contract 2026", desc: "Urban Council invites competitive bids for city-wide waste management services and logistics.", time: "Today", priority: "blue" },
    { id: 2, type: "Public Notice", title: "New Garbage Collection Schedule", desc: "Updated residential collection routes and timings will apply starting next Monday.", time: "Yesterday", priority: "green" },
    { id: 3, type: "Emergency", title: "Water Supply Interruption", desc: "Temporary interruption in Zone A due to emergency maintenance work on the main trunk line.", time: "2 hours ago", priority: "red" },
  ];

  const markAsRead = (id) => {
    if (!readItems.includes(id)) setReadItems([...readItems, id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 overflow-hidden relative z-10">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-blue-600/5 blur-[100px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              <span>Bulletin</span> <span className="opacity-30">/</span> <span className="text-blue-600">News & Notices</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6">
              Council <span className="text-blue-600">Update.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
              Real-time announcements, legislative updates, and critical public safety alerts for our residents.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        
        {/* 2. STATS OVERLAP SECTION */}
        <div className="transform -translate-y-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Active Notices", val: "12", color: "text-blue-600" },
            { label: "Public Announcements", val: "05", color: "text-emerald-600" },
            { label: "Emergency Alerts", val: "02", color: "text-rose-600" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group hover:scale-[1.02] transition-all">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <h2 className={`text-3xl font-black ${stat.color} mt-1`}>{stat.val}</h2>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                 <Icons.Megaphone />
               </div>
            </div>
          ))}
        </div>

        {/* 3. FEATURED CRITICAL ALERT */}
        <div className="mt-8 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-full bg-rose-600/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-rose-500 p-4 rounded-2xl shadow-lg shadow-rose-500/20">
              <Icons.Alert />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">Urgent Notice</span>
                 <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Water Supply Interruption — Zone A</h2>
              <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed italic">
                Maintenance work scheduled on the main distribution line. Supply expected to resume by 6:00 PM today.
              </p>
            </div>
          </div>
        </div>

        {/* 4. NEWS LISTING GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {newsData.map((item) => {
            const isRead = readItems.includes(item.id);
            const priorityMap = {
              red: "border-rose-500 bg-rose-50/50 text-rose-600",
              blue: "border-blue-500 bg-blue-50/50 text-blue-600",
              green: "border-emerald-500 bg-emerald-50/50 text-emerald-600"
            };

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`group relative bg-white rounded-[3rem] p-8 md:p-10 border-l-[12px] border shadow-sm transition-all duration-500 cursor-pointer overflow-hidden
                  ${priorityMap[item.priority]}
                  ${isRead ? "opacity-60 grayscale-[0.5]" : "hover:shadow-2xl hover:-translate-y-2 border-y-slate-200 border-r-slate-200"}
                `}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icons.Clock />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.time}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed mb-8">
                  {item.desc}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  {isRead ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                      <div className="bg-emerald-100 p-1 rounded-full"><Icons.Check /></div>
                      Archived / Read
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors font-bold text-xs uppercase tracking-widest">
                      Mark as Read
                    </div>
                  )}
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Icons.Check />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default News;