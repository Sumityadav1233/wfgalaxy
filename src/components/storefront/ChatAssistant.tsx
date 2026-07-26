'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt?: string;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID
  useEffect(() => {
    let savedId = localStorage.getItem('wf_galaxy_chat_session');
    if (!savedId) {
      savedId = `session-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      localStorage.setItem('wf_galaxy_chat_session', savedId);
    }
    setSessionId(savedId);
  }, []);

  // Listen for open event from Mobile BottomNav
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setHasNewMessage(false);
    };
    window.addEventListener('open-chat-assistant', handleOpenChat);
    return () => window.removeEventListener('open-chat-assistant', handleOpenChat);
  }, []);

  // Fetch chat history once session ID is ready
  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setMessages(data);
          } else {
            // Seed a welcome message if history is empty
            setMessages([
              {
                role: 'assistant',
                text: 'Namaste! Welcome to WF GALAXY. I can help you find products, check sizing, track your order status, or provide directions to our shop at Shiv Chowk, Janakpur. How can I assist you today?',
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };

    fetchHistory();
  }, [sessionId]);

  // Scroll to bottom whenever messages change or drawer opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Append user message locally
    const userMsg: Message = { role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, sessionId }),
      });

      if (res.ok) {
        const savedReply = await res.json();
        setMessages((prev) => [...prev, savedReply]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: "I am having trouble connecting to the GALAXY network right now. Please call us directly at 9709141876 for urgent help!",
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I am having trouble connecting to the GALAXY network right now. Please call us directly at 9709141876 for urgent help!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMessageText = (text: string) => {
    // Simple markdown helper to support **bold text** and [links](/url)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Replace markdown links and bold formatting
    const formattedText = text
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(linkRegex, '<a href="$2" class="underline text-accent hover:text-accent-hover font-medium">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] rounded-lg border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary">
                <Sparkles className="h-4 w-4 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wider">GALAXY ASSISTANT</h3>
                <span className="text-[10px] text-accent font-light">Online & Ready</span>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-neutral-400 hover:text-primary-foreground p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted border border-border text-primary rounded-tl-none leading-relaxed'
                  }`}
                >
                  {parseMessageText(msg.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted border border-border text-primary rounded-lg rounded-tl-none px-4 py-2.5 text-sm shadow-xs flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="border-t border-border p-3 flex bg-background">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about products, orders, sizing..."
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-muted/30 focus:outline-hidden focus:border-accent focus:bg-background transition-colors text-primary"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="ml-2 bg-primary hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-primary-foreground p-2 rounded-md transition-colors"
              aria-label="Send message"
            >
              <Send className="h-4 w-4 stroke-[1.8]" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Chat Button (Desktop Only - Mobile uses BottomNav Chat) */}
      <button
        onClick={toggleChat}
        className={`hidden md:flex h-14 w-14 rounded-full bg-primary hover:bg-neutral-800 text-accent items-center justify-center shadow-2xl transition-all active:scale-95 duration-200 border border-neutral-800 focus:outline-hidden glow-btn ${
          hasNewMessage ? 'animate-bounce' : ''
        }`}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 stroke-[1.5]" />
        ) : (
          <MessageSquare className="h-6 w-6 stroke-[1.5]" />
        )}
      </button>
    </div>
  );
};
export default ChatAssistant;
