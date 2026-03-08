import { useState, useRef, useEffect } from 'react';
import AgentCard from './AgentCard';

export default function ChatPanel({ agent, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Greetings. I am ${agent.agent_name}. ${agent.agent_bio?.split('.')[0] || 'How can I assist you today?'}`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: agent.agent_system_prompt || `You are ${agent.agent_name}, an AI agent from ${agent.city}.`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Signal lost. Please try again...' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col slide-in-right"
      style={{ width: '380px', background: 'rgba(5, 5, 16, 0.97)', borderLeft: '1px solid rgba(0, 245, 255, 0.15)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }}
          />
          <span className="font-display text-xs text-white/60 tracking-widest uppercase">
            Agent Chat
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Agent card */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <AgentCard agent={agent} compact />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed"
              style={
                msg.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, #00f5ff20, #7c3aed30)',
                      border: '1px solid rgba(0, 245, 255, 0.25)',
                      color: 'rgba(255,255,255,0.9)'
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.75)'
                    }
              }
            >
              {msg.role === 'assistant' && (
                <span className="text-xs neon-cyan font-display mr-1">
                  {agent.agent_name}:
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div className="flex gap-1 items-center">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#00f5ff', animationDelay: '0ms' }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#00f5ff', animationDelay: '150ms' }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#00f5ff', animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.agent_name}...`}
            rows={2}
            className="input-field flex-1 rounded-xl px-4 py-3 text-sm resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            →
          </button>
        </div>
        <p className="text-white/20 text-xs font-body mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
