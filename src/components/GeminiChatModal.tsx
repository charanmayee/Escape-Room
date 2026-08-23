import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Trash2,
  Copy,
  Check,
  Shield,
  HelpCircle,
  MessageSquare,
  Flame,
  GraduationCap,
  Minimize2,
  Maximize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { playKeyClickSound, playSuccessChime, playErrorBuzzer } from "../utils/audio";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  modelUsed?: string;
  persona?: string;
}

export type BotPersonaId = "sentinel" | "companion" | "professor" | "speedrunner";
export type ModelTierId = "fast" | "general" | "complex";

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom?: number;
  roomName?: string;
  timeRemaining?: number;
  difficulty?: string;
  unlockedRooms?: number[];
}

const PERSONAS = [
  {
    id: "sentinel" as BotPersonaId,
    name: "Sentry-9",
    role: "Facility Core AI",
    badge: "SENTINEL",
    desc: "Cryptic cybersecurity mainframe testing your logical deduction.",
    icon: Cpu,
    color: "amber",
    tagline: "I govern these security protocols. Prove your intellect.",
  },
  {
    id: "companion" as BotPersonaId,
    name: "Cipher-X",
    role: "Tactical Hacker",
    badge: "ALLY",
    desc: "Friendly rebel hacker offering actionable clue decoding in the vents.",
    icon: Shield,
    color: "emerald",
    tagline: "Tapped into camera feeds. What puzzle are you staring at?",
  },
  {
    id: "professor" as BotPersonaId,
    name: "Dr. Alan",
    role: "CS Professor",
    badge: "SCHOLAR",
    desc: "Discrete mathematics & algorithm scholar explaining underlying theory.",
    icon: GraduationCap,
    color: "cyan",
    tagline: "Every lock is an algorithmic proof waiting to be evaluated.",
  },
  {
    id: "speedrunner" as BotPersonaId,
    name: "Blitz",
    role: "Speedrun Coach",
    badge: "TACTICIAN",
    desc: "Hyper-focused time-management tips and rapid puzzle clearance.",
    icon: Flame,
    color: "rose",
    tagline: "Clock is ticking! Let's eliminate false paths in seconds.",
  },
];

