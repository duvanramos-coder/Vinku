import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext, useState } from "react";
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
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const queryClient = new QueryClient();

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */

type Tab = "inicio" | "plan" | "escanear" | "perfil";

type Plan = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  totalCupos: number;
  availableCupos: number;
  image: string;
  coordinates: { lat: number; lng: number };
  confirmedAttendees: string[];
};

/* ═══════════════════════════════════════════
   INITIAL DATA
═══════════════════════════════════════════ */

const INITIAL_PLANES: Plan[] = [
  {
    id: 1,
    title: "La Troja Montería",
    description:
      "La noche más emblemática del centro. Música en vivo, cócteles artesanales y un ambiente que no para hasta el amanecer. Ven con tu crew y vive la experiencia Troja.",
    location: "Calle 41 #3-15, Montería",
    date: "Sábado, 3 de mayo",
    time: "10:00 PM",
    totalCupos: 30,
    availableCupos: 8,
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80",
    coordinates: { lat: 8.7479, lng: -75.8814 },
    confirmedAttendees: ["Felix", "Aneka", "Mia"],
  },
  {
    id: 2,
    title: "Parche El Patio",
    description:
      "El spot secreto de la ciudad. Terraza descubierta, DJ en vivo y las mejores cervezas artesanales de Córdoba. Cupos muy limitados — llega temprano.",
    location: "Carrera 5 #22-10, Montería",
    date: "Viernes, 2 de mayo",
    time: "9:00 PM",
    totalCupos: 20,
    availableCupos: 4,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    coordinates: { lat: 8.7551, lng: -75.8762 },
    confirmedAttendees: ["Sara", "Luis", "Tomas", "Camila"],
  },
  {
    id: 3,
    title: "Cócteles Sinú",
    description:
      "Una noche sofisticada a orillas del Sinú. Carta de mixología premium, música lounge y vista al río. El plan perfecto para empezar la noche con estilo.",
    location: "Av. Circunvalar #29, Montería",
    date: "Sábado, 3 de mayo",
    time: "8:30 PM",
    totalCupos: 25,
    availableCupos: 12,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    coordinates: { lat: 8.7432, lng: -75.8891 },
    confirmedAttendees: ["Ana", "Jorge"],
  },
];

/* ═══════════════════════════════════════════
   GLOBAL STATE — VinkuContext
═══════════════════════════════════════════ */

type VinkuState = {
  planes: Plan[];
  selectedPlan: Plan | null;
  myActivePlans: Plan[];
  selectPlan: (plan: Plan) => void;
  clearPlan: () => void;
  joinPlan: (id: number) => void;
  isJoined: (id: number) => boolean;
};

const VinkuContext = createContext<VinkuState | null>(null);

function useVinku(): VinkuState {
  const ctx = useContext(VinkuContext);
  if (!ctx) throw new Error("useVinku must be used inside VinkuProvider");
  return ctx;
}

function VinkuProvider({ children }: { children: React.ReactNode }) {
  const [planes, setPlanes] = useState<Plan[]>(INITIAL_PLANES);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [myActivePlans, setMyActivePlans] = useState<Plan[]>([]);

  function selectPlan(plan: Plan) {
    const fresh = planes.find((p) => p.id === plan.id) ?? plan;
    setSelectedPlan(fresh);
  }

  function clearPlan() {
    setSelectedPlan(null);
  }

  function isJoined(id: number): boolean {
    return myActivePlans.some((p) => p.id === id);
  }

  function joinPlan(id: number) {
    if (isJoined(id)) return;

    setPlanes((prev) =>
      prev.map((p) =>
        p.id === id && p.availableCupos > 0
          ? { ...p, availableCupos: p.availableCupos - 1 }
          : p
      )
    );
    setSelectedPlan((prev) =>
      prev?.id === id && prev.availableCupos > 0
        ? { ...prev, availableCupos: prev.availableCupos - 1 }
        : prev
    );
    setMyActivePlans((prev) => {
      const plan = planes.find((p) => p.id === id);
      if (!plan || prev.some((p) => p.id === id)) return prev;
      return [...prev, plan];
    });
  }

  return (
    <VinkuContext.Provider
      value={{ planes, selectedPlan, myActivePlans, selectPlan, clearPlan, joinPlan, isJoined }}
    >
      {children}
    </VinkuContext.Provider>
  );
}

/* ═══════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════ */

/* ─── Interactive Map ─── */
const MONTERIA: [number, number] = [8.7479, -75.8814];

