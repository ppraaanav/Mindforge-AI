const formatTime = (value) => {
  const date = new Date(value || Date.now());
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatBubble = ({ role, content, timestamp }) => {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm md:max-w-[75%] ${
          isAssistant
            ? "rounded-bl-md border border-ink-100 bg-white text-ink-800"
            : "rounded-br-md bg-brand-600 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        <p className={`mt-2 text-[11px] ${isAssistant ? "text-ink-400" : "text-white/80"}`}>
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
