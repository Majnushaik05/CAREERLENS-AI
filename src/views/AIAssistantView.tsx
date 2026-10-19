import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import { safeAskAssistant } from '../services/careerService';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface AIAssistantViewProps {
  analysis: ResumeAnalysis | null;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! I am your Career Lens Career & Resume Consultant. Ask me anything about tailoring your resume, structuring STAR behavioral responses, benchmarking compensation, or transitioning between engineering, data, and management domains.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        { role: 'assistant', content: 'Here is tailored guidance: Focus on quantifiable accomplishments, clear role keywords, and structured STAR evidence.' },
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

  const quickPrompts = [
    'How can I raise my resume score past 90?',
    'What are the strongest STAR behavioral stories for software engineers?',
    'How do I pivot from QA to DevOps / Cloud engineering?',
    'How should I respond when an employer asks for expected salary?',
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Career Consultant</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-blue-600 font-bold">Interactive Advisory</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Career &amp; Recruitment Advisory Consultant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Get real-time answers on resume positioning, career transitions, behavioral question structure, and salary negotiation.
        </p>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[560px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Consultant is synthesizing career recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your career or interview question..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
