import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ChatbotWindow = ({ onClose }) => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the BillingPro Assistant. Ask me about sales, revenue, profit, inventory, staff or billing help!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const adminSuggestions = ["Today's revenue", "Low stock", "Top products", "Top staff"];
  const staffSuggestions = ["My sales today", "My sales this week", "Billing help", "My returns"];
  const suggestions = isAdmin() ? adminSuggestions : staffSuggestions;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post("/chatbot", { message: msg });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed bottom-20 right-5 w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">BillingPro Assistant</p>
            <p className="text-indigo-200 text-xs mt-0.5">Powered by your data</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
        {suggestions.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            className="shrink-0 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full hover:bg-indigo-100 transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-indigo-600" />
            </div>
            <div className="bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isAdmin() ? "Ask about sales, stock, profit..." : "Ask about your sales, billing..."}
            className="flex-1 px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            autoComplete="off"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white flex items-center justify-center transition-colors shrink-0">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWindow;