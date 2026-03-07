import { useState } from "react";
import { Bot, X } from "lucide-react";
import ChatbotWindow from "./ChatbotWindow";

const ChatbotButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatbotWindow onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        title="BillingPro Assistant"
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>
    </>
  );
};

export default ChatbotButton;