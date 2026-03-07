import { Bot, User } from "lucide-react";

const ChatMessage = ({ message }) => {
  const isBot = message.role === "assistant";

  return (
    <div className={`flex gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-indigo-600" />
        </div>
      )}
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isBot
          ? "bg-gray-100 text-gray-800 rounded-tl-sm"
          : "bg-indigo-600 text-white rounded-tr-sm"
      }`}>
        {message.content}
      </div>
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;