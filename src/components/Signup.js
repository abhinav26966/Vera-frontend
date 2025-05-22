import React, { useState, useEffect, useRef } from "react";
import { signup } from "../api";

export default function Signup({ onSignup, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    // Focus email input on component mount
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signup(email, password);
      onSignup(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 sm:my-6 md:my-8 px-4">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4 sm:mb-6 relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 blur-sm"></div>
          <div className="relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-1 sm:mb-2">Create Your Account</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Join the hotel assistant for a better booking experience</p>
      </div>

      <div className="bg-[#1A2432] rounded-xl shadow-md p-5 sm:p-6 md:p-8 border border-gray-700/50">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <input 
              ref={emailInputRef}
              id="email"
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-700 bg-[#212A39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-200 placeholder-gray-500 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="Create a strong password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-700 bg-[#212A39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-200 placeholder-gray-500 text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">Password should be at least 8 characters long</p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 text-red-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border border-red-800/40 shadow-sm animate-pulse">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-medium text-sm sm:text-lg ${
              loading 
              ? 'bg-blue-400/70 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:translate-y-[-1px]'
            } transition-all duration-200`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
      
      <div className="text-center mt-6 sm:mt-8">
        <p className="text-gray-500 text-sm sm:text-base">
          Already have an account?{" "}
          <button 
            onClick={onLogin} 
            className="text-blue-500 font-medium hover:text-blue-400"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
} 