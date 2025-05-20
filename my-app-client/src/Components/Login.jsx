import { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    login(email, password)
      .then((data) => {
        if (data.success) {
          alert("Login successful!");
          navigate(from, { replace: true });
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
      })
      .catch((error) => {
        setError(error.message || "Login failed. Please try again.");
      });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    loginWithGoogle(credentialResponse.credential)
      .then((data) => {
        if (data.success) {
          alert("Google login successful!");
          navigate(from, { replace: true });
        } else {
          setError(data.message || "Google login failed");
        }
      })
      .catch((error) => {
        setError(error.message || "Google login failed");
      });
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
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

          {/* Login panel */}
        <div
          className={`glass-card rounded-2xl w-96 p-8 relative z-10 ${
            fadeIn ? 'fade-in' : 'fade-start'
          }`}
        >
          {/* Removed Profile Picture */}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Username"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-0"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white focus:outline-none focus:ring-0"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-white text-black py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-200"
            >
              Log In
            </button>
          </form>

          {/* Google login */}
          <div className="google-button-wrapper mt-4">
            <div>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                size="large"
                theme="outline"
                text="continue_with"
                useOneTap={false}
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/sign-up" className="text-sm text-white/70 hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
