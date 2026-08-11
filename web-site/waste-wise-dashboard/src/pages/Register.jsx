import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      // ✅ Save user info + token
      localStorage.setItem("userInfo", JSON.stringify(data));

      setSuccess("Registration successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-6">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-emerald-600/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-emerald-600/5 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-[520px] bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3.5rem] p-12 md:p-16 border border-white relative z-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 bg-emerald-50 px-4 py-1.5 rounded-full">
            Citizenship Registration
          </div>

          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
            Join the <span className="text-emerald-600 italic">Council.</span>
          </h2>

          <p className="text-slate-500 font-medium">
            Start your digital journey with{" "}
            <span className="text-slate-900 underline decoration-emerald-500/30">
              Official Urban Access.
            </span>
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center uppercase">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center uppercase">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Full Legal Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="citizen@portal.lk"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Verify
            </label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-2 w-full mt-6 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-emerald-600 text-white active:scale-95"
            }`}
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-400">
            Existing member?
            <span
              onClick={() => navigate("/login")}
              className="text-emerald-600 cursor-pointer ml-2 hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
