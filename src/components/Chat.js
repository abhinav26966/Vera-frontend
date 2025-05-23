import React, { useState, useRef, useEffect } from "react";
import { sendMessage, sendVoiceMessage, getMessages } from "../api";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "../markdown.css"; // Import the markdown styles

// Set marked options for security and features
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false, // We'll use DOMPurify instead
});

// Function to safely convert markdown to sanitized HTML
const markdownToSafeHTML = (markdown) => {
  try {
    // Convert markdown to HTML, then sanitize it
    const rawHTML = marked(markdown);
    return DOMPurify.sanitize(rawHTML, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li',
        'strong', 'em', 'code', 'pre', 'blockquote', 'br', 'hr', 'span'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    });
  } catch (error) {
    console.error("Markdown processing error:", error);
    return markdown; // Return original text if parsing fails
  }
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "2rem auto",
    color: "white",
  },
  button: {
    backgroundColor: "blue",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
  },
  chatContainer: {
    minHeight: 300,
    border: "1px solid #ccc",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    overflowY: "auto",
    maxHeight: "60vh",
    backgroundColor: "#f9f9f9",
  },
  userMessage: {
    textAlign: "right",
    margin: "8px 0",
    padding: "8px 12px",
    backgroundColor: "#0084ff",
    color: "white",
    borderRadius: "18px 18px 0 18px",
    maxWidth: "70%",
    marginLeft: "auto",
    wordWrap: "break-word",
  },
  aiMessage: {
    textAlign: "left",
    margin: "8px 0",
    padding: "8px 12px",
    backgroundColor: "#e5e5ea",
    color: "#000",
    borderRadius: "18px 18px 18px 0",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  markdownContent: {
    // For proper markdown display
    '& p': { margin: '0 0 8px 0' },
    '& pre': { background: '#f0f0f0', padding: '8px', borderRadius: '4px', overflowX: 'auto' },
    '& code': { fontFamily: 'monospace', fontSize: '0.9em' },
    '& ul, & ol': { paddingLeft: '20px', margin: '8px 0' },
    '& blockquote': { borderLeft: '4px solid #ccc', paddingLeft: '8px', margin: '8px 0' },
  },
  inputContainer: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  sendButton: {
    backgroundColor: "#0084ff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  micButton: {
    backgroundColor: "#0084ff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
    color: "#ff3b30",
  },
  recordingDot: {
    width: "10px",
    height: "10px",
    backgroundColor: "#ff3b30",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  scrollbarStyles: {
    scrollbarWidth: 'thin',
    scrollbarColor: '#1f2937 transparent',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: '20px',
    }
  },
};

