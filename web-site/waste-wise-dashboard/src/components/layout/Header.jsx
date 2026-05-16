import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">

      {/* LOGO */}
      <h2 className="cursor-pointer" onClick={() => navigate("/")}>
        🏛️ Urban Council
      </h2>

      {/* NAV */}
      <nav className="hidden md:flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/news">News</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      {/* AUTH */}
      <div className="flex gap-3 items-center">

        {user ? (
          <>
            <span className="text-green-400 font-semibold">
              {user.name}
            </span>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}

      </div>

    </header>
  );
}

export default Header;