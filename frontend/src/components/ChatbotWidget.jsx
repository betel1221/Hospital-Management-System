import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello Dr. Jenkins! I'm your AI assistant. How can I help you today?", sender: 'ai' }
  ]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    setMessages([...messages, { text: message, sender: 'user' }]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "I can look up patient records, analyze symptoms, or help with scheduling. What do you need?", sender: 'ai' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-3xl shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#f4f7fb] p-4 flex justify-between items-center border-b border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                AI
              </div>
              <span className="font-bold text-slate-800">Medical Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 p-4 h-80 overflow-y-auto flex flex-col gap-4 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-sm' 
                    : 'bg-[#f4f7fb] text-slate-700 rounded-tl-sm border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center bg-[#f4f7fb] rounded-full p-1 border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:shadow-[inset_2px_2px_5px_rgba(249,115,22,0.1),inset_-2px_-2px_5px_rgba(255,255,255,1)] transition-all">
              <input 
                type="text" 
                placeholder="Ask about a patient..." 
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-slate-700 font-medium"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm cursor-pointer border-none disabled:opacity-50"
                disabled={!message.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-[0_4px_20px_0_rgba(249,115,22,0.4)] flex items-center justify-center hover:bg-orange-600 hover:scale-105 transition-all active:scale-95 cursor-pointer border-none"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