export default function Chat({ user, conversation, onBack }) {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [typingIndicatorKey, setTypingIndicatorKey] = useState(Date.now());
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      // Reset height to auto to get correct scrollHeight
      inputRef.current.style.height = 'auto';
      
      // Set the height based on scrollHeight with min height of 44px for small screens and 52px for larger screens
      const minHeight = window.innerWidth < 640 ? 44 : 52;
      const maxHeight = 120; // Max height before scrolling
      
      const newHeight = Math.min(Math.max(inputRef.current.scrollHeight, minHeight), maxHeight);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  // Adjust height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      adjustTextareaHeight();
    }
  }, []);

  // Handle window resize for textarea
  useEffect(() => {
    const handleResize = () => {
      adjustTextareaHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMessages(conversation.id);
        setMessages(data.map(m => ({ 
          sender: m.sender, 
          message: m.message,
          timestamp: new Date().toISOString(), // Add timestamps for display
        })));
      } catch (err) {
        setError(`Failed to load messages: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const message = input.trim(); // Store the input value before clearing
    setInput(""); // Clear input immediately
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    // Generate a new typing indicator key to ensure a fresh animation
    setTypingIndicatorKey(Date.now());
    
    await sendUserMessage(message);
  };

  const sendUserMessage = async (userMessage) => {
    setLoading(true);
    setError("");
    try {
      setMessages(msgs => [...msgs, { 
        sender: "User", 
        message: userMessage,
        timestamp: new Date().toISOString(),
      }]);
      // Send to backend
      const res = await sendMessage(conversation.id, userMessage);
      
      setMessages(msgs => [...msgs, { 
        sender: "AI", 
        message: res.message,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Function to play audio from base64 data
  const playAudio = (base64Data, contentType = 'audio/mpeg') => {
    if (!base64Data) return;
    
    try {
      // Create a data URL from base64 data
      const audioUrl = `data:${contentType};base64,${base64Data}`;
      console.log("Playing audio from data URL");
      
      // Create an audio element
      const audio = new Audio(audioUrl);
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => console.log("Audio ready to play"));
      audio.addEventListener('error', (e) => console.error("Audio error:", e));
      
      // Play the audio
      audio.play()
        .then(() => console.log("Audio playback started"))
        .catch(e => {
          console.warn("Audio playback failed:", e);
          setError("Audio playback failed: " + e.message);
        });
    } catch (e) {
      console.error("Error creating audio:", e);
      setError("Error creating audio: " + e.message);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up data handling
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Set up stop handling
      mediaRecorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setLoading(true);
        setError("");
        
        // Generate a new typing indicator key
        setTypingIndicatorKey(Date.now());
        
        try {
          // Send to backend
          const response = await sendVoiceMessage(conversation.id, user.id, audioBlob);
          
          // Play audio response if available
          if (response.audio_data) {
            playAudio(response.audio_data, response.content_type || 'audio/mpeg');
          }
          
          setMessages(msgs => [
            ...msgs,
            { 
              sender: "User", 
              message: response.user_message || "[No transcript]",
              timestamp: new Date().toISOString(),
            },
            { 
              sender: "AI", 
              message: response.ai_message || "[No AI response]",
              timestamp: new Date().toISOString(),
            }
          ]);
        } catch (err) {
          setError(`Voice processing failed: ${err.message}`);
        } finally {
          setLoading(false);
          stream.getTracks().forEach(track => track.stop());
          // Focus input after recording
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
      console.error("Microphone access error:", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format timestamp for message bubbles
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const msgDate = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(msgDate);
  };

  // Handle Enter key for sending, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Add smooth scrolling to the document
  useEffect(() => {
    // Add smooth scrolling to the whole document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col h-screen bg-[#121A24] overflow-hidden">
      <div className="sticky top-0 z-10 flex-shrink-0 p-2 sm:p-4 border-b border-gray-800 bg-[#121A24] shadow-md">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center text-gray-400 hover:text-blue-400 transition-colors duration-300 mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm sm:text-lg font-medium shadow-md mr-2 sm:mr-3 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl text-align-center md:text-2xl font-bold text-gray-400">Vera</h1>
          </div>
          
          <div className="h-10 w-10 opacity-0">
            {/* Invisible spacer for alignment */}
          </div>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-2 sm:p-4 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500">
              <div className="relative w-16 sm:w-20 h-16 sm:h-20 mb-4">
                <div className="absolute inset-0 bg-blue-400/10 rounded-full animate-ping"></div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="relative flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-blue-600/10 rounded-full backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-center font-medium text-gray-400 mb-1 text-sm sm:text-base">Send a message to start chatting</p>
              <p className="text-center font-large text-xs sm:text-sm text-gray-100">Hey there 👋🏽, I'm Vera, your hotel assistant. Ask about room bookings, amenities, or services</p>
            </div>
          )}
        
          <div className="space-y-3 sm:space-y-5 flex-grow">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.sender === "User" ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {m.sender !== "User" && (
                  <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                <div 
                  className={`max-w-[75%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                    m.sender === "User" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-md" 
                      : "bg-[#212A39] text-gray-200 rounded-bl-none shadow-md border border-gray-700"
                  } relative group hover:shadow-xl transition-all duration-300`}
                >
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:text-gray-200 prose-headings:text-gray-100 prose-a:text-blue-400 prose-sm sm:prose-base"
                    dangerouslySetInnerHTML={{ __html: markdownToSafeHTML(m.message) }}
                  />
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {formatMessageTime(m.timestamp)}
                  </div>
                </div>
                {m.sender === "User" && (
                  <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ml-2 shadow-md text-xs sm:text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div 
                key={typingIndicatorKey}
                className="flex justify-start animate-fade-in"
              >
                <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="max-w-[75%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-[#212A39] text-gray-200 rounded-bl-none shadow-md border border-gray-700 relative">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-bounce" 
                         style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-bounce" 
                         style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-300 animate-bounce" 
                         style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 transform -translate-x-1/2 w-full max-w-xl sm:max-w-2xl md:max-w-3xl px-4 z-10">
          <div className="bg-red-900/20 text-red-400 p-3 sm:p-4 rounded-lg border border-red-800/40 shadow-lg animate-pulse text-xs sm:text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 transform -translate-x-1/2 w-full max-w-xl sm:max-w-2xl md:max-w-3xl px-4 z-10">
          <div className="flex items-center text-red-400 animate-pulse bg-red-500/10 p-2 rounded-lg shadow-lg border border-red-600/20 text-xs sm:text-sm">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2 animate-ping"></div>
            <span className="font-medium">Recording... {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}
      
      <div className="sticky bottom-0 z-10 flex-shrink-0 p-2 sm:p-4 bg-[#121A24] border-t border-gray-800 shadow-lg">
        <div className="max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <div className="relative flex-grow">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading || isRecording}
                rows="1"
                className="w-full py-3 sm:py-4 pl-3 sm:pl-5 pr-20 sm:pr-24 rounded-full bg-[#212A39] text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300 placeholder-gray-500 text-sm sm:text-base resize-none overflow-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent"
                style={{ 
                  minHeight: window.innerWidth < 640 ? '44px' : '52px',
                  maxHeight: '120px',
                  paddingTop: window.innerWidth < 640 ? '14px' : '16px',
                  paddingBottom: window.innerWidth < 640 ? '14px' : '16px',
                  lineHeight: '1.4'
                }}
              />
            </div>
          
            <div className="absolute right-1.5 sm:right-2 flex space-x-1 sm:space-x-2">
              <button 
                type="submit" 
                disabled={loading || !input.trim() || isRecording}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  loading || !input.trim() || isRecording 
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                } transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#121A24]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" transform="rotate(90, 10, 10)" />
                </svg>
              </button>
            
              <button 
                type="button" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  loading 
                    ? "bg-gray-700 cursor-not-allowed"
                    : isRecording 
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-md animate-pulse" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                } transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#121A24]`}
              >
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="6" y="6" width="8" height="8" fill="white" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 