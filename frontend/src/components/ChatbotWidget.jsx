import React, { useState, useContext } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChatbotWidget = () => {
  const { token, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your HMS AI Clinical Assistant. Ask me any medical questions, clinical guidelines, or system actions!", sender: 'ai' }
  ]);

  const handleSend = async () => {
    if (message.trim() === '') return;
    
    const userMsg = { text: message, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            name: user?.fullName || 'HMS User',
            role: user?.role || 'DOCTOR'
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { text: data.text, sender: 'ai' }]);
      } else {
        setMessages(prev => [...prev, { text: "I apologize, but I encountered an error. Please try again.", sender: 'ai' }]);
      }
    } catch (err) {
      console.error('Chatbot request error:', err);
      setMessages(prev => [...prev, { text: "Connection error. Make sure the HMS backend is running.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-[450px] bg-white rounded-3xl shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#f4f7fb] p-4 flex justify-between items-center border-b border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                AI
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Medical Assistant</span>
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Expert Clinical Agent</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 p-4 h-[350px] overflow-y-auto flex flex-col gap-4 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-sm font-semibold' 
                    : 'bg-[#f4f7fb] text-slate-700 rounded-tl-sm border border-slate-100 font-medium whitespace-pre-line'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#f4f7fb] text-slate-400 p-3 rounded-2xl rounded-tl-sm text-sm border border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center bg-[#f4f7fb] rounded-full p-1 border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:shadow-[inset_2px_2px_5px_rgba(249,115,22,0.1),inset_-2px_-2px_5px_rgba(255,255,255,1)] transition-all">
              <input 
                type="text" 
                placeholder="Ask a medical question..." 
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-slate-700 font-medium"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                className="p-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm cursor-pointer border-none disabled:opacity-50 flex items-center justify-center"
                disabled={!message.trim() || isTyping}
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
