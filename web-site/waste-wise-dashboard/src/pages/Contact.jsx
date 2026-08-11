import React from 'react';

const Contact = () => {
  // SVG Icons for professional look
  const Icons = {
    MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    ShieldAlert: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <nav className="flex justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            <span>Home</span> <span className="opacity-30">/</span> <span className="text-blue-600">Citizen Support</span>
          </nav>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6">
            Get In <span className="text-blue-600">Touch.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Direct access to emergency response, council administration, and department services.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: EMERGENCY & INFO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Enhanced Emergency Hub */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/10 blur-[90px] rounded-full group-hover:bg-rose-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10 flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                    <Icons.ShieldAlert />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Emergency Hub</h3>
                    <p className="text-rose-400/60 text-[10px] font-black uppercase tracking-[0.2em]">Dispatch 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                {/* Critical Response */}
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-rose-500/30 transition-all">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-4">Life & Safety (Priority 1)</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Police / Traffic</p>
                      <a href="tel:119" className="text-4xl font-black hover:text-rose-400 transition-colors">119</a>
                    </div>
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Fire / Ambulance</p>
                      <a href="tel:110" className="text-4xl font-black hover:text-rose-400 transition-colors">110</a>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Response */}
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-4">Urban Infrastructure Crisis</span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center group/line">
                      <span className="text-sm text-slate-300 italic">Water Main Burst / Flooding</span>
                      <a href="tel:011999888" className="font-mono font-bold text-blue-400 hover:underline">011-999-888</a>
                    </div>
                    <div className="flex justify-between items-center group/line">
                      <span className="text-sm text-slate-300 italic">Hazardous Road Damage</span>
                      <a href="tel:011777666" className="font-mono font-bold text-blue-400 hover:underline">011-777-666</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Office Info */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-10">
              <div className="flex gap-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl h-fit"><Icons.MapPin /></div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</h4>
                  <p className="font-bold text-slate-800 text-lg leading-tight">Urban Council Complex</p>
                  <p className="text-slate-500 text-sm mt-1">Main Street, Sector 4, Metro City Center</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl h-fit"><Icons.Clock /></div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Office Hours</h4>
                  <div className="text-sm font-medium text-slate-600 space-y-1">
                    <p className="flex gap-4"><span>Mon — Fri:</span> <span className="text-slate-900">08:30 — 16:30</span></p>
                    <p className="flex gap-4"><span>Saturday:</span> <span className="text-slate-900">08:30 — 12:00</span></p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
                <a href="mailto:contact@council.gov" className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 font-bold transition-all">
                  <Icons.Mail /> <span className="text-sm">Email Us</span>
                </a>
                <a href="tel:011222333" className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 font-bold transition-all">
                  <Icons.Phone /> <span className="text-sm">Call Office</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OFFICIAL FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Icons.Activity />
              </div>
              
              <div className="mb-12">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Official Inquiry Portal</h3>
                <p className="text-slate-400">Formal requests are documented and tracked via our internal CRM.</p>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none" placeholder="Kamal Perera" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none" placeholder="name@email.com" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Department of Interest</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-400 outline-none appearance-none cursor-pointer">
                    <option>General Administration</option>
                    <option>Waste & Sanitation Services</option>
                    <option>Road Maintenance & Infrastructure</option>
                    <option>Revenue & Billing Inquiries</option>
                    <option>Health & Environment</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Case Description</label>
                  <textarea rows="6" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-400 outline-none resize-none" placeholder="Describe the situation or request in detail..."></textarea>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="group w-full md:w-max px-12 py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95">
                    Dispatch Message <Icons.Send />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 3. DIRECTORY SECTION (BOTTOM) */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-slate-200 pb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Direct Lines</h2>
              <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Maintenance & Departmental Extensions</p>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              Average wait time: &lt; 2 minutes
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Waste Mgmt", tel: "011-1111111", desc: "Garbage collection & spills", color: "text-orange-600", bg: "bg-orange-50" },
              { title: "Water Supply", tel: "011-2222222", desc: "Leaks & billing issues", color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Civil Roads", tel: "011-3333333", desc: "Potholes & streetlights", color: "text-yellow-600", bg: "bg-yellow-50" },
              { title: "Revenue", tel: "011-4444444", desc: "Tax & property payments", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((dept, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center font-bold ${dept.bg} ${dept.color} group-hover:scale-110 transition-transform`}>
                  {dept.title.charAt(0)}
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{dept.title}</h4>
                <p className="text-slate-400 text-xs mb-6 h-8">{dept.desc}</p>
                <a href={`tel:${dept.tel}`} className="flex items-center justify-between text-sm font-black text-slate-900 hover:text-blue-600 transition-colors">
                  {dept.tel} <Icons.Phone />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;