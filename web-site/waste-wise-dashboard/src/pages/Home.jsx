import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const Icons = {
    ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="bg-white border-b border-slate-200 overflow-hidden relative z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[140px] rounded-full translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 md:py-40 relative z-10">
          <div className="max-w-4xl text-center md:text-left">
            <nav className="flex justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8">
              <span>Official Citizen Portal</span>
            </nav>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
              Digital <span className="text-blue-600 italic">Governance.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl font-light mb-12">
              Empowering the community through a seamless, transparent, and centralized 
              platform for all municipal services.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => navigate("/services")}
                className="group px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200"
              >
                Explore Services <Icons.ArrowRight />
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[2rem] font-black text-sm hover:bg-slate-50 transition-all"
              >
                Contact Council
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERLAP SECTION */}
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="transform -translate-y-1/2 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Active Requests", val: "120+", color: "text-blue-600" },
            { label: "Resolved Cases", val: "85%", color: "text-emerald-600" },
            { label: "City Wards", val: "15", color: "text-amber-500" },
            { label: "Urgent Alerts", val: "05", color: "text-rose-600" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white flex flex-col items-center justify-center text-center hover:bg-slate-900 group transition-all duration-500">
              <h2 className={`text-3xl md:text-4xl font-black ${stat.color} group-hover:text-white transition-colors`}>{stat.val}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 group-hover:text-slate-500 transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 3. EMERGENCY MARQUEE */}
        <div className="mt-4 bg-rose-600 text-white py-4 px-8 rounded-3xl flex items-center gap-6 shadow-xl shadow-rose-200 animate-pulse">
           <span className="font-black text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Urgent</span>
           <p className="font-bold text-sm">Emergency: Water supply interruption in Zone A from 2PM - 6PM today.</p>
        </div>

        {/* 4. QUICK ACTIONS GRID */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Efficiency</p>
               <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Quick Actions.</h2>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">Commonly used citizen tools for rapid administrative processing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Apply for Services", icon: "🧾", path: "/services" },
              { title: "Report Waste Issue", icon: "🗑️", path: "/reports" },
              { title: "Find Council Office", icon: "📍", path: "/location" },
              { title: "Download Forms", icon: "📄", path: "/documents" },
              { title: "Pay Property Taxes", icon: "💳", path: "/payments" },
              { title: "Contact Support", icon: "📞", path: "/contact" },
            ].map((action, i) => (
              <div 
                key={i}
                onClick={() => navigate(action.path)}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{action.icon}</span>
                  <span className="font-black text-slate-800 tracking-tight text-lg">{action.title}</span>
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                  <Icons.ArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DUAL SECTION: NOTICES & HIGHLIGHTS */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* NOTICE BOARD */}
          <div className="lg:col-span-1">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold">📢</div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notices</h2>
             </div>
             <div className="space-y-6">
               {[
                 { t: "Garbage Update", d: "New residential schedule starts Monday.", p: "Today" },
                 { t: "Road Maintenance", d: "Main Street closed for repairs this weekend.", p: "Yesterday" },
                 { t: "Tax Reminder", d: "Last date for tax payment is 30th of this month.", p: "2 days ago" }
               ].map((n, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{n.p}</p>
                   <h3 className="font-bold text-slate-800 mb-2">{n.t}</h3>
                   <p className="text-sm text-slate-500 leading-relaxed">{n.d}</p>
                 </div>
               ))}
             </div>
          </div>

          {/* COUNCIL HIGHLIGHTS */}
          <div className="lg:col-span-2">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Icons.Shield /></div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Council Highlights</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { t: "Digital Transformation", d: "Moving all services to digital-first online platforms." },
                  { t: "Waste Management", d: "Smart monitoring system implemented city-wide." },
                  { t: "Clean City", d: "Weekly cleanup programs in all major zones." },
                  { t: "Public Safety", d: "New CCTV monitoring system installed in key areas." }
                ].map((h, i) => (
                  <div key={i} className="group bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{h.t}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{h.d}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 6. UPCOMING EVENTS - Visual Timeline */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Upcoming Events.</h2>
            <p className="text-slate-500">Mark your calendars for community engagements.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {[
              { t: "Community Cleanup Day", d: "10 June 2026", color: "bg-emerald-500" },
              { t: "Public Awareness Workshop", d: "15 June 2026", color: "bg-blue-600" },
              { t: "Town Hall Meeting", d: "20 June 2026", color: "bg-slate-900" }
            ].map((e, i) => (
              <div key={i} className="flex-1 bg-white p-10 rounded-[3.5rem] border border-slate-200 text-center hover:shadow-2xl transition-all group">
                <div className={`w-3 h-3 ${e.color} mx-auto rounded-full mb-6`}></div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{e.t}</h3>
                <div className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <Icons.Calendar /> {e.d}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. FOOTER ACTION */}
        <div className="mt-32 bg-white rounded-[4rem] p-12 md:p-20 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left overflow-hidden relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Urban Council Office</h2>
            <p className="text-slate-500 text-lg max-w-md font-medium">Serving citizens with transparency and absolute efficiency. Open Mon-Fri, 8 AM - 5 PM.</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-slate-800">📍 Main Street, City Center</p>
            <p className="font-bold text-slate-800">📞 011-1234567</p>
            <p className="font-bold text-blue-600 underline">info@urbancouncil.lk</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