function createPlanIcon(isLow: boolean) {
  const color = isLow ? "#f59e0b" : "#6366f1";
  const ring = isLow ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.25)";
  const glow = isLow ? "rgba(245,158,11,0.55)" : "rgba(99,102,241,0.55)";
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:${color};
        box-shadow:0 0 0 6px ${ring},0 0 18px ${glow};
        border:2.5px solid rgba(255,255,255,0.85);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
      ">
        <div style="width:9px;height:9px;border-radius:50%;background:#fff;opacity:0.9;"></div>
      </div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function InteractiveMap({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) {
  const { planes } = useVinku();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 210 }}>
      {/* Search bar overlay — above map */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0f0f18]/90 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 shadow-lg">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-sm">¿Dónde es el parche hoy?</span>
        </div>
      </div>

      <MapContainer
        center={MONTERIA}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%", borderRadius: "16px", background: "#0d0d11" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        {planes.map((plan) => (
          <Marker
            key={plan.id}
            position={[plan.coordinates.lat, plan.coordinates.lng]}
            icon={createPlanIcon(plan.availableCupos <= 5)}
            eventHandlers={{ click: () => onSelectPlan(plan) }}
          />
        ))}
      </MapContainer>

      {/* Bottom fade to match app background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[999]"
        style={{ background: "linear-gradient(to top, #0a0a0c, transparent)" }}
      />
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

/* ─── Cupos Progress Bar ─── */
function CuposBar({ available, total }: { available: number; total: number }) {
  const pct = Math.max(0, Math.min(100, ((total - available) / total) * 100));
  const isLow = available <= 5;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted-foreground font-medium">
          {total - available} de {total} asistentes confirmados
        </span>
        <span
          className={cn("text-xs font-bold", isLow ? "text-amber-400" : "text-emerald-400")}
        >
          {available} {isLow ? "¡últimos!" : "disponibles"}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            isLow
              ? "bg-gradient-to-r from-amber-500 to-amber-400"
              : "bg-gradient-to-r from-primary to-indigo-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Plan Card (clickable) ─── */
function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  const isLow = plan.availableCupos <= 5;
  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border/60 flex flex-col active:scale-[0.98] transition-transform duration-150"
      onClick={onSelect}
      data-testid={`card-plan-${plan.id}`}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border",
              isLow
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            )}
          >
            <Users className="w-3 h-3" />
            {plan.availableCupos} cupos
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-base mb-1 leading-tight">{plan.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{plan.location}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Desde las {plan.time}</span>
        </div>
        <CuposBar available={plan.availableCupos} total={plan.totalCupos} />
        <div className="flex items-center justify-between mt-3">
          <AvatarStack seeds={plan.confirmedAttendees} />
          <span className="bg-primary/15 border border-primary/30 text-primary text-xs font-semibold px-4 py-2 rounded-full">
            Ver plan
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════ */

