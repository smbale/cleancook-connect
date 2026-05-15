import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, X, Loader2, Sparkles, BrainCircuit } from "lucide-react";

export const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Good day. I am the CleanCook Assistant. How may I assist your inquiry into the energy transition today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", content: "I encounter a connection difficulty. Please retry shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        id="chat"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 flex flex-col items-center gap-2 group z-40"
      >
        <div className="bg-brand-text text-white p-5 rounded-full shadow-2xl group-hover:scale-105 transition-all outline outline-offset-4 outline-brand-text/10">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <span className="text-[9px] uppercase tracking-editorial font-bold text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">Expert AI</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-32 right-10 w-[90vw] md:w-[400px] h-[650px] bg-brand-bg rounded-none shadow-[20px_20px_0px_0px_rgba(45,42,38,0.05)] border border-brand-text/10 z-50 flex flex-col overflow-hidden"
          >
            <div className="border-b border-brand-text/10 p-8 flex justify-between items-center bg-brand-paper">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent">Assistant</span>
                <span className="font-serif text-xl italic text-brand-text">The Guide</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-text/30 hover:text-brand-text transition-colors"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-10 space-y-10 scrollbar-hide"
            >
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] ${
                    m.role === 'user' 
                      ? 'bg-brand-muted p-6 rounded-none text-brand-text border-l-4 border-brand-accent' 
                      : 'bg-transparent border-t border-brand-text/5 pt-4'
                  }`}>
                    {m.role === 'ai' && <div className="text-[9px] uppercase tracking-widest font-bold text-brand-accent mb-4">— Analysis</div>}
                    <div className="markdown-body text-sm leading-relaxed font-light">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40 animate-pulse italic">Consulting Data Library...</div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-brand-text/10 bg-brand-bg">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter your inquiry..."
                  className="w-full bg-transparent border-b border-brand-text/20 py-4 focus:outline-none focus:border-brand-accent transition-colors font-serif italic text-lg"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-text hover:text-brand-accent transition-all"
                  title="Send Message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
