import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getResponse } from "../utils/intents.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Color palette
const colors = [
  "rgb(247, 244, 46)",
  "rgb(23, 207, 220)",
  "rgb(242, 30, 167)"
];

export default function AdvancedChatBolt() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("stemChatHistory");
    return saved
      ? JSON.parse(saved)
      : [
          {
            from: "bot",
            text: "🤖 Hi! I'm your STEM Inspires assistant. Choose a question below or ask me about robotics, donations, or our programs!",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickQuestions = [
    "What is STEM Inspires?",
    "How can I donate?",
    "What is FIRST LEGO League?",
    "How do I start a team?",
    "Who are the founders?",
  ];

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Save chat
  useEffect(() => {
    localStorage.setItem("stemChatHistory", JSON.stringify(messages));
  }, [messages]);

  // Start listening
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn’t support speech recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();
    setListening(true);

    new Audio("/start-beep.mp3").play().catch(() => {});

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleSend(text);
    };

    recognition.onerror = () => setListening(false);

    recognition.onend = () => {
      setListening(false);
      new Audio("/end-beep.mp3").play().catch(() => {});
    };
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Stop text-to-speech
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Send messages
  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    setShowSuggestions(false);

    const userMsg = {
      from: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    let botReply;

    try {
      if (!navigator.onLine) throw new Error("Offline mode");

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      botReply = data.reply || getResponse(text);
    } catch {
      botReply = getResponse(text);
    }

    const delay = Math.min(1800, 400 + botReply.length * 25);

    setTimeout(() => {
      setIsTyping(false);

      const botMsg = {
        from: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setShowSuggestions(true);

      // Text-to-speech
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(botReply);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }, delay);
  };

  const resetChat = () => {
    localStorage.removeItem("stemChatHistory");
    setMessages([
      {
        from: "bot",
        text: "Chat cleared. 👋 I'm ready to help again!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 group md:block"
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-60 group-hover:opacity-90 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}
          ></div>
          <div
            className="relative p-4 rounded-full shadow-xl border border-white/10"
            style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[2]})` }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.405 0-2.724-.317-3.91-.88L3 20l1.88-5.09C3.317 13.724 3 12.405 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 md:bottom-24 md:right-6 md:left-auto flex justify-center md:justify-end items-end z-50 p-0 md:p-4"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col w-full h-full md:w-full md:max-w-md md:h-[500px] overflow-hidden">
              
              {/* Header */}
              <div className="p-5 flex justify-between items-center"
                   style={{ background: ` ${colors[1]}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-2xl">🤖</div>
                  <div>
                    <h3 className="font-bold text-white">STEM Inspires Bot</h3>
                    <p className="text-xs text-white/80">Your virtual STEM buddy</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition">✕</button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-gray-50/60 to-white dark:from-gray-800/40 dark:to-gray-900">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-bold shadow ${
                      msg.from === "bot" ? "bg-gradient-to-br from-[rgb(23,207,220)] to-[rgb(23,207,220,0.5)]" : "bg-gradient-to-br from-gray-700 to-gray-900"
                    }`}>
                      {msg.from === "bot" ? "S" : "U"}
                    </div>
                    <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.from === "bot"
                        ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                        : "text-white"
                      }`}
                      style={msg.from === "user"
                        ? { background: ` ${colors[1]}` }
                        : {}
                      }>
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-gray-400 mt-1">{msg.time}</span>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[2]})` }}>
                      S
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                      <motion.div className="flex space-x-2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                        <div className="w-2 h-2 bg-[rgb(247,244,46)] rounded-full" />
                        <div className="w-2 h-2 bg-[rgb(23,207,220)] rounded-full" />
                        <div className="w-2 h-2 bg-[rgb(242,30,167)] rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Quick Suggestions */}
                {showSuggestions && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500 mb-3">Try asking one of these:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickQuestions.map((q, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.05 }} onClick={() => handleSend(q)}
                          className="px-4 py-2 bg-gradient-to-r from-[rgb(23,207,220)] via-[rgb(242,30,167)] to-[rgb(23,207,220)] text-gray-900 font-medium rounded-full text-xs shadow hover:shadow-lg transition-all">
                          {q}
                        </motion.button>
                      ))}
                    </div>

                    {/* Voice Controls */}
                    <div className="mt-4 flex flex-col items-center gap-2">
                      {!listening ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startListening}
                          className="px-5 py-2 rounded-full text-sm font-semibold shadow-md 
                                     bg-gradient-to-r from-[rgb(23,207,220)] to-[rgb(23,207,220,0.1)] text-gray-900"
                        >
                          🎤 Speak a Question
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopListening}
                          className="px-5 py-2 rounded-full text-sm font-semibold shadow-md 
                                     bg-red-500 text-white"
                        >
                          ⛔ Stop Listening
                        </motion.button>
                      )}

                      {isSpeaking && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopSpeaking}
                          className="px-5 py-2 rounded-full text-sm font-semibold shadow-md 
                                     bg-red-600 text-white"
                        >
                          🔇 Stop Reading
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about FLL, donations, or our programs..."
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(23,207,220)] text-sm"
                  />
                  <button type="submit"
                    className="p-3 rounded-xl text-white font-bold shadow-md"
                    style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[2]})` }}
                  >
                    ➤
                  </button>
                </form>

                <button onClick={resetChat}
                  className="mt-3 text-xs text-gray-500 hover:text-[rgb(242,30,167)] underline w-full text-center">
                  Clear chat
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
