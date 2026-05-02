import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { Home as HomeIcon, CalendarDays, QrCode, User, MapPin, Search, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

type Tab = "inicio" | "plan" | "escanear" | "perfil";

const PARCHES = [
  {
    id: 1,
    title: "La Troja Montería",
    location: "Calle 41 #3-15, Montería",
    time: "10:00 PM",
    cupos: 8,
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80",
    avatarSeeds: ["Felix", "Aneka", "Mia"],
  },
  {
    id: 2,
    title: "Parche El Patio",
    location: "Carrera 5 #22-10, Montería",
    time: "9:00 PM",
    cupos: 4,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    avatarSeeds: ["Sara", "Luis", "Tomas", "Camila"],
  },
  {
    id: 3,
    title: "Cócteles Sinú",
    location: "Av. Circunvalar #29, Montería",
    time: "8:30 PM",
    cupos: 12,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    avatarSeeds: ["Ana", "Jorge"],
  },
];

function SimulatedMap() {
  const markers = [
    { cx: 80, cy: 90, label: "La Troja" },
    { cx: 200, cy: 140, label: "El Patio" },
    { cx: 310, cy: 80, label: "Sinú" },
    { cx: 140, cy: 200, label: "Club X" },
    { cx: 270, cy: 195, label: "Bar Y" },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 210 }}>
      <svg
        viewBox="0 0 390 210"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark map background */}
        <rect width="390" height="210" fill="#0d0d11" />

        {/* Grid / block structure */}
        {[30, 70, 110, 150, 190].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="390" y2={y} stroke="#1a1a24" strokeWidth="1" />
        ))}
        {[50, 100, 150, 200, 250, 300, 350].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="210" stroke="#1a1a24" strokeWidth="1" />
        ))}

        {/* Main roads */}
        <path d="M 0 105 Q 100 95 200 105 Q 300 115 390 105" stroke="#22223a" strokeWidth="8" fill="none" />
        <path d="M 195 0 Q 190 60 200 105 Q 210 150 195 210" stroke="#22223a" strokeWidth="8" fill="none" />
        <path d="M 0 60 Q 120 55 200 65 Q 280 75 390 65" stroke="#1e1e30" strokeWidth="5" fill="none" />
        <path d="M 0 155 Q 130 148 200 155 Q 300 162 390 155" stroke="#1e1e30" strokeWidth="5" fill="none" />
        <path d="M 100 0 Q 95 80 100 210" stroke="#1e1e30" strokeWidth="4" fill="none" />
        <path d="M 300 0 Q 305 80 300 210" stroke="#1e1e30" strokeWidth="4" fill="none" />

        {/* Block fills */}
        <rect x="52" y="12" width="44" height="44" rx="3" fill="#13131c" />
        <rect x="205" y="12" width="90" height="44" rx="3" fill="#13131c" />
        <rect x="52" y="70" width="44" height="30" rx="3" fill="#13131c" />
        <rect x="52" y="115" width="44" height="35" rx="3" fill="#13131c" />
        <rect x="205" y="115" width="90" height="35" rx="3" fill="#13131c" />
        <rect x="305" y="70" width="82" height="80" rx="3" fill="#13131c" />

        {/* Glowing markers */}
        {markers.map((m) => (
          <g key={m.label}>
            {/* Outer glow ring */}
            <circle cx={m.cx} cy={m.cy} r="14" fill="rgba(99,102,241,0.08)" />
            <circle cx={m.cx} cy={m.cy} r="9" fill="rgba(99,102,241,0.15)" />
            {/* Main dot */}
            <circle cx={m.cx} cy={m.cy} r="5" fill="#6366f1" style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
            <circle cx={m.cx} cy={m.cy} r="2.5" fill="#a5b4fc" />
          </g>
        ))}

        {/* Map edge vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
        </defs>
        <rect width="390" height="210" fill="url(#vignette)" />
      </svg>

      {/* Search bar overlay */}
      <div className="absolute top-3 left-3 right-3">
        <div className="flex items-center gap-2 bg-[#0f0f18]/90 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 shadow-lg">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-sm">¿Dónde es el parche hoy?</span>
        </div>
      </div>

      {/* Bottom fade into background */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}

