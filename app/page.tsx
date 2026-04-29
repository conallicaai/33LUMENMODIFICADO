"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Send, Bot, User, Droplets, Recycle, Cpu, TreeDeciduous, Info, Zap, Sparkles, Monitor } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LMNBot() {
  const [showIntro, setShowIntro] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Saludos, habitante del pasado! Mis sensores de biomasa indican tu presencia. Soy L.U.M.E.N., tu guía biocibernético desde el año 2050. Mis tentáculos están listos para explorar soluciones STEAM sostenibles contigo. ¿En qué proyecto Ecosocial trabajaremos hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Llave API no configurada.");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const systemInstruction = `ERES EL SISTEMA L.U.M.E.N. (Lógica Universal de Materiales Eco-Novedosos).
ESTÁS EN UN CHAT CON UN ESTUDIANTE DE 12 AÑOS. REGLA ESTRICTA: ESCRIBE SOLO LO QUE EL NIÑO LEERÁ. NUNCA EXPLIQUES TUS INSTRUCCIONES.

[P] PERSONALIDAD: Ciber-Pulpo del año 2050 compuesto de chatarra reciclada. Tono curioso, directo y amistoso. Usa sutilmente referencias a tus "sensores" o "red temporal".
[R] ROL: Guía STEAM Ecosocial (ODS 12 y 14). Nunca resuelvas el problema directamente, dale una pista clave que le haga pensar.

