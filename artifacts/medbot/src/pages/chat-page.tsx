import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Stethoscope, MapPin, Activity, ShieldCheck, User as UserIcon, Calendar, Menu, X } from 'lucide-react';
import { 
  useCreateOpenaiConversation, 
  useListDoctors 
} from '@workspace/api-client-react';
import { useChatStream, ChatMessage } from '@/hooks/use-chat-stream';
import { DoctorCard } from '@/components/doctor-card';
import { AppointmentsPanel } from '@/components/appointments-panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

const CITIES = ['Dhaka', 'Chittagong', 'Barisal', 'Rajshahi', 'Sylhet', 'Khulna'];
const SPECIALTIES = ['Cardiologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Hepatologist'];

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [filterCity, setFilterCity] = useState<string | undefined>();
  const [filterSpecialty, setFilterSpecialty] = useState<string | undefined>();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { mutateAsync: createConversation } = useCreateOpenaiConversation();
  const { messages, sendMessage, isStreaming, addSystemMessage } = useChatStream(conversationId);
  const { data: doctors } = useListDoctors({ city: filterCity, specialty: filterSpecialty });

  useEffect(() => {
    // Initialize session
    createConversation({ data: { title: 'Consultation' } })
      .then(res => setConversationId(res.id))
      .catch(console.error);
  }, [createConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const text = input.trim();
    setInput('');
    
    // Auto-extract filters from input for instant UI reaction
    const lower = text.toLowerCase();
    const matchedCity = CITIES.find(c => lower.includes(c.toLowerCase()));
    if (matchedCity) setFilterCity(matchedCity);
    
    const matchedSpecialty = SPECIALTIES.find(s => lower.includes(s.toLowerCase()));
    if (matchedSpecialty) setFilterSpecialty(matchedSpecialty);
    
    sendMessage(text);
  };

  const handleQuickReply = (text: string, type: 'city' | 'specialty') => {
    if (type === 'city') setFilterCity(text);
    if (type === 'specialty') setFilterSpecialty(text);
    const contextMsg = type === 'city' ? `I am located in ${text}` : `I need a ${text} specialist`;
    sendMessage(contextMsg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBookingSuccess = () => {
    addSystemMessage("✅ Appointment confirmed successfully! You can view details in the 'My Appointments' panel.");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col h-full relative border-r border-border shadow-2xl z-10 bg-card/50">
        
        {/* Header */}
        <header className="h-16 shrink-0 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 p-1.5">
              <img src={`${import.meta.env.BASE_URL}images/medbot-logo.png`} alt="MedBot" className="w-full h-full object-contain filter drop-shadow-md brightness-0 invert" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground leading-tight tracking-tight">MedBot</h1>
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> AI Health Assistant
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          >
            {showMobileSidebar ? <X /> : <Menu />}
          </Button>
        </header>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* Welcome Message */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-[85%]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 text-[15px] leading-relaxed text-foreground">
              <p>Hello! I'm MedBot, your AI health assistant for Bangladesh.</p>
              <p className="mt-2 text-muted-foreground">Please describe your symptoms, or tell me which specialist and city you are looking for.</p>
            </div>
          </motion.div>

          {/* Chat History */}
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'max-w-[90%] sm:max-w-[85%]'}`}
              >
                {msg.role !== 'user' && (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'system' ? 'bg-accent/10 border-accent/20' : 'bg-primary/10 border-primary/20'}`}>
                    {msg.role === 'system' ? <Calendar className="w-4 h-4 text-accent" /> : <Stethoscope className="w-5 h-5 text-primary" />}
                  </div>
                )}
                
                <div className={`
                  rounded-2xl p-4 text-[15px] leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-tr-sm shadow-primary/20' 
                    : msg.role === 'system'
                    ? 'bg-accent/5 border border-accent/20 text-foreground rounded-tl-sm font-medium'
                    : 'bg-card border border-border text-foreground rounded-tl-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:my-0'
                  }
                `}>
                  {msg.role === 'user' || msg.role === 'system' ? (
                    msg.content
                  ) : (
                    msg.content ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <span className="flex gap-1 items-center h-5"><span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/><span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/><span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/></span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Sticky Bottom Area: Doctors + Input */}
        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-4 px-4 sm:px-6 z-20">
          
          {/* Suggested Doctors Carousel */}
          <AnimatePresence>
            {doctors && doctors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Suggested Doctors</h3>
                  {(filterCity || filterSpecialty) && (
                    <div className="flex gap-2 ml-2">
                      {filterCity && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none rounded-md px-2 py-0.5">{filterCity}</Badge>}
                      {filterSpecialty && <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-none rounded-md px-2 py-0.5">{filterSpecialty}</Badge>}
                    </div>
                  )}
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-4 pt-1 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {doctors.map(doc => (
                    <DoctorCard key={doc.id} doctor={doc} onBookingSuccess={handleBookingSuccess} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Replies */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center mr-1">Quick Select:</span>
            {CITIES.map(city => (
              <button 
                key={city} onClick={() => handleQuickReply(city, 'city')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <MapPin className="w-3 h-3 text-primary" /> {city}
              </button>
            ))}
            <div className="w-px h-5 bg-border shrink-0 mx-1" />
            {SPECIALTIES.map(spec => (
              <button 
                key={spec} onClick={() => handleQuickReply(spec, 'specialty')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground hover:bg-accent/5 hover:border-accent/30 transition-colors"
              >
                <Stethoscope className="w-3 h-3 text-accent" /> {spec}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative bg-card rounded-2xl shadow-lg border border-border/60 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask for a doctor..."
              className="min-h-[60px] max-h-[150px] w-full resize-none border-0 focus-visible:ring-0 bg-transparent py-4 pl-4 pr-14 text-[15px]"
              disabled={!conversationId || isStreaming}
            />
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || !conversationId || isStreaming}
              className="absolute right-3 bottom-3 h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium">
            MedBot can make mistakes. Consider verifying important medical information.
          </p>
        </div>
      </div>

      {/* Right Sidebar - Appointments */}
      <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[380px] bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:w-[380px] md:z-0 md:bg-background/40
        ${showMobileSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col pt-16 md:pt-0">
          <div className="md:hidden absolute top-4 right-4">
             <Button variant="ghost" size="icon" onClick={() => setShowMobileSidebar(false)}>
               <X />
             </Button>
          </div>
          <AppointmentsPanel />
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

    </div>
  );
}