function AvatarStack({ seeds }: { seeds: string[] }) {
  return (
    <div className="flex items-center">
      {seeds.slice(0, 4).map((seed, i) => (
        <img
          key={seed}
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&backgroundType=solid`}
          alt={seed}
          className="w-7 h-7 rounded-full border-2 border-background bg-card object-cover"
          style={{ marginLeft: i === 0 ? 0 : -10, zIndex: seeds.length - i }}
        />
      ))}
      {seeds.length > 4 && (
        <div
          className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground"
          style={{ marginLeft: -10 }}
        >
          +{seeds.length - 4}
        </div>
      )}
    </div>
  );
}

function ParcheCard({ parche }: { parche: typeof PARCHES[0] }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/60 flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={parche.image}
          alt={parche.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Cupos badge */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Users className="w-3 h-3" />
            {parche.cupos} cupos
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base mb-1 leading-tight">{parche.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{parche.location}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-4">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Desde las {parche.time}</span>
        </div>

        <div className="flex items-center justify-between">
          <AvatarStack seeds={parche.avatarSeeds} />
          <button
            className="bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            data-testid={`btn-apuntarse-${parche.id}`}
          >
            Apuntarse
          </button>
        </div>
      </div>
    </div>
  );
}

function InicioView() {
  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-none" style={{ textShadow: "0 0 20px rgba(99,102,241,0.5)" }}>
            Vinku
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground text-sm font-medium">Montería</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">V</span>
        </div>
      </div>

      {/* Simulated Map */}
      <div className="px-4 mb-5">
        <SimulatedMap />
      </div>

      {/* Feed "Cerca de ti" */}
      <div className="px-4 pb-4">
        <h2 className="text-white font-semibold text-base mb-3">Cerca de ti</h2>
        <div className="flex flex-col gap-4">
          {PARCHES.map((parche) => (
            <ParcheCard key={parche.id} parche={parche} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center text-foreground font-sans">
      <div className="w-full max-w-[428px] relative h-[100dvh] overflow-hidden flex flex-col bg-background shadow-2xl">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-[88px]">
          {activeTab === "inicio" && <InicioView />}

          {activeTab === "plan" && (
            <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mt-12 flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">Mi Plan</h2>
                <p className="text-muted-foreground">Aquí verás los eventos a los que vas.</p>
                
                <div className="mt-12 flex flex-col items-center justify-center text-center space-y-4 h-64 border border-dashed border-border rounded-2xl bg-card/50">
                  <CalendarDays className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">No tienes planes para hoy.</p>
                  <button 
                    onClick={() => setActiveTab("inicio")}
                    className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                  >
                    Explorar eventos
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "escanear" && (
            <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mt-12 flex flex-col items-center justify-center h-full max-h-[600px]">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Escanear</h2>
                  <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
                    Escanea un código QR para acceder a un evento.
                  </p>
                </div>
                
                <div className="relative w-64 h-64 rounded-3xl border-2 border-primary/50 flex items-center justify-center bg-card/30 overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                  {/* Scanning animation line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(99,102,241,1)] animate-[pulse_2s_ease-in-out_infinite]" style={{ animation: "scan 3s linear infinite" }} />
                  
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scan {
                      0% { transform: translateY(0); }
                      50% { transform: translateY(256px); }
                      100% { transform: translateY(0); }
                    }
                  `}} />
                  
                  <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded-2xl" />
                  <QrCode className="w-16 h-16 text-primary/40" />
                </div>
                
                <button className="mt-12 bg-primary/10 text-primary border border-primary/30 px-6 py-3 rounded-full font-medium tracking-wide hover:bg-primary/20 transition-colors">
                  Ingresar código manual
                </button>
              </div>
            </div>
          )}

          {activeTab === "perfil" && (
            <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mt-12 flex-1">
                <h2 className="text-3xl font-bold text-white mb-8">Mi Perfil</h2>
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Usuario Vinku</h3>
                    <p className="text-muted-foreground text-sm">Gestiona tu cuenta y preferencias</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {['Entradas', 'Historial', 'Ajustes', 'Ayuda'].map((item) => (
                    <div key={item} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                      <span className="font-medium text-foreground/90">{item}</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full h-[88px] bg-[#0a0a0c]/95 backdrop-blur-md border-t border-border/50 flex items-start justify-around px-2 pt-3 pb-8 z-50">
          <NavItem 
            icon={<HomeIcon className="w-6 h-6" />} 
            label="Inicio" 
            isActive={activeTab === "inicio"} 
            onClick={() => setActiveTab("inicio")} 
          />
          <NavItem 
            icon={<CalendarDays className="w-6 h-6" />} 
            label="Plan" 
            isActive={activeTab === "plan"} 
            onClick={() => setActiveTab("plan")} 
          />
          
          {/* Center QR Button - Floating */}
          <div className="relative -top-7 flex flex-col items-center">
            <button
              onClick={() => setActiveTab("escanear")}
              className={cn(
                "w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 shadow-lg transition-all duration-300 z-50",
                activeTab === "escanear" 
                  ? "border-primary shadow-[0_0_20px_rgba(99,102,241,0.6)] text-primary scale-105" 
                  : "border-primary/50 text-white hover:border-primary hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              )}
            >
              <QrCode className="w-7 h-7" />
            </button>
            <span className={cn(
              "text-[10px] mt-2 font-medium transition-colors duration-200",
              activeTab === "escanear" ? "text-primary" : "text-muted-foreground"
            )}>
              Escanear
            </span>
          </div>

          <NavItem 
            icon={<User className="w-6 h-6" />} 
            label="Perfil" 
            isActive={activeTab === "perfil"} 
            onClick={() => setActiveTab("perfil")} 
          />
          
          {/* Spacer to balance the 5 items grid layout where the center is the QR */}
          <div className="w-[52px] hidden" /> {/* Hidden but mentally there for spacing if needed, but flex-around handles it well */}
        </nav>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-[64px] gap-1 transition-all duration-200",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      <div className={cn(
        "transition-transform duration-200",
        isActive && "scale-110"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileLayout />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
