import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import {
  Home as HomeIcon,
  CalendarDays,
  QrCode,
  User,
  MapPin,
  Search,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Star,
  Settings,
  Ticket,
  History,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

type Tab = "inicio" | "plan" | "escanear" | "perfil";

type Parche = {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  cupos: number;
  image: string;
  avatarSeeds: string[];
};

const PARCHES: Parche[] = [
  {
    id: 1,
    title: "La Troja Montería",
    location: "Calle 41 #3-15, Montería",
    date: "Sábado, 3 de mayo",
    time: "10:00 PM",
    cupos: 8,
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80",
    avatarSeeds: ["Felix", "Aneka", "Mia"],
  },
  {
    id: 2,
    title: "Parche El Patio",
    location: "Carrera 5 #22-10, Montería",
    date: "Viernes, 2 de mayo",
    time: "9:00 PM",
    cupos: 4,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    avatarSeeds: ["Sara", "Luis", "Tomas", "Camila"],
  },
  {
    id: 3,
    title: "Cócteles Sinú",
    location: "Av. Circunvalar #29, Montería",
    date: "Sábado, 3 de mayo",
    time: "8:30 PM",
    cupos: 12,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    avatarSeeds: ["Ana", "Jorge"],
  },
];

/* ─── Simulated Map ─── */
function SimulatedMap() {
  const markers = [
    { cx: 80, cy: 90 },
    { cx: 200, cy: 140 },
    { cx: 310, cy: 80 },
    { cx: 140, cy: 200 },
    { cx: 270, cy: 195 },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 210 }}>
      <svg viewBox="0 0 390 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="390" height="210" fill="#0d0d11" />
        {[30, 70, 110, 150, 190].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="390" y2={y} stroke="#1a1a24" strokeWidth="1" />
        ))}
        {[50, 100, 150, 200, 250, 300, 350].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="210" stroke="#1a1a24" strokeWidth="1" />
        ))}
        <path d="M 0 105 Q 100 95 200 105 Q 300 115 390 105" stroke="#22223a" strokeWidth="8" fill="none" />
        <path d="M 195 0 Q 190 60 200 105 Q 210 150 195 210" stroke="#22223a" strokeWidth="8" fill="none" />
        <path d="M 0 60 Q 120 55 200 65 Q 280 75 390 65" stroke="#1e1e30" strokeWidth="5" fill="none" />
        <path d="M 0 155 Q 130 148 200 155 Q 300 162 390 155" stroke="#1e1e30" strokeWidth="5" fill="none" />
        <path d="M 100 0 Q 95 80 100 210" stroke="#1e1e30" strokeWidth="4" fill="none" />
        <path d="M 300 0 Q 305 80 300 210" stroke="#1e1e30" strokeWidth="4" fill="none" />
        <rect x="52" y="12" width="44" height="44" rx="3" fill="#13131c" />
        <rect x="205" y="12" width="90" height="44" rx="3" fill="#13131c" />
        <rect x="52" y="70" width="44" height="30" rx="3" fill="#13131c" />
        <rect x="52" y="115" width="44" height="35" rx="3" fill="#13131c" />
        <rect x="205" y="115" width="90" height="35" rx="3" fill="#13131c" />
        <rect x="305" y="70" width="82" height="80" rx="3" fill="#13131c" />
        {markers.map((m, i) => (
          <g key={i}>
            <circle cx={m.cx} cy={m.cy} r="14" fill="rgba(99,102,241,0.08)" />
            <circle cx={m.cx} cy={m.cy} r="9" fill="rgba(99,102,241,0.15)" />
            <circle cx={m.cx} cy={m.cy} r="5" fill="#6366f1" style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
            <circle cx={m.cx} cy={m.cy} r="2.5" fill="#a5b4fc" />
          </g>
        ))}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
        </defs>
        <rect width="390" height="210" fill="url(#vignette)" />
      </svg>
      <div className="absolute top-3 left-3 right-3">
        <div className="flex items-center gap-2 bg-[#0f0f18]/90 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 shadow-lg">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-sm">¿Dónde es el parche hoy?</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}

/* ─── Avatar Stack ─── */
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

