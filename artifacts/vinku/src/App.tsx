import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { Home as HomeIcon, CalendarDays, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

type Tab = "inicio" | "plan" | "escanear" | "perfil";

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center text-foreground font-sans">
      <div className="w-full max-w-[428px] relative h-[100dvh] overflow-hidden flex flex-col bg-background shadow-2xl">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-[88px]">
          {activeTab === "inicio" && (
            <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mt-12 flex-1">
                <h1 className="text-4xl font-bold tracking-tighter text-white mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  Vinku
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[280px]">
                  Descubre los mejores planes de hoy en la ciudad.
                </p>
                <div className="mt-12 space-y-4">
                  <div className="h-48 rounded-2xl bg-card border border-border flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-muted-foreground font-medium">Eventos destacados</span>
                  </div>
                  <div className="h-48 rounded-2xl bg-card border border-border flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-muted-foreground font-medium">Lugares recomendados</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