/* ─── Inicio View ─── */
function InicioView({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) {
  const { planes } = useVinku();

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
        <InteractiveMap onSelectPlan={onSelectPlan} />
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-white font-semibold text-base mb-3">Cerca de ti</h2>
        <div className="flex flex-col gap-4">
          {planes.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={() => onSelectPlan(plan)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Plan Detail View ─── */
function PlanView({ onBack }: { onBack: () => void }) {
  const { selectedPlan, joinPlan, isJoined } = useVinku();
  const [joining, setJoining] = useState(false);

  if (!selectedPlan) return null;

  const plan = selectedPlan;
  const isLow = plan.availableCupos <= 5;
  const joined = isJoined(plan.id);

  function handleJoin() {
    if (joining || joined || plan.availableCupos === 0) return;
    setJoining(true);
    setTimeout(() => {
      joinPlan(plan.id);
      setJoining(false);
    }, 2000);
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      {/* Hero Image */}
      <div className="relative w-full" style={{ height: "40dvh" }}>
        <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <button
          onClick={onBack}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          data-testid="btn-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-12 right-4">
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border",
              isLow
                ? "bg-amber-500/25 border-amber-500/40 text-amber-400"
                : "bg-emerald-500/25 border-emerald-500/40 text-emerald-400"
            )}
          >
            <Users className="w-3 h-3" />
            {plan.availableCupos} cupos
          </span>
        </div>
      </div>

      {/* Detail card */}
      <div
        className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-6 px-5 pt-6 pb-32 flex flex-col gap-5"
        style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.6)" }}
      >
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-3">{plan.title}</h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{plan.description}</p>

          {/* Meta rows */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Fecha</p>
                <p className="text-sm text-white font-medium">{plan.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Hora</p>
                <p className="text-sm text-white font-medium">Desde las {plan.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Ubicación</p>
                <p className="text-sm text-white font-medium">{plan.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Capacidad</p>
                <CuposBar available={plan.availableCupos} total={plan.totalCupos} />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Quiénes van */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Ya van {plan.confirmedAttendees.length} persona{plan.confirmedAttendees.length !== 1 ? "s" : ""}
          </p>
          <AvatarStack seeds={plan.confirmedAttendees} />
        </div>

        {/* Beneficio Vinku */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.35)",
          }}
        >
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
            <p className="text-white font-semibold text-sm leading-snug">15% DTO. en la cuenta</p>
            <p className="text-muted-foreground text-xs mt-0.5">Muestra tu QR Vinku al pagar</p>
          </div>
        </div>
      </div>

      {/* Join button */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[428px] px-5 pb-3 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleJoin}
            disabled={joining || joined || plan.availableCupos === 0}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
              joined
                ? "bg-emerald-600/80 text-white cursor-default"
                : joining || plan.availableCupos === 0
                ? "bg-primary/40 text-primary/70 cursor-not-allowed"
                : "text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_32px_rgba(99,102,241,0.65)] active:scale-[0.98]"
            )}
            style={
              joined || joining || plan.availableCupos === 0
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
            ) : joined ? (
              "¡Ya eres parte del plan! 🎉"
            ) : plan.availableCupos === 0 ? (
              "Sin cupos disponibles"
            ) : (
              "¡ME UNO AL PLAN!"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Placeholder Plan (empty) ─── */
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

      <div className="flex flex-col items-center pt-14 pb-6 px-6 text-center">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
          Vinku · Validar parche
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full px-8">
        <div className="relative" style={{ width: 260, height: 260 }}>
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.15)" }}
          />

          <svg className="absolute top-0 left-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite" }}>
            <path d="M2 18 L2 2 L18 2" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          <svg className="absolute top-0 right-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 0.6s" }}>
            <path d="M34 18 L34 2 L18 2" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          <svg className="absolute bottom-0 left-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 1.2s" }}>
            <path d="M2 18 L2 34 L18 34" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>
          <svg className="absolute bottom-0 right-0" width="36" height="36" viewBox="0 0 36 36" fill="none"
            style={{ animation: "corner-pulse 2.4s ease-in-out infinite 1.8s" }}>
            <path d="M34 18 L34 34 L18 34" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6366f1)" }} />
          </svg>

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

          <div className="absolute inset-0 flex items-center justify-center">
            <QrCode className="w-16 h-16" style={{ color: "rgba(99,102,241,0.12)" }} />
          </div>
        </div>

        <p className="text-white/60 text-sm text-center leading-relaxed max-w-[220px]">
          Escanea el código de tu mesa para validar tu parche y obtener tu descuento.
        </p>
      </div>

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
  { icon: Ticket,     label: "Mis Entradas", sub: "Ver historial de accesos" },
  { icon: History,    label: "Historial",    sub: "Parches anteriores" },
  { icon: Settings,   label: "Ajustes",      sub: "Cuenta y privacidad" },
  { icon: HelpCircle, label: "Ayuda",        sub: "Soporte Vinku" },
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
  const { myActivePlans } = useVinku();

  return (
    <div className="flex flex-col animate-in fade-in duration-300 pb-6">
      <div
        className="w-full h-28 relative"
        style={{
          background: "linear-gradient(160deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.05) 60%, transparent 100%)",
        }}
      />

      <div className="px-5 -mt-14 flex items-end justify-between mb-4">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-background"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 0 24px rgba(99,102,241,0.25)",
            }}
          >
            <span className="text-3xl font-bold text-white tracking-tight select-none">DR</span>
          </div>
          <span
            className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background block"
            style={{ boxShadow: "0 0 6px rgba(16,185,129,0.7)" }}
          />
        </div>

        <button className="mt-8 px-4 py-2 rounded-xl border border-border/70 bg-card text-muted-foreground text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Editar perfil
        </button>
      </div>

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

      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={String(23 + myActivePlans.length)} label="Parches asistidos" />
          <StatCard value="47" label="Amigos conectados" />
          <StatCard value="4.9" label="Rating comunidad" />
        </div>
      </div>

      <div className="mx-5 h-px bg-border/50 mb-5" />

      <div className="px-5 mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Intereses
        </h3>
        <div className="flex flex-wrap gap-2">
          {INTERESES.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
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

      <div className="mx-5 h-px bg-border/50 mb-5" />

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

/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */

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

/* ─── Mobile Layout ─── */
function MobileLayout() {
  const { selectedPlan, selectPlan, clearPlan } = useVinku();
  const [activeTab, setActiveTab] = useState<Tab>("inicio");

  function handleSelectPlan(plan: Plan) {
    selectPlan(plan);
    setActiveTab("plan");
  }

  function handleBackFromPlan() {
    clearPlan();
    setActiveTab("inicio");
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center text-foreground font-sans overflow-x-hidden">
      <div className="w-full max-w-[428px] relative h-[100dvh] overflow-hidden flex flex-col bg-background shadow-2xl">

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[88px]">
          <div key={activeTab + String(selectedPlan?.id ?? "")} className="view-enter min-h-full">
            {activeTab === "inicio" && (
              <InicioView onSelectPlan={handleSelectPlan} />
            )}

            {activeTab === "plan" && selectedPlan && (
              <PlanView onBack={handleBackFromPlan} />
            )}

            {activeTab === "plan" && !selectedPlan && (
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
            onClick={() => { setActiveTab("inicio"); clearPlan(); }}
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

/* ─── Wrap MobileLayout with context ─── */
function MobileLayoutWithContext() {
  return (
    <VinkuProvider>
      <MobileLayout />
    </VinkuProvider>
  );
}

/* ═══════════════════════════════════════════
   ROOT
═══════════════════════════════════════════ */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileLayoutWithContext />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