/* ─── Parche Card (clickable) ─── */
function ParcheCard({ parche, onSelect }: { parche: Parche; onSelect: () => void }) {
  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border/60 flex flex-col active:scale-[0.98] transition-transform duration-150"
      onClick={onSelect}
      data-testid={`card-parche-${parche.id}`}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={parche.image} alt={parche.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Users className="w-3 h-3" />
            {parche.cupos} cupos
          </span>
        </div>
      </div>
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
          <span className="bg-primary/15 border border-primary/30 text-primary text-xs font-semibold px-4 py-2 rounded-full">
            Ver plan
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Inicio View ─── */
function InicioView({ onSelectParche }: { onSelectParche: (p: Parche) => void }) {
  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-white leading-none"
            style={{ textShadow: "0 0 20px rgba(99,102,241,0.5)" }}
          >
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

      <div className="px-4 mb-5">
        <SimulatedMap />
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-white font-semibold text-base mb-3">Cerca de ti</h2>
        <div className="flex flex-col gap-4">
          {PARCHES.map((parche) => (
            <ParcheCard key={parche.id} parche={parche} onSelect={() => onSelectParche(parche)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Plan Detail View ─── */
function PlanView({ parche, onBack }: { parche: Parche; onBack: () => void }) {
  const [joining, setJoining] = useState(false);

  function handleJoin() {
    if (joining) return;
    setJoining(true);
    setTimeout(() => setJoining(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      {/* Hero Image — 40% of viewport height */}
      <div className="relative w-full" style={{ height: "40dvh" }}>
        <img src={parche.image} alt={parche.title} className="w-full h-full object-cover" />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Floating back button */}
        <button
          onClick={onBack}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          data-testid="btn-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Cupos badge on hero */}
        <div className="absolute top-12 right-4">
          <span className="flex items-center gap-1 bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Users className="w-3 h-3" />
            {parche.cupos} cupos
          </span>
        </div>
      </div>

      {/* Detail card — overlaps hero */}
      <div
        className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-6 px-5 pt-6 pb-32 flex flex-col gap-5"
        style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.6)" }}
      >
        {/* Title + meta */}
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-4">{parche.title}</h2>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Fecha</p>
                <p className="text-sm text-white font-medium">{parche.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Hora</p>
                <p className="text-sm text-white font-medium">Desde las {parche.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Ubicación</p>
                <p className="text-sm text-white font-medium">{parche.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/60" />

        {/* Quiénes van */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Ya van {parche.avatarSeeds.length} personas
          </p>
          <AvatarStack seeds={parche.avatarSeeds} />
        </div>

        {/* Beneficio Vinku card */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.35)",
          }}
        >
          {/* Glow blob */}
          <div
            className="absolute -right-4 -top-4 w-24 h-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }}
          />
          <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 z-10">
            <QrCode className="w-5 h-5 text-primary" />
          </div>
          <div className="z-10">
            <p className="text-[10px] text-primary/70 uppercase tracking-widest font-semibold mb-0.5">
              Exclusivo Vinku
            </p>
            <p className="text-white font-semibold text-sm leading-snug">
              15% DTO. en la cuenta
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Muestra tu QR Vinku al pagar
            </p>
          </div>
        </div>
      </div>

      {/* Join button — fixed at bottom inside the scroll container */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[428px] px-5 pb-3 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleJoin}
            disabled={joining}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
              joining
                ? "bg-primary/40 text-primary/70 cursor-not-allowed"
                : "text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_32px_rgba(99,102,241,0.65)] active:scale-[0.98]"
            )}
            style={
              joining
                ? {}
                : { background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" }
            }
            data-testid="btn-unirse"
          >
            {joining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uniéndose al plan...</span>
              </>
            ) : (
              "¡ME UNO AL PLAN!"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Placeholder Plan (when no parche selected) ─── */
function PlanEmpty({ onGoInicio }: { onGoInicio: () => void }) {
  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="mt-12 flex-1">
        <h2 className="text-3xl font-bold text-white mb-2">Mi Plan</h2>
        <p className="text-muted-foreground">Aquí verás los eventos a los que vas.</p>
        <div className="mt-12 flex flex-col items-center justify-center text-center space-y-4 h-64 border border-dashed border-border rounded-2xl bg-card/50">
          <CalendarDays className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No tienes planes para hoy.</p>
          <button
            onClick={onGoInicio}
            className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Explorar eventos
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Escanear View ─── */
function EscanearView({ onCancel }: { onCancel: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-between animate-in fade-in duration-300"
      style={{ minHeight: "calc(100dvh - 88px)", background: "#000" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes laser-sweep {
          0%   { top: 0px; opacity: 1; }
          48%  { opacity: 1; }
          50%  { top: calc(100% - 3px); opacity: 0.7; }
          52%  { opacity: 1; }
          100% { top: 0px; opacity: 1; }
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
      ` }} />

      {/* Top spacer / label */}
      <div className="flex flex-col items-center pt-14 pb-6 px-6 text-center">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
          Vinku · Validar parche
        </p>
      </div>

      {/* Viewfinder */}
      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full px-8">
        {/* Scanner box */}
        <div
          className="relative"
          style={{ width: 260, height: 260 }}
        >
          {/* Dark semi-transparent fill */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.15)" }}
          />

          {/* Corner markers — top-left */}
          <svg className="absolute top-0 left-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite" }}>
            <path d="M2 18 L2 2 L18 2" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          {/* Corner markers — top-right */}
          <svg className="absolute top-0 right-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 0.6s" }}>
            <path d="M34 18 L34 2 L18 2" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          {/* Corner markers — bottom-left */}
          <svg className="absolute bottom-0 left-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 1.2s" }}>
            <path d="M2 18 L2 34 L18 34" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          {/* Corner markers — bottom-right */}
          <svg className="absolute bottom-0 right-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 1.8s" }}>
            <path d="M34 18 L34 34 L18 34" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>

          {/* Laser line — contained inside the box */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div
              className="absolute left-0 w-full"
              style={{
                height: 3,
                background: "linear-gradient(90deg, transparent 0%, #818cf8 20%, #a5b4fc 50%, #818cf8 80%, transparent 100%)",
                boxShadow: "0 0 10px 3px rgba(99,102,241,0.7), 0 0 24px 6px rgba(99,102,241,0.3)",
                borderRadius: 2,
                animation: "laser-sweep 2.2s cubic-bezier(0.45,0,0.55,1) infinite",
              }}
            />
          </div>

          {/* Center QR ghost icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <QrCode className="w-16 h-16" style={{ color: "rgba(99,102,241,0.12)" }} />
          </div>
        </div>

        {/* Instruction text */}
        <p className="text-white/60 text-sm text-center leading-relaxed max-w-[220px]">
          Escanea el código de tu mesa para validar tu parche y obtener tu descuento.
        </p>
      </div>

      {/* Cancel button */}
      <div className="pb-8 px-8 w-full">
        <button
          onClick={onCancel}
          className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
          }}
          data-testid="btn-cancelar-scan"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ─── Perfil View ─── */
const INTERESES = ["Salsa", "Cerveza Artesanal", "Rooftops", "Fútbol", "Electrónica", "Planes Nocturnos"];

const MENU_ITEMS = [
  { icon: Ticket,      label: "Mis Entradas",   sub: "Ver historial de accesos" },
  { icon: History,     label: "Historial",       sub: "Parches anteriores" },
  { icon: Settings,    label: "Ajustes",         sub: "Cuenta y privacidad" },
  { icon: HelpCircle,  label: "Ayuda",           sub: "Soporte Vinku" },
];

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-card border border-border/60">
      <span
        className="text-3xl font-bold text-white leading-none"
        style={{ textShadow: "0 0 18px rgba(99,102,241,0.45)" }}
      >
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground font-medium text-center leading-tight px-2">
        {label}
      </span>
    </div>
  );
}

function PerfilView() {
  return (
    <div className="flex flex-col animate-in fade-in duration-300 pb-6">
      {/* Header banner with subtle gradient */}
      <div
        className="w-full h-28 relative"
        style={{
          background: "linear-gradient(160deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.05) 60%, transparent 100%)",
        }}
      />

      {/* Avatar — overlaps banner */}
      <div className="px-5 -mt-14 flex items-end justify-between mb-4">
        <div className="relative">
          {/* Avatar circle */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-background"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 0 24px rgba(99,102,241,0.25)",
            }}
          >
            <span className="text-3xl font-bold text-white tracking-tight select-none">DR</span>
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background block"
            style={{ boxShadow: "0 0 6px rgba(16,185,129,0.7)" }}
          />
        </div>

        {/* Edit / Settings shortcut */}
        <button className="mt-8 px-4 py-2 rounded-xl border border-border/70 bg-card text-muted-foreground text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Editar perfil
        </button>
      </div>

      {/* User info */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-xl font-bold text-white tracking-tight">Duvan Ramos</h2>
          <span className="text-muted-foreground text-sm">· 24</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium" style={{ color: "#818cf8" }}>
            Montería&nbsp;·&nbsp;Embajador
          </span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 ml-0.5" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value="23" label="Parches asistidos" />
          <StatCard value="47" label="Amigos conectados" />
          <StatCard value="4.9" label="Rating comunidad" />
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-border/50 mb-5" />

      {/* Interests */}
      <div className="px-5 mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Intereses
        </h3>
        <div className="flex flex-wrap gap-2">
          {INTERESES.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#a5b4fc",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-border/50 mb-5" />

      {/* Menu items */}
      <div className="px-5 flex flex-col gap-2">
        {MENU_ITEMS.map(({ icon: Icon, label, sub }) => (
          <button
            key={label}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-border transition-colors active:scale-[0.98] duration-150"
            data-testid={`btn-menu-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Mobile Layout ─── */
function MobileLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [selectedParche, setSelectedParche] = useState<Parche | null>(null);

  function handleSelectParche(parche: Parche) {
    setSelectedParche(parche);
    setActiveTab("plan");
  }

  function handleBackFromPlan() {
    setActiveTab("inicio");
    setSelectedParche(null);
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center text-foreground font-sans overflow-x-hidden">
      <div className="w-full max-w-[428px] relative h-[100dvh] overflow-hidden flex flex-col bg-background shadow-2xl">

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[88px]">
          <div key={activeTab + String(selectedParche?.id ?? "")} className="view-enter min-h-full">
            {activeTab === "inicio" && (
              <InicioView onSelectParche={handleSelectParche} />
            )}

            {activeTab === "plan" && selectedParche && (
              <PlanView parche={selectedParche} onBack={handleBackFromPlan} />
            )}

            {activeTab === "plan" && !selectedParche && (
              <PlanEmpty onGoInicio={() => setActiveTab("inicio")} />
            )}

            {activeTab === "escanear" && (
              <EscanearView onCancel={() => setActiveTab("inicio")} />
            )}

            {activeTab === "perfil" && <PerfilView />}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full h-[88px] bg-[#0a0a0c]/95 backdrop-blur-md border-t border-border/50 flex items-start justify-around px-2 pt-3 pb-8 z-50">
          <NavItem
            icon={<HomeIcon className="w-6 h-6" />}
            label="Inicio"
            isActive={activeTab === "inicio"}
            onClick={() => { setActiveTab("inicio"); setSelectedParche(null); }}
          />
          <NavItem
            icon={<CalendarDays className="w-6 h-6" />}
            label="Plan"
            isActive={activeTab === "plan"}
            onClick={() => setActiveTab("plan")}
          />

          {/* Center QR Button */}
          <div className="relative -top-7 flex flex-col items-center">
            <button
              onClick={() => setActiveTab("escanear")}
              className={cn(
                "w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 transition-all duration-300 z-50 active:scale-[0.90]",
                activeTab === "escanear"
                  ? "border-primary shadow-[0_0_24px_rgba(99,102,241,0.7)] text-primary scale-105"
                  : "border-primary/60 text-white qr-pulse"
              )}
            >
              <QrCode className="w-7 h-7" />
            </button>
            <span
              className={cn(
                "text-[10px] mt-2 font-medium transition-colors duration-200",
                activeTab === "escanear" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Escanear
            </span>
          </div>

          <NavItem
            icon={<User className="w-6 h-6" />}
            label="Perfil"
            isActive={activeTab === "perfil"}
            onClick={() => setActiveTab("perfil")}
          />
        </nav>
      </div>
    </div>
  );
}

/* ─── Nav Item ─── */
function NavItem({
  icon,
  label,
  isActive,
  onClick,
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
        "flex flex-col items-center justify-center w-[64px] gap-1 transition-all duration-150 active:scale-[0.88]",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      <div className={cn("transition-transform duration-200", isActive && "scale-110")}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

/* ─── Root App ─── */
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
