import React from 'react';

const About = () => {
  // Matching professional SVG Icons
  const Icons = {
    Target: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    ),
    Users: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    ShieldCheck: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    History: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
    )
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-blue-700 uppercase bg-blue-50 rounded-full">
            Our Identity & Purpose
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            Building a Sustainable <br />
            <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Urban Future</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            The Urban Council is dedicated to providing superior civic services, 
            fostering community growth, and maintaining a clean, safe environment for all citizens.
          </p>
        </div>
      </div>

      {/* --- CORE PILLARS (The "About" Cards) --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:translate-y-[-5px] transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Icons.Target />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed">
              To enhance the quality of life in our city through transparent governance, 
              efficient waste management, and infrastructure excellence.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:translate-y-[-5px] transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Icons.ShieldCheck />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
            <p className="text-slate-500 leading-relaxed">
              To become a benchmark for smart city management in the region, 
              pioneering green initiatives and digital citizen engagement.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:translate-y-[-5px] transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Icons.ShieldCheck />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
            <p className="text-slate-500 leading-relaxed">
              To become a benchmark for smart city management in the region, 
              pioneering green initiatives and digital citizen engagement.
            </p>
          </div>

          {/* Community */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:translate-y-[-5px] transition-all duration-300">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Icons.Users />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Community First</h3>
            <p className="text-slate-500 leading-relaxed">
              Every policy we implement is designed with the citizen at the center, 
              ensuring inclusivity and accessibility for everyone.
            </p>
          </div>
        </div>

        {/* --- DETAILED CONTENT SECTION --- */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 right-4 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-200 aspect-video flex items-center justify-center">
                {/* Replace with an actual image of the city or council building */}
                <span className="text-slate-400 font-bold uppercase tracking-widest">Council Gallery Image</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-sm font-bold uppercase tracking-tighter">
              <Icons.History /> Since 1994
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Three Decades of Civic Excellence</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Established over 30 years ago, the Urban Council has evolved from a small administrative 
              body into a modern, data-driven organization. We manage over 500km of road networks, 
              serve 150,000 residents, and process 40 tons of waste daily through eco-friendly methods.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="text-3xl font-black text-blue-600">98%</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-600">24/7</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- LEADERSHIP SECTION --- */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Leadership</h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full mt-4 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Hon. Aruna Bandara", role: "Chairman", color: "bg-slate-200" },
              { name: "Nimali Silva", role: "Vice Chairperson", color: "bg-slate-200" },
              { name: "Dr. K. Perera", role: "Chief Medical Officer", color: "bg-slate-200" },
              { name: "S. Jayasuriya", role: "Chief Engineer", color: "bg-slate-200" },
            ].map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className={`aspect-square ${member.color} rounded-3xl mb-6 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-4 border-white overflow-hidden flex items-center justify-center`}>
                   <Icons.Users />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                <p className="text-blue-600 font-medium text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;