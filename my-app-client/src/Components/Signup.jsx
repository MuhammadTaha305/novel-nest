import { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';
// No Google login import needed

const Signup = () => {
  const { createUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [role, setRole] = useState('user');
  
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);
  
  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    
    const form = event.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const role = form.role.value;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    try {
      // Pass username in the createUser function if your backend supports it
      const result = await createUser(email, password, username, role);
      if (result.success) {
        alert("Sign up successful!");
        navigate(from, { replace: true });
      } else {
        setError(result.message || "Sign up failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(90px, -30px) scale(1.1); }
            66% { transform: translate(-30px, 20px) scale(0.95); }
          }
          .animate-blob {
            animation: blob 6s infinite ease-in-out;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .fade-in {
            opacity: 1;
            transform: scale(1);
            transition: opacity 4s ease, transform 1.2s ease;
          }
          .fade-start {
            opacity: 0;
            transform: scale(0.7);
          }
          .glass-card {
            background: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            box-shadow: 10px 10px 60px rgba(0, 0, 0, 0.5), -10px 10px 60px rgba(0, 0, 0, 0.3), 0 20px 60px rgba(0, 0, 0, 0.4);
          }
          .google-button-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 40px;
          }
          .google-button-wrapper > div {
            width: 100% !important;
            height: 100%;
            overflow: hidden;
          }
          .google-button-wrapper iframe {
            min-width: 100% !important;
            height: 100% !important;
            border-radius: 9999px;
          }
        `}
      </style>

      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute w-64 h-64 bg-green-400 rounded-full mix-blend-lighten filter blur-2xl opacity-90 animate-blob -top-32 -left-32"></div>
        <div className="absolute w-64 h-64 bg-green-400 rounded-full mix-blend-lighten filter blur-3xl opacity-90 animate-blob animation-delay-2000 top-10 right-10"></div>
        <div className="absolute w-64 h-64 bg-green-400 rounded-full mix-blend-lighten filter blur-2xl opacity-90 animate-blob animation-delay-4000 bottom-20 left-48"></div>
        <div className="absolute w-64 h-64 bg-green-400 rounded-full mix-blend-lighten filter blur-2xl opacity-90 animate-blob animation-delay-2000 bottom-20 left-83"></div>
        <div className="absolute w-56 h-56 bg-green-500 rounded-full mix-blend-lighten filter blur-3xl opacity-80 animate-blob animation-delay-4000 -bottom-12 -right-12 z-0"></div>

        {/* Signup panel - larger width compared to login */}
        <div
          className={`glass-card rounded-2xl w-120 p-10 relative z-10 ${
            fadeIn ? 'fade-in' : 'fade-start'
          }`}
          style={{ width: '448px' }} /* Slightly larger than the login card */
        >
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">Create Account</h2>

          {/* Signup Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <select
              name="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white focus:outline-none focus:ring-0"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-white text-black py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-200"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* No Google signup */}

          <div className="text-center mt-4">
            <p className="text-white/70 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;