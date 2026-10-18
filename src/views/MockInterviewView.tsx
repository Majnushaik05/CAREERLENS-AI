import React, { useState, useEffect, useRef } from 'react';
import { ResumeAnalysis, InterviewQuestionItem, InterviewScore } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Play,
  Square,
  Radio,
  FileCheck,
} from 'lucide-react';

interface MockInterviewViewProps {
  analysis: ResumeAnalysis | null;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ analysis }) => {
  const [role, setRole] = useState(analysis?.target_role || 'Senior Software Engineer');
  const [company, setCompany] = useState('Apex Cloud Innovations');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [transcript, setTranscript] = useState<InterviewQuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [interviewScore, setInterviewScore] = useState<InterviewScore | null>(null);

  // Voice Assistant States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswer(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Text to Speech for Interviewer
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!voiceEnabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Microphone input for candidate
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setTranscript([]);
    setInterviewScore(null);
    try {
      const res = await fetch('/api/mock-interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          company,
          resume_text: analysis?.extracted_text || '',
          transcript: [],
        }),
      });
      const data = await res.json();
      const question =
        data.next_question ||
        `Please introduce yourself and explain your relevant engineering background for the ${role} position.`;
      setCurrentQuestion(question);
      setInterviewStarted(true);

      if (voiceEnabled) {
        setTimeout(() => speakText(question), 300);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!currentAnswer.trim()) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    const updated = [...transcript, { question: currentQuestion, answer: currentAnswer }];
    setTranscript(updated);
    setCurrentAnswer('');
    setLoading(true);
    stopSpeaking();

    if (updated.length >= 4) {
      await scoreInterview(updated);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/mock-interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          company,
          resume_text: analysis?.extracted_text || '',
          transcript: updated,
        }),
      });
      const data = await res.json();
      const nextQ =
        data.next_question ||
        'What is an architectural or technical tradeoff you evaluated recently?';
      setCurrentQuestion(nextQ);

      if (voiceEnabled) {
        setTimeout(() => speakText(nextQ), 400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scoreInterview = async (t: InterviewQuestionItem[]) => {
    try {
      const res = await fetch('/api/mock-interview/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: t, role }),
      });
      const score: InterviewScore = await res.json();
      setInterviewScore(score);

      if (voiceEnabled) {
        speakText(
          `Your mock interview has been evaluated with an overall rating of ${score.overall} out of 100.`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            <span>Digital Interview Simulator</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="text-purple-600 font-bold">Voice &amp; Audio Cockpit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Online Mock Interview &amp; Voice Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Experience structured conversational interviews. The digital interviewer asks questions aloud via synthetic voice, and you can respond by speaking or typing.
          </p>
        </div>

        {/* Global Voice Assistant Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              voiceEnabled
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice Audio: {voiceEnabled ? 'ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* SETUP SCREEN */}
      {!interviewStarted && !interviewScore && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs max-w-xl space-y-5">
          <div>
            <h2 className="text-base font-black text-slate-900">Setup Mock Interview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {analysis
                ? `Questions will adapt to ${analysis.name}'s verified skills and project accomplishments.`
                : 'Questions will be generated for standard role requirements.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Employer / Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Apex Cloud Innovations"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-900 flex items-start gap-2.5">
              <Radio className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Digital Voice Assistant Active:</span>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Questions will be spoken aloud automatically. You can answer using the microphone or keyboard.
                </p>
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Initializing Interview Audio Simulation...</span>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Begin 4-Question Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW SESSION */}
      {interviewStarted && !interviewScore && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold text-slate-900">{company || 'Target Employer'}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>{role}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono tabular-nums font-semibold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Question {transcript.length + 1} of 4
                </span>
              </div>
            </div>

            {/* Past transcript items */}
            {transcript.map((t, idx) => (
              <div key={idx} className="space-y-2 text-xs border-b border-slate-100 pb-4">
                <div className="font-bold text-slate-900 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-purple-600 mr-2 font-mono tabular-nums">Q{idx + 1}:</span>
                    {t.question}
                  </div>
                  <button
                    onClick={() => speakText(t.question)}
                    className="p-1 text-slate-400 hover:text-purple-600 shrink-0"
                    title="Replay Question Audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-slate-700 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold mr-2">Candidate Response:</span>
                  {t.answer}
                </div>
              </div>
            ))}

            {/* Current Question Display with Speaking Waveform */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-0.5 flex items-center gap-2">
                      <span>Interviewer Inquiry</span>
                      {isSpeaking && (
                        <span className="flex items-center gap-1 text-emerald-600 font-mono text-[10px] lowercase animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          speaking aloud...
                        </span>
                      )}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-purple-950 leading-relaxed">
                      {currentQuestion}
                    </div>
                  </div>
                </div>

                {/* Voice Action Controls for Current Question */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(currentQuestion)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay Voice</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Audio Waveform when Interviewer is Speaking */}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-1 pt-1 h-4">
                  {[40, 75, 100, 60, 90, 45, 80, 55, 95, 70, 40].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-purple-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Answer Input Section with Speech-to-Text Microphone Integration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Candidate Response (STAR Model: Situation, Task, Action, Result)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono tabular-nums">{wordCount} words</span>
                </div>
              </div>

              {/* Textarea for Candidate response */}
              <div className="relative">
                <textarea
                  rows={5}
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Click 'Speak with Microphone' to record your answer by voice, or type your response here..."
                  className={`w-full p-4 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition ${
                    isListening
                      ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-300 focus:border-purple-500 bg-white'
                  }`}
                />

                {/* Microphone Recording Live Indicator */}
                {isListening && (
                  <div className="absolute bottom-3 left-3 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>Microphone Listening... Speak your answer</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* Microphone Speech-to-Text Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                      isListening
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 text-white" />
                        <span>Stop Voice Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-purple-600" />
                        <span>Speak Answer via Microphone</span>
                      </>
                    )}
                  </button>

                  {currentAnswer.trim() && (
                    <button
                      type="button"
                      onClick={() => setCurrentAnswer('')}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scoreInterview(transcript)}
                    disabled={transcript.length === 0}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    End &amp; Score Early
                  </button>

                  <button
                    type="button"
                    onClick={handleSendAnswer}
                    disabled={loading || !currentAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
                  >
                    {loading ? (
                      <span>Evaluating Response...</span>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINAL SCORECARD & EVALUATION */}
      {interviewScore && (
        <div className="max-w-3xl bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Mock Interview Scorecard</h2>
                <div className="text-xs text-slate-500">{role} Multi-Axis Evaluation</div>
              </div>
            </div>

            <button
              onClick={() => {
                setInterviewStarted(false);
                setInterviewScore(null);
                setTranscript([]);
                setCurrentAnswer('');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Interview</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall</div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums mt-0.5">
                {interviewScore.overall}/100
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communication</div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums mt-0.5">
                {interviewScore.communication}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evidence Ratio</div>
              <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
                {interviewScore.evidence}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Relevance</div>
              <div className="text-2xl font-black text-purple-600 font-mono tabular-nums mt-0.5">
                {interviewScore.relevance}%
              </div>
            </div>
          </div>

          {/* Visual Performance Dimensions Graph */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">Response Evaluation Breakdown</span>
            <div className="space-y-3">
              {[
                { label: 'Communication Clarity', score: interviewScore.communication, color: 'bg-blue-600' },
                { label: 'STAR Evidence & Metrics', score: interviewScore.evidence, color: 'bg-emerald-600' },
                { label: 'Domain & Role Alignment', score: interviewScore.relevance, color: 'bg-purple-600' },
              ].map((bar, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{bar.label}</span>
                    <span className="font-mono font-bold text-slate-900">{bar.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${bar.color} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${bar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Observed Strengths</span>
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 pl-5 list-disc">
                {interviewScore.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Targeted Growth Areas</span>
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 pl-5 list-disc">
                {interviewScore.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