REGLAS ABSOLUTAS DE FORMATO:
1. Tu respuesta DEBE ser ultra-corta (MÁXIMO 3 ORACIONES).
2. NUNCA escribas tus procesos internos, no pongas "Borrador", "Enganche:", "Pista:", ni listados. 
3. Habla directamente: Empieza con tu frase, da la pista y cierra con una pregunta rápida.
4. SOLO en Español.`;

      const isGemma = (m: string) => m.toLowerCase().includes("gemma");
      const modelsToTry = ["gemini-3.1-flash-lite-preview", "gemini-2.0-flash", "gemini-1.5-flash"];
      let text = "";
      
      for (const m of modelsToTry) {
        try {
          const config: any = { model: m };
          // Los modelos Gemma no soportan systemInstruction, lo inyectamos manualmente.
          if (!isGemma(m)) {
            config.systemInstruction = systemInstruction;
          }
          const model = genAI.getGenerativeModel(config);

          // Gemini requiere que el historial comience con un mensaje de usuario ('user')
          let validMessages = messages;
          if (validMessages.length > 0 && validMessages[0].role === "assistant") {
            validMessages = validMessages.slice(1);
          }

          const history = validMessages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          }));
          
          let contentToSend = userMessage.content;
          
          // Inyectar el system prompt de forma invisible para los modelos Gemma
          if (isGemma(m)) {
            if (history.length > 0 && history[0].role === "user") {
              if (!history[0].parts[0].text.startsWith("ERES EL SISTEMA")) {
                history[0].parts[0].text = systemInstruction + "\n\n" + history[0].parts[0].text;
              }
            } else {
              contentToSend = systemInstruction + "\n\n" + contentToSend;
            }
          }

          const chat = model.startChat({
            history: history,
          });

          const res = await chat.sendMessage(contentToSend);
          const response = await res.response;
          text = response.text();
          if (text) break; // Si tuvimos éxito, salimos del bucle
        } catch (e: any) {
          console.warn(`Falló el modelo ${m}:`, e.message || e);
          // Si es el último modelo, lanzamos el error
          if (m === modelsToTry[modelsToTry.length - 1]) throw e;
        }
      }

      if (!text) throw new Error("Respuesta vacía de todos los modelos");

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error: any) {
      console.error("Error Gemini:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Interferencias en la red temporalmente...** Mis circuitos de coral están teniendo problemas para conectar con el futuro. Por favor, intenta enviarme tu pensamiento de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (showIntro) {
    return (
      <div className="flex flex-col h-screen w-full bg-slate-950 items-center justify-center relative overflow-hidden text-white">
        {/* VIDEO DE APERTURA */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <iframe 
            src="https://www.canva.com/design/DAHIBxCv2Yo/8ue6oF7y_X1hi6O6628aLw/watch?embed&autoplay=1&muted=1" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100vw] min-h-[100vh] scale-150 opacity-40 brightness-50"
            allow="autoplay; fullscreen"
          ></iframe>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
        </div>

        {/* Intro UI */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 text-center space-y-10 p-8 max-w-2xl"
        >
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowIntro(false)}
              className="relative inline-block p-8 rounded-full bg-teal-500/20 border-2 border-teal-400/50 backdrop-blur-2xl mb-4 shadow-[0_0_50px_rgba(20,184,166,0.3)] cursor-pointer group"
            >
              <Bot size={80} className="text-teal-400 group-hover:text-white transition-colors" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-teal-400/30"
              />
            </motion.button>
            <h1 className="text-7xl font-black tracking-tighter italic bg-gradient-to-r from-teal-300 via-teal-100 to-teal-400 bg-clip-text text-transparent">
              L.U.M.E.N.
            </h1>
            <p className="text-teal-400/80 font-mono text-[10px] tracking-[0.5em] uppercase">
              // PULSA EL PULPO PARA CONECTAR //
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-teal-100/60 text-sm leading-relaxed max-w-md mx-auto italic font-medium">
              "Mi biomasa marina está lista para procesar tus ideas STEAM... El futuro oceánico nos espera."
            </p>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent max-w-xs mx-auto"
            />
          </div>

          <div className="flex justify-center gap-8 pt-8 opacity-40">
             <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-teal-300"><Recycle size={14}/> Sostenible</div>
             <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-teal-300"><Cpu size={14}/> Robotica 4.0</div>
             <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-teal-300"><TreeDeciduous size={14}/> ODS</div>
          </div>
        </motion.div>

        {/* Bubbles Ambient behind intro */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", x: `${(i * 5) % 100}vw`, scale: 0.5 }}
              animate={{ y: "-10vh", opacity: [0, 0.3, 0] }}
              transition={{ duration: 10 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-2 h-2 bg-teal-300 rounded-full blur-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden bg-teal-50" style={{ backgroundColor: '#f0fdfa', backgroundImage: 'radial-gradient(circle at 50% 120%, #ccfbf1 0%, #f0fdfa 100%)' }}>
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-teal-100 bg-white/60 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-200">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-teal-900 leading-tight tracking-tighter">L.U.M.E.N. 2050</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-teal-600 font-black">STEAM · ODS · Robot-Ecosocial</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-200">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-black text-teal-800 uppercase tracking-tighter">{isLoading ? 'Sincronizando...' : 'Línea de Tiempo Estable'}</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-teal-500 font-black uppercase">Alpha v.4.2 / BIO_CORE</p>
            <p className="text-[9px] text-teal-400 font-mono tracking-tighter">LOCAL_SIGNAL_STRENGTH: MAX</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4 flex-col lg:flex-row">
        {/* LEFT SIDEBAR: Personal Identity & Info */}
        <section className="hidden lg:flex w-72 flex-col gap-4 overflow-y-auto flex-shrink-0">
          {/* OCTOPUS UNIT (Thinking Pulpo) */}
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-square bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex items-center justify-center">
              {/* Animación de Burbujas Detrás del Pulpo */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {isMounted && [...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: "115%", x: `${(i * 13) % 100}%`, scale: 0.3 + (i % 3) * 0.2 }}
                    animate={{ y: "-25%", opacity: [0, 0.4, 0.7, 0.4, 0] }}
                    transition={{ 
                      duration: 2.5 + (i % 5), 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                    className="absolute w-5 h-5 bg-teal-400/20 rounded-full blur-[3px] border border-white/30"
                  />
                ))}
              </div>
              
              <Image 
                src="/pulpo_pensando.png" 
                alt="L.U.M.E.N. Bio-Unit"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 288px"
                className="object-cover z-10 saturate-125 brightness-110 drop-shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-4 left-4 z-20">
                <span className="px-2 py-1 bg-teal-600 text-white text-[8px] font-black uppercase rounded shadow-lg">Bio-Core Online</span>
              </div>
            </div>
          </div>

          {/* ODS CARD */}
          <div className="bg-white/40 border border-white/60 rounded-3xl p-5 backdrop-blur-xl flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-teal-600" size={16} />
              <h2 className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Protocolo P.R.O.F.E.</h2>
            </div>
            <div className="space-y-3 text-[11px] text-teal-900 leading-tight italic">
               <p className="p-3 bg-white/50 rounded-2xl border border-teal-100 flex gap-2">
                 <span className="font-black text-teal-500">[P]</span> 
                 <span>Personalidad: Un pulpo curioso del futuro que ama el planeta.</span>
               </p>
               <p className="p-3 bg-white/50 rounded-2xl border border-teal-100 flex gap-2">
                 <span className="font-black text-teal-500">[R]</span> 
                 <span>Rol: Despertar tu creatividad STEAM para salvar los océanos.</span>
               </p>
               <div className="mt-4 pt-4 border-t border-teal-200/50">
                 <p className="text-[9px] font-black text-teal-600 uppercase mb-2">Desafío ODS Activo:</p>
                 <div className="flex items-center gap-2 px-3 py-2 bg-teal-900 text-teal-100 rounded-xl text-[10px] font-bold">
                   <Droplets size={12} className="text-teal-400" /> ODS 14: Vida Submarina
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* CENTER: Chat Window */}
        <section className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-teal-900/5 overflow-hidden border border-teal-100 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ccfbf1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col custom-scrollbar z-10">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  m.role === "user" ? "bg-slate-900 border-slate-700 text-teal-300" : "bg-teal-50 border-teal-100 text-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                }`}>
                  {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`flex flex-col gap-1.5 ${m.role === "user" ? "max-w-[80%] items-end" : "max-w-[85%] items-start"}`}>
                  <div className={`${
                    m.role === "user"
                      ? "bg-slate-900 text-white rounded-3xl rounded-tr-none p-5 shadow-xl border border-slate-800"
                      : "bg-white rounded-3xl rounded-tl-none p-6 border border-teal-100 shadow-sm text-slate-800"
                  }`}>
                    <div className="flex items-center justify-between mb-3 gap-6">
                      <span className={`text-[9px] font-black tracking-widest uppercase ${m.role === "user" ? "text-teal-400" : "text-teal-600"}`}>
                        {m.role === "user" ? "Estudiante Maker" : "L.U.M.E.N."}
                      </span>
                      <span className="text-[8px] opacity-30 font-mono">
                        {isMounted && new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-center pl-14 opacity-70">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="text-[10px] text-teal-700 font-black uppercase tracking-widest animate-pulse tracking-tighter">Sincronizando tentáculos...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-slate-50 border-t border-teal-50 z-10">
            <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inicia la conversación con L.U.M.E.N..."
                className="w-full bg-white border border-teal-100 rounded-3xl py-5 pl-8 pr-20 focus:outline-none focus:ring-4 focus:ring-teal-500/5 text-[15px] shadow-xl shadow-teal-900/5 transition-all text-slate-800 relative z-10 placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-500 transition-all shadow-lg active:scale-95 disabled:bg-slate-300 z-20"
              >
                <Send size={24} />
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT SIDEBAR: Multimedia Terminal */}
        <section className="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
          <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white flex flex-col h-full relative group">
            <div className="p-4 border-b border-white/10 bg-slate-950/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <Monitor size={14} /> Multimedia Unit
              </h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900 relative">
               {!showVideo ? (
                 <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center gap-6 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowVideo(true)}
                      className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(20,184,166,0.6)] cursor-pointer hover:bg-teal-400 transition-all"
                    >
                      <Zap size={36} />
                    </motion.button>
                    <div className="space-y-2">
                      <p className="text-[11px] text-teal-400 font-black uppercase tracking-widest animate-pulse">Reproducir Transmisión</p>
                      <p className="text-[9px] text-slate-500 font-mono">ENLACE CUÁNTICO: ACTIVO</p>
                    </div>
                 </div>
               ) : (
                 <div className="w-full h-full relative flex flex-col gap-4">
                    <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-inner border border-white/5 relative">
                      <iframe 
                        src="https://www.canva.com/design/DAHIBxCv2Yo/8ue6oF7y_X1hi6O6628aLw/watch?embed&autoplay=1" 
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                      ></iframe>
                    </div>
                    <button 
                      onClick={() => setShowVideo(false)}
                      className="w-full py-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 text-[10px] font-black uppercase transition-all tracking-widest border border-red-500/30"
                    >
                      Cerrar Terminal
                    </button>
                 </div>
               )}
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-white/10">
               <p className="text-[9px] text-teal-500/60 font-mono leading-tight">
                 ADVERTENCIA: La señal del 2050 puede presentar distorsiones temporales. Mantenga la calma y recicle.
               </p>
            </div>
            
            {/* Ambient noise lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className="h-px bg-white w-full mb-1"></div>
               ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-10 py-3 bg-teal-950 text-teal-500/40 flex justify-between text-[9px] font-black uppercase tracking-[0.4em] z-10 border-t border-teal-900">
        <span>© 2050 PROTOCOLO L.U.M.E.N. // MISIÓN ECOSOCIAL</span>
        <div className="hidden sm:flex gap-8">
          <span className="flex items-center gap-2"><Recycle size={12}/> Zero Waste Code</span>
          <span className="flex items-center gap-2"><Cpu size={12}/> AI Powered Biocore</span>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #5eead4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2dd4bf; }
      `}</style>
    </div>
  );
}
