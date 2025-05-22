import React, { useState, useEffect } from "react";
import { createConversation, getConversations } from "../api";

export default function ConversationsList({ user, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, [user.id]);

  const loadConversations = async () => {
    setLoading(true);
    setError("");
    try {
      const convs = await getConversations(user.id);
      setConversations(convs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const conv = await createConversation(user.id);
      onSelect(conv);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If it's today, show time only
    if (date.toDateString() === today.toDateString()) {
      return new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      }).format(date);
    }
    // If it's yesterday, show "Yesterday" and time
    else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      }).format(date)}`;
    }
    // Otherwise show date
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };

  // Get a preview of the message
  const getPreview = (message) => {
    if (!message) return "New conversation";
    // Remove markdown syntax for preview
    return message
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/```[\s\S]*?```/g, '[Code Block]') // Code blocks
      .substring(0, 60) + (message.length > 60 ? "..." : "");
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-medium shadow-md mr-3 transform transition-transform hover:scale-105 animate-pulse-fast">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-300">Conversations</h1>
            <p className="text-gray-500 text-xs sm:text-sm md:text-base truncate max-w-[200px] md:max-w-xs">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleCreate} 
          disabled={loading}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-white font-medium text-sm flex items-center justify-center ${
            loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          } transition-all duration-300 shadow-md transform hover:scale-105 hover:shadow-lg sm:self-start`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-red-800/40 shadow-lg animate-pulse">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {loading && conversations.length === 0 ? (
        <div className="bg-[#1A2432] rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700/50">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            <div className="h-3 sm:h-4 bg-gray-700/60 rounded-full w-3/4"></div>
            <div className="h-3 sm:h-4 bg-gray-700/60 rounded-full w-1/2"></div>
            <div className="h-3 sm:h-4 bg-gray-700/60 rounded-full w-5/6"></div>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-[#1A2432] rounded-xl shadow-lg p-6 sm:p-8 text-center border border-gray-700/50">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-blue-400/10 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/10 rounded-full backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-200 mb-2">No conversations yet</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">Start a new chat to begin</p>
          <button 
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-white text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md transform hover:scale-105 hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Chat
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => onSelect(conv)} 
              className="bg-[#1A2432] rounded-xl shadow-lg p-3 sm:p-4 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-700/50 transform hover:scale-[1.02] hover:border-blue-500/30 group"
            >
              <div className="flex items-start">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium shadow-md mr-2 sm:mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-gray-200 font-medium text-sm sm:text-base truncate pr-2">
                      {conv.latest_message ? getPreview(conv.latest_message).substring(0, 25) + (conv.latest_message.length > 25 ? "..." : "") : "New Conversation"}
                    </h3>
                    <p className="text-gray-500 text-xs flex-shrink-0 whitespace-nowrap group-hover:text-blue-400 transition-colors duration-300">
                      {formatDate(conv.created_at)}
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
                    {conv.latest_message ? getPreview(conv.latest_message) : "Start a new conversation"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 