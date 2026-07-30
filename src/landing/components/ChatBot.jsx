import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const placeholderMessages = [
  { role: 'bot', text: 'Hey there! Welcome to I Am An Artist.' },
  { role: 'bot', text: 'I can help you explore artwork, find artists, or answer questions about our marketplace.' },
  { role: 'bot', text: 'How can I assist you today?' },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(placeholderMessages);
  const [input, setInput] = useState('');
  const [showGreeting, setShowGreeting] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const greetTimer = setTimeout(() => setShowGreeting(false), 4000);
    return () => clearTimeout(greetTimer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: "That's great! Our team will get back to you shortly. In the meantime, feel free to explore our marketplace!",
        },
      ]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      <AnimatePresence>
        {showGreeting && !open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl px-5 py-3 text-text-dark text-sm font-inter shadow-xl"
          >
            👋 Welcome to I Am An Artist.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card rounded-2xl w-[360px] max-w-[calc(100vw-48px)] flex flex-col shadow-2xl overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full green-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <div>
                  <p className="text-text-dark text-sm font-medium font-inter">Art Assistant</p>
                  <p className="flex items-center gap-1.5 text-text-muted text-[10px] font-inter">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-primary pulse-dot" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-dark transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 280, maxHeight: 320 }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-inter leading-relaxed ${
                      msg.role === 'user'
                        ? 'green-gradient text-white rounded-tr-sm'
                        : 'bg-cream text-text-dark rounded-tl-sm border border-border-light'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-cream border border-border-light px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-primary/40 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-green-primary/40 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 rounded-full bg-green-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-border-light">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-cream border border-border-light rounded-full text-text-dark text-sm font-inter placeholder:text-text-muted focus:outline-none focus:border-green-primary/30 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full green-gradient flex items-center justify-center hover:opacity-90 transition-all flex-shrink-0 disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-text-muted/40 text-[10px] text-center mt-2 font-inter">
                Powered by OpenRouter
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full green-gradient shadow-xl hover:opacity-90 transition-all flex items-center justify-center green-glow"
        aria-label="Toggle chat"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
