import React, { useState, useEffect } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ConversationsList from "./components/ConversationsList";
import Chat from "./components/Chat";

function App() {
  const [user, setUser] = useState(null); // { id, email }
  const [conversation, setConversation] = useState(null); // { id, user_id }
  const [page, setPage] = useState("login"); // "login" | "signup" | "conversations" | "chat"

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage("conversations");
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setPage("conversations");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setPage("login");
  };

  const handleSelectConversation = (conversation) => {
    setConversation(conversation);
    setPage("chat");
  };

  const handleBackToConversations = () => {
    setPage("conversations");
  };

  return (
    <div className="min-h-screen bg-[#121A24] text-gray-200 flex flex-col">
      {page !== "chat" && (
        <nav className="bg-[#1A2432] shadow-lg border-b border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md transform transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-200">Vera</span>
                </div>
              </div>
              {user && (
                <div className="flex items-center">
                  <span className="hidden md:block text-gray-200 dark:text-gray-300 mr-3">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#1A2432]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        {page === "login" && <Login onLogin={handleLogin} onSignup={() => setPage("signup")} />}
        {page === "signup" && <Signup onSignup={handleLogin} onLogin={() => setPage("login")} />}
        {page === "conversations" && user && (
          <ConversationsList user={user} onSelect={handleSelectConversation} />
        )}
        {page === "chat" && user && conversation && (
          <Chat user={user} conversation={conversation} onBack={handleBackToConversations} />
        )}
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm bg-[#1A2432] border-t border-gray-800 mt-auto">
        <p>© 2025 Vera. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App; 