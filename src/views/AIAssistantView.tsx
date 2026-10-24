import React, { useState, useRef, useEffect } from 'react';
import { ResumeAnalysis } from '../types';
import { safeAskAssistant } from '../services/careerService';
import { Bot, Send, User, Sparkles, Copy, Check, RotateCcw } from 'lucide-react';

interface AIAssistantViewProps {
  analysis: ResumeAnalysis | null;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! I am your Career Lens Career & Recruitment Consultant. Ask me anything about tailoring your resume, crafting STAR behavioral stories, benchmarking compensation, or preparing for high-stakes technical interviews.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const newMsgs = [...messages, { role: 'user' as const, content: query }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const reply = await safeAskAssistant(newMsgs, analysis?.extracted_text || '');
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content:
            'Focus your positioning on measurable business impact (percentage improvements, latency reductions, users served), clean role-specific keywords, and structured STAR evidence.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chat session reset. What career goal, resume challenge, or interview question would you like to explore next?',
      },
    ]);
  };

  const quickPrompts = [
    'How can I raise my resume score past 90?',
    'What are the strongest STAR behavioral stories for software engineers?',
    'What is the best script to negotiate a higher salary counter-offer?',
    'How do I pivot from QA to DevOps / Cloud engineering?',
    '3 portfolio projects that get engineering interviews',
  ];

  return (
    <div className="space-y-6 max-w-4xl selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CAREER CONSULTANT</span>
            <span>·</span>
            <span className="text-blue-600 font-bold">INTELLIGENT ADVISORY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Career &amp; Recruitment Advisory Consultant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Get personalized, non-repetitive answers on resume optimization, salary negotiation scripts, and behavioral interview storytelling.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition flex items-center gap-1.5"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col h-[580px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="relative group max-w-2xl">
                <div
                  className={`p-4.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 border border-slate-200 shadow-2xs transition opacity-0 group-hover:opacity-100"
                    title="Copy advice"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Advisor is synthesizing personalized recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-2 overflow-x-auto">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg transition shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center gap-3 bg-white">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question about salary negotiation, resume score, or behavioral answers..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
