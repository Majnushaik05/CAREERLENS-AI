import React, { useState, useEffect, useRef } from 'react';
import { ResumeAnalysis, InterviewQuestionItem, InterviewScore } from '../types';
import { safeGetMockQuestion, safeScoreMockInterview } from '../services/careerService';
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
  Sparkles,
  Play,
  Square,
  Radio,
  FileCheck,
  Headphones,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
} from 'lucide-react';

interface MockInterviewViewProps {
  analysis: ResumeAnalysis | null;
}

const QUESTION_PRESETS = [3, 5, 10, 15, 20, 30, 50, 100];

const SAMPLE_STAR_ANSWERS: Record<string, string> = {
  intro:
    "I am an engineer with hands-on experience designing and deploying scalable services. In my previous work, I specialized in architecting reliable backend APIs, reducing system latency by 32%, and collaborating with cross-functional teams to deliver business-critical features on schedule.",
  technical:
    "When facing an architectural bottleneck, I profiled query patterns, introduced a distributed Redis caching layer with a single-flight mutex to avoid cache stampede, and optimized database indexing. This reduced p99 latency from 850ms to 95ms under peak traffic.",
  behavioral:
    "In a project with shifting requirements and tight deadlines, I broke the deliverables into phased MVP milestones, communicated transparently with stakeholders about tradeoffs, and delivered the core revenue-generating pipeline two days ahead of schedule.",
};

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ analysis }) => {
  const [role, setRole] = useState<string>(analysis?.target_role || 'Software Developer');
  const [company, setCompany] = useState<string>('');
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(5);
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [transcript, setTranscript] = useState<InterviewQuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [interviewScore, setInterviewScore] = useState<InterviewScore | null>(null);

  // Voice Assistant States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up speech recognition & synthesis on unmount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
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

  // Speech recognition start
  const startListening = async () => {
    stopSpeaking();
    setMicStatusMsg(null);
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicStatusMsg('Speech recognition is not supported in this browser. You can type or use the sample STAR answers.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (permErr: any) {
          console.warn('Microphone permission check:', permErr);
        }
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg('Listening... Speak naturally.');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (finalTrans.trim()) {
          setCurrentAnswer((prev) =>
            prev.trim() ? `${prev.trim()} ${finalTrans.trim()}` : finalTrans.trim()
          );
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatusMsg('Microphone access denied. You can type your responses directly.');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Could not start recognition:', err);
      setIsListening(false);
      setMicStatusMsg('Microphone could not be started in this browser context. You can type or use sample dictation.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    if (interimText.trim()) {
      setCurrentAnswer((prev) =>
        prev.trim() ? `${prev.trim()} ${interimText.trim()}` : interimText.trim()
      );
      setInterimText('');
    }
    setMicStatusMsg('Microphone paused. Review and submit your answer.');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setTranscript([]);
    setInterviewScore(null);
    try {
      const data = await safeGetMockQuestion(role, company, analysis?.extracted_text || '', []);
      const question =
        data.next_question ||
        `Please introduce yourself and explain your relevant background for the ${role} position.`;
      setCurrentQuestion(question);
      setInterviewStarted(true);

      if (voiceEnabled) {
        setTimeout(
          () =>
            speakText(
              `Welcome to your CareerLens mock interview for ${role}. Here is Question 1 of ${targetQuestionCount}: ${question}`
            ),
          400
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scoreInterview = async (t: InterviewQuestionItem[]) => {
    try {
      setLoading(true);
      const score = await safeScoreMockInterview(t, role);
      setInterviewScore(score);

      if (voiceEnabled) {
        speakText(
          `Your mock interview evaluation is complete with a confidence rating of ${score.confidence_index || score.overall} out of 100.`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async () => {
    const fullAnswer = (currentAnswer + ' ' + interimText).trim();
    if (!fullAnswer) return;

    if (isListening) {
      stopListening();
    }

    const updated = [...transcript, { question: currentQuestion, answer: fullAnswer }];
    setTranscript(updated);
    setCurrentAnswer('');
    setInterimText('');
    setMicStatusMsg(null);
    stopSpeaking();

    // Check if target question count reached
    if (updated.length >= targetQuestionCount) {
      await scoreInterview(updated);
      return;
    }

    setLoading(true);
    try {
      const data = await safeGetMockQuestion(role, company, analysis?.extracted_text || '', updated);
      const nextQ =
        data.next_question ||
        'What is an architectural or technical tradeoff you evaluated recently?';
      setCurrentQuestion(nextQ);

      const feedbackPhrases = [
        'Thank you for that response. Strong context and clear technical ownership.',
        'Understood. Good emphasis on technical impact and problem resolution.',
        "Excellent response. Let's move deeper into your practical experience.",
        'Thank you for sharing that experience. Here is the next evaluation question.',
        'Great insight. Continuing with our competency exploration.',
      ];
      const feedback = feedbackPhrases[updated.length % feedbackPhrases.length];
      const fullSpeech = `${feedback} Question ${updated.length + 1} of ${targetQuestionCount}: ${nextQ}`;

      if (voiceEnabled) {
        setTimeout(() => speakText(fullSpeech), 400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishEarly = async () => {
    if (transcript.length === 0 && !currentAnswer.trim()) return;
    const finalTranscript = currentAnswer.trim()
      ? [...transcript, { question: currentQuestion, answer: currentAnswer.trim() }]
      : transcript;
    setTranscript(finalTranscript);
    setCurrentAnswer('');
    stopSpeaking();
    if (isListening) stopListening();
    await scoreInterview(finalTranscript);
  };

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const currentQIndex = transcript.length + 1;
  const progressPercent = Math.min(100, Math.round((transcript.length / targetQuestionCount) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-600 ring-4 ring-purple-100" />
            <span>AI Voice Mock Interview &amp; Confidence Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Realistic Role Mock Interview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Simulate authentic job interviews with adjustable question depth (1 to 100 questions). Speak or type your answers to receive a comprehensive interview confidence evaluation.
          </p>
        </div>

        {/* Global Voice Assistant Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              voiceEnabled
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>Voice Audio: {voiceEnabled ? 'ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* SETUP / CONFIGURATION SCREEN */}
      {!interviewStarted && !interviewScore && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <Sliders size={18} className="text-purple-600" />
              Configure Mock Interview Session
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize role, target company, and the exact question count (1 to 100) to test your interview stamina.
            </p>
          </div>

          <div className="space-y-5">
            {/* Target Role Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Position / Job Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Product Manager, Data Scientist..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* Target Company Name (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Company Name <span className="font-normal text-slate-400 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Microsoft, TechNova..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* Adjustable Question Volume (1 to 100) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Question Volume (1 to 100 Questions)
                </label>
                <span className="font-mono text-sm font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                  {targetQuestionCount} Questions
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {QUESTION_PRESETS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setTargetQuestionCount(cnt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetQuestionCount === cnt
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>

              {/* Slider for exact fine-tuning 1 to 100 */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-400">1</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={targetQuestionCount}
                  onChange={(e) => setTargetQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <span className="text-[11px] font-bold text-slate-400">100</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={targetQuestionCount}
                  onChange={(e) =>
                    setTargetQuestionCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                  }
                  className="w-16 text-center text-xs font-bold py-1.5 border border-slate-200 rounded-xl focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={startInterview}
              disabled={loading || !role.trim()}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin text-base">⟳</span>
              ) : (
                <Play size={16} />
              )}
              <span>{loading ? 'Preparing Interview Room...' : `Begin ${targetQuestionCount}-Question Mock Interview`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW ROOM */}
      {interviewStarted && !interviewScore && (
        <div className="space-y-5 max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="font-bold text-purple-700 flex items-center gap-1.5">
                <Briefcase size={14} />
                <span>{role} Mock Interview</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                Question {currentQIndex} of {targetQuestionCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* AI Interviewer Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  CareerLens AI Interviewer
                </span>
              </div>
              <button
                type="button"
                onClick={() => speakText(currentQuestion)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                <Volume2 size={14} />
                <span>Repeat Question</span>
              </button>
            </div>

            <p className="text-lg sm:text-xl font-bold leading-relaxed text-slate-100">
              &quot;{currentQuestion}&quot;
            </p>

            {isSpeaking && (
              <div className="mt-4 flex items-center gap-2 text-xs text-purple-300 animate-pulse">
                <Radio size={14} />
                <span>Interviewer speaking aloud...</span>
              </div>
            )}
          </div>

          {/* Candidate Response Workspace */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Your Spoken or Written Response
              </span>
              <span className="font-mono text-xs text-slate-400">
                {wordCount} words {wordCount >= 25 ? '✓ Good length' : ''}
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={currentAnswer + (interimText ? ' ' + interimText : '')}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your response or click the microphone button below to speak..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {micStatusMsg && (
              <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 p-2.5 rounded-xl flex items-center gap-2">
                <Sparkles size={14} />
                <span>{micStatusMsg}</span>
              </div>
            )}

            {/* Quick Sample STAR Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Quick STAR samples:</span>
              <button
                type="button"
                onClick={() => setCurrentAnswer(SAMPLE_STAR_ANSWERS.intro)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-purple-300"
              >
                + Professional Intro
              </button>
              <button
                type="button"
                onClick={() => setCurrentAnswer(SAMPLE_STAR_ANSWERS.technical)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-purple-300"
              >
                + Technical Architecture
              </button>
              <button
                type="button"
                onClick={() => setCurrentAnswer(SAMPLE_STAR_ANSWERS.behavioral)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-purple-300"
              >
                + Behavioral &amp; Conflict
              </button>
            </div>

            {/* Action Buttons: Microphone Toggle, Send Answer, Finish Early */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  <span>{isListening ? 'Stop Recording' : 'Voice Dictation'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishEarly}
                  disabled={transcript.length === 0 && !currentAnswer.trim()}
                  className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Finish &amp; Score Early
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendAnswer}
                disabled={loading || !(currentAnswer.trim() || interimText.trim())}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <span className="animate-spin text-sm">⟳</span> : <Send size={14} />}
                <span>
                  {currentQIndex >= targetQuestionCount
                    ? 'Submit Final Response & Calculate Score'
                    : 'Submit Answer & Continue'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL INTERVIEW SCORE & CONFIDENCE REPORT */}
      {interviewScore && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-7 animate-fade-in">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
                Evaluation Complete • {transcript.length} Question{transcript.length === 1 ? '' : 's'} Evaluated
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Mock Interview Confidence Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Role assessment for <span className="font-bold text-slate-900">{role}</span>
              </p>
            </div>

            {/* Big Confidence Score Badge */}
            <div className="flex items-center gap-4 rounded-2xl border border-purple-200 bg-purple-50/80 p-4 sm:p-5 shrink-0">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-purple-900 font-mono">
                  {interviewScore.confidence_index || interviewScore.overall}/100
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 mt-0.5">
                  Confidence Index
                </div>
              </div>
            </div>
          </div>

          {/* Readiness Level Banner */}
          <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 flex items-center gap-3">
            <Award size={20} className="text-purple-600 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-purple-950">
                {interviewScore.readiness_level || 'Candidate Competency Verified'}
              </div>
              <div className="text-[11px] text-purple-800">
                Based on communication fluency, technical depth, quantifiable impact evidence, and role relevance.
              </div>
            </div>
          </div>

          {/* 4 Core Competency Dimension Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communication</div>
              <div className="mt-1.5 text-2xl font-black text-slate-900 font-mono">
                {interviewScore.communication}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Clarity &amp; articulation</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technical Depth</div>
              <div className="mt-1.5 text-2xl font-black text-slate-900 font-mono">
                {interviewScore.completeness}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Thorough ownership</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evidence &amp; Metrics</div>
              <div className="mt-1.5 text-2xl font-black text-slate-900 font-mono">
                {interviewScore.evidence}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">STAR quantification</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Relevance</div>
              <div className="mt-1.5 text-2xl font-black text-slate-900 font-mono">
                {interviewScore.relevance}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target alignment</div>
            </div>
          </div>

          {/* Strengths & Actionable Coaching Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Identified Strengths</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-1.5">
                {interviewScore.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-amber-600" />
                <span>Interview Day Polishing Tips</span>
              </div>
              <ul className="text-xs text-amber-950 space-y-1.5">
                {interviewScore.improvements.map((im, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{im}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transcript Review Accordion */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Full Interview Transcript &amp; Review ({transcript.length} Q&amp;As)
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {transcript.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                  <div className="text-xs font-bold text-purple-900">
                    Q{idx + 1}: {item.question}
                  </div>
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 font-medium">
                    &quot;{item.answer}&quot;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset / Retake Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Practice builds interview confidence.</span>
            <button
              type="button"
              onClick={() => {
                setInterviewStarted(false);
                setInterviewScore(null);
                setTranscript([]);
                setCurrentAnswer('');
              }}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Start Another Mock Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewView;