const MODEL_TIERS = [
  {
    id: "fast" as ModelTierId,
    name: "Flash-Lite",
    modelCode: "gemini-3.1-flash-lite",
    label: "⚡ Fast (Lite)",
    desc: "Optimized for lightning speed & quick hints",
  },
  {
    id: "general" as ModelTierId,
    name: "Flash 3.5",
    modelCode: "gemini-3.5-flash",
    label: "🧠 Balanced (General)",
    desc: "Deep conversational context & puzzle advice",
  },
  {
    id: "complex" as ModelTierId,
    name: "Pro 3.1",
    modelCode: "gemini-3.1-pro-preview",
    label: "🔬 Complex (Pro)",
    desc: "Advanced multi-step reasoning & riddle deduction",
  },
];

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  currentRoom = 1,
  roomName = "Campus Dorms",
  timeRemaining = 900,
  difficulty = "Medium",
  unlockedRooms = [1],
}) => {
  const [persona, setPersona] = useState<BotPersonaId>("sentinel");
  const [modelTier, setModelTier] = useState<ModelTierId>("general");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message based on persona
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg_init",
        role: "model",
        text: `**[Sentry-9 Facility Telemetry Linked]**\n\nOperative detected in **Room ${currentRoom}: ${roomName}**.\nSecurity lockdown is active under **${difficulty}** tier.\nAsk me for tactical analysis, logic hints, or theoretical decryption guidance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona: "sentinel",
      },
    ];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const activePersonaObj = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    playKeyClickSound();
    setInput("");

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Build conversation payload
      const payloadMessages = newHistory.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        text: m.text,
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          persona,
          modelTier,
          roomContext: {
            currentRoom,
            roomName,
            timeRemaining,
            difficulty,
            unlockedRooms,
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "Transmission received, but data stream was interrupted.";

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: "model",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        persona: data.persona || persona,
      };

      setMessages((prev) => [...prev, botMsg]);
      playSuccessChime();
    } catch (err) {
      console.error("Chat request failed:", err);
      playErrorBuzzer();
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        text: "⚠️ *Security interference detected on uplink channel. Local offline diagnostic says: Inspect chamber visual clues and check letter positions closely.*",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playKeyClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    playKeyClickSound();
    setMessages([
      {
        id: `msg_reset_${Date.now()}`,
        role: "model",
        text: `**[Terminal Reset]**\n\nChannel switched to **${activePersonaObj.name}** (${activePersonaObj.role}).\n${activePersonaObj.tagline}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona,
      },
    ]);
  };

  const handlePersonaChange = (newPersona: BotPersonaId) => {
    playKeyClickSound();
    setPersona(newPersona);
    const targetObj = PERSONAS.find((p) => p.id === newPersona) || PERSONAS[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_persona_${Date.now()}`,
        role: "model",
        text: `*Switching active transmitter to **${targetObj.name}** (${targetObj.role})...\n"${targetObj.tagline}"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona: newPersona,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="gemini_chat_backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="gemini_chat_modal"
        className="bg-[#0f111a] border border-[#2d2d3d] rounded-2xl w-full max-w-4xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden font-mono"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#0a0b12] border-b border-[#232738] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Gemini Tactical Comms Terminal
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  MULTI-TURN AI
                </span>
              </div>
              <p className="text-[10px] text-[#9ca3af]">
                Sector 0{currentRoom}: {roomName} • {difficulty} Tier • {Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s Left
              </p>
            </div>
          </div>

          {/* Model Tier Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#151928] p-1 rounded-lg border border-[#232a3e] text-[10px]">
              {MODEL_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  id={`model_tier_${tier.id}_btn`}
                  onClick={() => {
                    playKeyClickSound();
                    setModelTier(tier.id);
                  }}
                  title={tier.desc}
                  className={`px-2.5 py-1 rounded transition font-bold ${
                    modelTier === tier.id
                      ? "bg-amber-500 text-[#0a0b12] shadow-sm"
                      : "text-[#8c94a8] hover:text-white"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <button
              id="clear_chat_btn"
              onClick={handleClearChat}
              title="Clear Conversation Thread"
              className="p-1.5 rounded-lg text-[#8c94a8] hover:text-rose-400 hover:bg-[#1a1e2d] border border-transparent hover:border-[#2d2d3d] transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="close_gemini_chat_btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8c94a8] hover:text-white hover:bg-[#1a1e2d] border border-transparent hover:border-[#2d2d3d] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persona Selector Bar */}
        <div className="px-4 py-2 bg-[#0d0f17] border-b border-[#232738] flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider shrink-0 mr-1">
            Companion Persona:
          </span>
          {PERSONAS.map((p) => {
            const IconComp = p.icon;
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                id={`persona_${p.id}_btn`}
                onClick={() => handlePersonaChange(p.id)}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 font-bold"
                    : "bg-[#141724] border-[#22283a] text-[#8c94a8] hover:text-white hover:border-[#323b54]"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{p.name}</span>
                <span className="text-[9px] opacity-70">({p.badge})</span>
              </button>
            );
          })}
        </div>

        {/* Message Thread Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#0a0c14] scroll-smooth"
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const msgPersonaObj = PERSONAS.find((p) => p.id === msg.persona) || activePersonaObj;
            const IconComp = msgPersonaObj.icon;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isUser
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <IconComp className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-xl border text-xs sm:text-[13px] leading-relaxed relative group shadow-md ${
                    isUser
                      ? "bg-blue-950/40 border-blue-500/30 text-blue-100 rounded-tr-none"
                      : "bg-[#121522] border-[#23293e] text-[#e0e4f0] rounded-tl-none"
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-3 text-[10px] text-[#6b7280] mb-1.5 pb-1 border-b border-white/5">
                    <span className="font-bold flex items-center gap-1">
                      {isUser ? (
                        "Operative"
                      ) : (
                        <>
                          <span className="text-amber-400">{msgPersonaObj.name}</span>
                          <span className="text-[9px] text-[#8c94a8]">({msgPersonaObj.role})</span>
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Copy message"
                        className="opacity-0 group-hover:opacity-100 hover:text-white transition"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Markdown formatted content */}
                  <div className="markdown-body prose prose-invert prose-p:my-1 prose-pre:my-1 text-xs sm:text-[13px] max-w-none break-words">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-[#121522] border border-[#23293e] text-xs text-amber-400 flex items-center gap-2">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full" />
                <span>{activePersonaObj.name} is formulating tactical analysis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#0c0e18] border-t border-[#1d2233] flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
          <span className="text-[9px] text-[#6b7280] font-bold uppercase shrink-0">Quick Prompts:</span>
          <button
            onClick={() => handleSendMessage(`Can you give me a clever hint for Room ${currentRoom}?`)}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-[#151928] hover:bg-[#1d2338] border border-[#232a3e] text-[#a0a8c0] hover:text-white transition shrink-0"
          >
            💡 Hint for Room {currentRoom}
          </button>
          <button
            onClick={() => handleSendMessage("Explain the core logic or cipher pattern in this chamber.")}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-[#151928] hover:bg-[#1d2338] border border-[#232a3e] text-[#a0a8c0] hover:text-white transition shrink-0"
          >
            🔍 Explain Puzzle Logic
          </button>
          <button
            onClick={() => handleSendMessage("What strategy will help me clear this facility before the timer expires?")}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-[#151928] hover:bg-[#1d2338] border border-[#232a3e] text-[#a0a8c0] hover:text-white transition shrink-0"
          >
            ⏱️ Speed Strategy
          </button>
          <button
            onClick={() => handleSendMessage("Who built this facility and why was it locked down?")}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-[#151928] hover:bg-[#1d2338] border border-[#232a3e] text-[#a0a8c0] hover:text-white transition shrink-0"
          >
            🚨 Facility Lore
          </button>
        </div>

        {/* Input Form Bar */}
        <div className="p-3 sm:p-4 bg-[#0a0b12] border-t border-[#232738]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              id="gemini_chat_input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${activePersonaObj.name} for clues, logic breakdown, or strategy...`}
              disabled={loading}
              className="flex-1 bg-[#121522] border border-[#262c42] focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#5a6278] outline-none transition font-mono"
            />
            <button
              id="gemini_chat_send_btn"
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0b12] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-md"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
