import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // save auth
      login(data);

      // redirect
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "driver") {
        navigate("/driver");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-6">

      {/* Background Effects (same as register) */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-blue-600/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-blue-600/5 blur-[100px] rounded-full"></div>

      {/* CARD */}
      <div className="w-full max-w-[520px] bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3.5rem] p-12 md:p-16 border border-white relative z-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6 bg-blue-50 px-4 py-1.5 rounded-full">
            Secure Access
          </div>

          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
            Welcome <span className="text-blue-600 italic">Back.</span>
          </h2>

          <p className="text-slate-500 font-medium">
            Login to access <span className="text-slate-900">Waste Wise Dashboard</span>
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center uppercase">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="citizen@portal.lk"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-blue-600 text-white active:scale-95"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-400">
            New user?
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer ml-2 hover:underline"
            >
              Create Account
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
