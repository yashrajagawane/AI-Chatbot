"use client";

import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import {
  Send,
  User,
  Dumbbell,
  Apple,
  Activity,
  PlusCircle,
  Loader2,
  Info,
  Menu,
  X,
  MessageSquare,
  Trash2,
  Edit
} from "lucide-react";

import ReactMarkdown from "react-markdown";

/* ---------------- TYPES ---------------- */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string;
}

/* ---------------- SIDEBAR ---------------- */

const Sidebar = memo(
  ({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    isOpen,
    onClose,
    onOpen
  }: {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
  }) => {
    const sorted = [...sessions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
            onClick={onClose}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0a0a0a] border-r border-zinc-800 transition-all duration-300
          ${isOpen ? "w-72 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"}`}
        >

          {isOpen ? (
            <div className="flex flex-col h-full w-72">

              {/* Brand */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Activity size={20} className="text-white"/>
                  </div>
                  <p className="font-bold text-sm text-white">
                    AI Fitness Coach
                  </p>
                </div>

                <button
                  className="text-zinc-400 hover:text-white lg:hidden"
                  onClick={onClose}
                >
                  <X size={20}/>
                </button>
                <button
                  className="text-zinc-400 hover:text-white hidden lg:block"
                  onClick={onClose}
                >
                  <Menu size={20}/>
                </button>
              </div>

              {/* New Chat */}
              <div className="p-4">
                <button
                  onClick={onNewChat}
                  className="w-full flex items-center justify-center gap-2
                  bg-emerald-600 hover:bg-emerald-700 text-white
                  py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <PlusCircle size={18}/>
                  New Session
                </button>
              </div>

              {/* Session List */}
              <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">

                {sorted.length === 0 ? (
                  <div className="text-center text-xs text-zinc-500 py-10">
                    No sessions yet
                  </div>
                ) : (
                  sorted.map((s) => (

                    <div
                      key={s.id}
                      onClick={() => onSelectChat(s.id)}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                      ${
                        activeSessionId === s.id
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "hover:bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <MessageSquare size={14}/>

                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold truncate">
                          {s.title}
                        </p>
                        <p className="text-[9px] opacity-50 mt-0.5 font-medium tracking-wider">
                          {s.messages.length} msgs
                        </p>
                      </div>

                      <button
                        onClick={(e)=>{
                          e.stopPropagation();
                          onDeleteChat(s.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14}/>
                      </button>

                    </div>
                  ))
                )}

              </div>

            </div>

          ) : (

            <div className="hidden lg:flex flex-col items-center h-full w-16 py-5 gap-8">
              <button onClick={onOpen} className="text-zinc-400 hover:text-white transition-colors" title="Open Sidebar">
                <Menu size={22}/>
              </button>

              <button
                onClick={onNewChat}
                className="text-zinc-400 hover:text-emerald-500 transition-colors"
                title="New Session"
              >
                <Edit size={20}/>
              </button>
            </div>

          )}

        </aside>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";

/* ---------------- MAIN APP ---------------- */

const SUGGESTIONS = [
  { label: "High Protein Meal Plan", icon: <Apple size={14}/> },
  { label: "5-Day Workout Split", icon: <Dumbbell size={14}/> },
  { label: "Calculate My Macros", icon: <Activity size={14}/> }
];

export default function App() {

  const [sessions,setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId,setCurrentSessionId] = useState<string|null>(null);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [sidebarOpen,setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSession = useMemo(
    ()=>sessions.find((s)=>s.id===currentSessionId),
    [sessions,currentSessionId]
  );

  const messages = currentSession?.messages || [];

  /* ---------- LOAD HISTORY ---------- */

  useEffect(()=>{

    const saved = localStorage.getItem("vitalis_sessions");

    if(saved){
      try{

        const parsed = JSON.parse(saved).map((s:any)=>({
          ...s,
          createdAt:new Date(s.createdAt),
          messages:s.messages.map((m:any)=>({
            ...m,
            timestamp:new Date(m.timestamp)
          }))
        }));

        setSessions(parsed);
        setCurrentSessionId(parsed[0]?.id||null);

      }catch{
        localStorage.removeItem("vitalis_sessions");
      }
    }else{
      createSession();
    }

  },[]);

  /* ---------- SAVE HISTORY ---------- */

  useEffect(()=>{
    if(sessions.length){
      localStorage.setItem("vitalis_sessions",JSON.stringify(sessions));
    }

    messagesEndRef.current?.scrollIntoView({
      behavior:"smooth",
      block:"end"
    });

  },[sessions]);

  /* ---------- CREATE SESSION ---------- */

  const createSession = ()=>{

    const id = Date.now().toString();

    const session:ChatSession={
      id,
      title:"New Consultation",
      createdAt:new Date(),
      messages:[
        {
          id:"1",
          role:"assistant",
          content:"Welcome to **AI Fitness Coach** 💪I'm your personal fitness and nutrition guide.\n**How can I help you today?**",
          timestamp:new Date()
        }
      ]
    };

    setSessions((prev)=>[session,...prev]);
    setCurrentSessionId(id);

    setTimeout(()=>{
      inputRef.current?.focus();
    },100);

  };

  /* ---------- DELETE SESSION ---------- */

  const deleteSession = (id:string)=>{

    const filtered = sessions.filter((s)=>s.id!==id);

    setSessions(filtered);

    if(currentSessionId===id){
      setCurrentSessionId(filtered[0]?.id||null);
    }

    if(!filtered.length) createSession();
  };

  /* ---------- STREAM RESPONSE ---------- */

  const streamText = async(text:string, targetSessionId: string)=>{

    let current="";
    // Send larger chunks for a faster perceived typing speed
    const chunkSize = 8; 

    for(let i=0;i<text.length;i+=chunkSize){

      current+=text.slice(i,i+chunkSize);

      setSessions(prev=>
        prev.map(s=>{
          if(s.id!==targetSessionId) return s;
          if(!s.messages.length) return s;

          const msgs=[...s.messages];

          msgs[msgs.length-1]={
            ...msgs[msgs.length-1],
            content:current
          };

          return {...s,messages:msgs};
        })
      );

      // Fast typing speed
      await new Promise(r=>setTimeout(r,5));
    }
  };

  /* ---------- SEND MESSAGE ---------- */

  const sendMessage = async(text?:string)=>{

    const message=text||input;

    if(!message.trim()||loading||!currentSessionId) return;

    // The message saved in UI history
    const userMsg:Message={
      id:Date.now().toString(),
      role:"user",
      content:message,
      timestamp:new Date()
    };

    setSessions(prev=>
      prev.map(s=>{
        if(s.id!==currentSessionId) return s;

        return{
          ...s,
          title:
            s.messages.length===1
              ? message.slice(0,30).trim()+(message.length>30?"...":"")
              : s.title,
          messages:[...s.messages,userMsg]
        };
      })
    );

    setInput("");
    setLoading(true);
    const targetSessionId = currentSessionId;

    try{
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          message: message, 
          history:messages.slice(-10).map(m=>({
            role:m.role,
            content:m.content
          }))
        })
      });

      const data=await res.json();

      const aiMsg:Message={
        id:Date.now().toString(),
        role:"assistant",
        content:"",
        timestamp:new Date()
      };

      setSessions(prev=>
        prev.map(s=>
          s.id===targetSessionId
            ? {...s,messages:[...s.messages,aiMsg]}
            : s
        )
      );

      await streamText(
        data?.reply ??
        "I couldn't generate a response right now. Please try again.",
        targetSessionId
      );

    }catch{
      console.error("AI error");
    }

    setLoading(false);
  };

  /* ---------- HELPER: Markdown Formatting ---------- */
  
  // Custom pre-processor to turn raw markdown tables into code blocks 
  // without needing the remark-gfm plugin
  const formatContent = (content: string) => {
    let inTable = false;
    const lines = content.split('\n');
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.includes('|') && trimmed.length > 2 && !trimmed.startsWith('`')) {
        if (!inTable) {
          inTable = true;
          return '```\n' + line;
        }
        return line;
      } else {
        if (inTable) {
          inTable = false;
          return '```\n' + line;
        }
        return line;
      }
    });
    if (inTable) formatted.push('```');
    return formatted.join('\n');
  };

  /* ---------------- UI ---------------- */

  return(

    <div className="flex h-screen bg-[#050505] text-zinc-100 overflow-hidden font-sans">

      <Sidebar
        sessions={sessions}
        activeSessionId={currentSessionId}
        onNewChat={createSession}
        onSelectChat={setCurrentSessionId}
        onDeleteChat={deleteSession}
        isOpen={sidebarOpen}
        onClose={()=>setSidebarOpen(false)}
        onOpen={()=>setSidebarOpen(true)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen?"lg:ml-72":"lg:ml-16"}`}>

        {/* Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-md z-10">

          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white transition-colors lg:hidden">
                <Menu size={20} />
              </button>
            )}
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
              {currentSession?.title || "AI Fitness Coach"}
            </p>
          </div>

          <Info size={18} className="text-zinc-600"/>

        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">

          <div className="max-w-4xl mx-auto space-y-10">

            {messages.map(m=>(
              <div key={m.id} className={`flex gap-4 ${m.role==="user"?"flex-row-reverse":""}`}>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  m.role === "user" ? "bg-zinc-800 text-white" : "bg-emerald-600 text-white shadow-emerald-500/20"
                }`}>
                  {m.role==="user"
                    ? <User size={18}/>
                    : <Dumbbell size={18} />}
                </div>

                <div className={`px-6 py-5 rounded-3xl max-w-[95%] sm:max-w-[85%] text-[15px] min-w-0 shadow-md ${
                  m.role==="user"
                    ?"bg-emerald-600 text-white rounded-tr-none"
                    :"bg-[#0f0f11] border border-zinc-800/80 rounded-tl-none"
                }`}>

                  {/* PERFECTED MARKDOWN RENDERER */}
                  <div className="overflow-x-auto whitespace-pre-wrap break-words">
                    <ReactMarkdown 
                      components={{
                        // Headings: Removed excessive top margin if it's the first element.
                        h1: ({ node, ...props }) => <h1 className="text-xl font-extrabold text-white mt-4 mb-2 first:mt-0 border-b border-zinc-800 pb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-emerald-400 mt-4 mb-2 first:mt-0" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-emerald-300 mt-3 mb-1 first:mt-0" {...props} />,
                        
                        // Lists: Beautiful tight spacing, professional emerald markers
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-zinc-300 marker:text-emerald-500" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-zinc-300 marker:text-emerald-500 font-medium" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
                        
                        // Paragraphs: Snug line heights and reduced bottom margin.
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-zinc-300 leading-relaxed" {...props} />,
                        
                        // Strong: Emphasized styling
                        strong: ({ node, ...props }) => <strong className="font-semibold text-emerald-400" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-emerald-500 pl-4 py-1 my-3 italic text-zinc-400 bg-emerald-950/10 rounded-r-lg" {...props} />,
                        
                        // Code Blocks (Just in case AI generates code or raw lists)
                        code: ({ node, inline, className, children, ...props }: any) => 
                          inline ? (
                            <code className="bg-zinc-800/50 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                          ) : (
                            <div className="overflow-x-auto my-3 border border-zinc-800 rounded-xl bg-[#141417] shadow-sm">
                              <pre className="p-4 text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre" {...props}>{children}</pre>
                            </div>
                          )
                      }}
                    >
                      {formatContent(m.content)}
                    </ReactMarkdown>
                  </div>

                </div>

              </div>
            ))}

            {loading &&(
              <div className="flex items-center gap-4 text-zinc-400 text-sm">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-emerald-500 shadow-sm">
                  <Loader2 size={18} className="animate-spin"/>
                </div>
                <div className="flex gap-1 items-center bg-zinc-900 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-800">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"/>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"/>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300"/>
                  <span className="ml-2 font-medium tracking-wide">Coach thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}/>

          </div>

        </main>

        {/* Input */}

        <footer className="p-4 sm:p-6 border-t border-zinc-900 bg-[#050505] z-10">

          <div className="max-w-4xl mx-auto">

            {messages.length<3&&!loading&&(
              <div className="flex gap-2 mb-3 flex-wrap animate-in slide-in-from-bottom-2 duration-500">
                {SUGGESTIONS.map(s=>(
                  <button
                    key={s.label}
                    onClick={()=>sendMessage(s.label)}
                    className="text-[10px] sm:text-xs font-medium bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-full hover:border-emerald-500 hover:text-emerald-400 transition-all shadow-sm"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">

              <input
                ref={inputRef}
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{
                  if(e.key==="Enter"){
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask your coach for a workout plan or diet advice..."
                className="flex-1 bg-[#0f0f11] border border-zinc-800 rounded-2xl pl-5 pr-14 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm"
              />

              <button
                onClick={()=>sendMessage()}
                disabled={!input.trim()||loading}
                className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 rounded-xl transition-all shadow-md flex items-center justify-center"
              >
                <Send size={18}/>
              </button>

            </div>

            <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-[0.2em] font-bold">
               Professional Fitness Intel • Safe AI Guide
            </p>

          </div>

        </footer>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      ` }} />

    </div>

  );

}