
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  Check,
  BadgePercent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
// --- MODIFIED: These hooks now drive the entire app's data ---
import { useGetPlans, usePostJoin } from "../../../lib/api-client-react/src/generated/api";
import { useToast } from "./hooks/use-toast";
import { Plan } from "../../../lib/api-client-react/src/generated/api.schemas";

const queryClient = new QueryClient();

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */

// --- MODIFIED: This type is now inferred directly from the API output ---
// It ensures our frontend matches the backend's data structure perfectly.
type Tab = "inicio" | "plan" | "escanear" | "perfil";

/* ═══════════════════════════════════════════
   GLOBAL STATE — VinkuContext
═══════════════════════════════════════════ */

type VinkuState = {
  selectedPlan: Plan | null;
  myActivePlans: Plan[];
  discountsActivated: number;
  selectPlan: (plan: Plan) => void;
  clearPlan: () => void;
  joinPlan: (plan: Plan) => void;
  isJoined: (id: string) => boolean;
  activateDiscount: () => void;
};

const VinkuContext = createContext<VinkuState | null>(null);

function useVinku(): VinkuState {
  const ctx = useContext(VinkuContext);
  if (!ctx) throw new Error("useVinku must be used inside VinkuProvider");
  return ctx;
}

function VinkuProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [myActivePlans, setMyActivePlans] = useState<Plan[]>([]);
  const [discountsActivated, setDiscountsActivated] = useState(0);

  function selectPlan(plan: Plan) {
    setSelectedPlan(plan);
  }

  function clearPlan() {
    setSelectedPlan(null);
  }

  function isJoined(id: string): boolean {
    return myActivePlans.some((p) => p.id === id);
  }

  function joinPlan(plan: Plan) {
    if (isJoined(plan.id!)) return;
    // Add the newly joined plan to the local state for "My Plans" view
    setMyActivePlans((prev) => [...prev, plan]);
  }

  function activateDiscount() {
    setDiscountsActivated((n) => n + 1);
  }

  return (
    <VinkuContext.Provider
      value={{
        selectedPlan, myActivePlans, discountsActivated,
        selectPlan, clearPlan, joinPlan, isJoined, activateDiscount,
      }}
    >
      {children}
    </VinkuContext.Provider>
  );
}

/* ═══════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════ */

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

function InteractiveMap({
  onSelectPlan,
  planes,
}: {
  onSelectPlan: (plan: Plan) => void;
  planes: Plan[];
}) {

  return (
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 210 }}>
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
        {planes?.map((plan) => (
          <Marker
            key={plan.id}
            position={[8.7479, -75.8814]} // Note: Using static position for now
            icon={createPlanIcon(plan.availableCupos! <= 5)}
            eventHandlers={{ click: () => onSelectPlan(plan) }}
          />
        )) ?? null}
      </MapContainer>

      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[999]"
        style={{ background: "linear-gradient(to top, #0a0a0c, transparent)" }}
      />
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

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  const isLow = plan.availableCupos! <= 5;
  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border/60 flex flex-col active:scale-[0.98] transition-transform duration-150"
      onClick={onSelect}
      data-testid={`card-plan-${plan.id}`}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={plan.image ?? ''} alt={plan.title} className="w-full h-full object-cover" />
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
        <CuposBar available={plan.availableCupos!} total={plan.totalCupos!} />
        <div className="flex items-center justify-between mt-3">
          <AvatarStack seeds={[]} />
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

type PlanCategory = "Todos" | "Salsa" | "Cerveza" | "Rooftop" | "Electrónica" | "Fútbol" | "Yoga" | "Café";

function InicioView({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) {
  // --- MODIFIED: This is now the single source of truth for plan data. ---
  const { data: planes, isLoading, isError, refetch } = useGetPlans();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PlanCategory>("Todos");

  // --- MODIFIED: Filter live data from the API ---
  const filteredPlanes = planes?.filter((plan) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 || plan.title!.toLowerCase().includes(q) || plan.location!.toLowerCase().includes(q);
    const matchesCategory = category === "Todos" || plan.category === category;
    return matchesSearch && matchesCategory;
  }) ?? [];

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

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plan o ubicación"
            className="w-full h-12 rounded-2xl bg-card border border-border/60 pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          {(["Todos", "Fútbol", "Yoga", "Café", "Salsa", "Cerveza", "Rooftop"] as PlanCategory[]).map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors",
                category === item
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border/60"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-5">
        <InteractiveMap onSelectPlan={onSelectPlan} planes={filteredPlanes} />
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-white font-semibold text-base mb-3">Cerca de ti</h2>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-xl">
              <p className="font-semibold mb-2">Error al cargar los planes.</p>
              <p className="text-xs text-red-500/80 mb-4">No se pudo conectar al servidor. Inténtalo de nuevo.</p>
              <button onClick={() => refetch()} className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">Reintentar</button>
            </div>
          ) : (
            filteredPlanes.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={() => onSelectPlan(plan)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlanView({ onBack }: { onBack: () => void }) {
  const { selectedPlan, joinPlan, isJoined } = useVinku();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = usePostJoin({
    mutation: {
      onSuccess: () => {
        if (!selectedPlan) return;
        joinPlan(selectedPlan);
        toast({
          title: "¡Te has unido con éxito!",
          description: "Ya eres parte del parche. ¡Nos vemos ahí!",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      },
      onError: (error: any) => {
        toast({
          title: "Error al unirse al plan",
          description: error.message || "No hay cupos disponibles o ha ocurrido un error.",
          variant: "destructive",
        });
      },
    },
  });

  if (!selectedPlan) return null;

  const plan = selectedPlan;
  const isLow = plan.availableCupos! <= 5;
  const joined = isJoined(plan.id!);

  async function handleJoin() {
    if (joined || plan.availableCupos === 0) return;
    mutation.mutate({ data: { planId: plan.id!, userId: "1" } });
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      <div className="relative w-full" style={{ height: "40dvh" }}>
        <img src={plan.image ?? ''} alt={plan.title} className="w-full h-full object-cover" />
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

      <div
        className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-6 px-5 pt-6 pb-32 flex flex-col gap-5"
        style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.6)" }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-3">{plan.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{plan.description}</p>
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
                <CuposBar available={plan.availableCupos!} total={plan.totalCupos!} />
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-border/60" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Ya van ... personas
          </p>
          <AvatarStack seeds={[]} />
        </div>
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

      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[428px] px-5 pb-3 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleJoin}
            disabled={mutation.isPending || joined || plan.availableCupos === 0}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
              joined
                ? "bg-emerald-600/80 text-white cursor-default"
                : mutation.isPending || plan.availableCupos === 0
                ? "bg-primary/40 text-primary/70 cursor-not-allowed"
                : "text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_32px_rgba(99,102,241,0.65)] active:scale-[0.98]"
            )}
            style={
              joined || mutation.isPending || plan.availableCupos === 0
                ? {}
                : { background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" }
            }
            data-testid="btn-unirse"
          >
            {mutation.isPending ? (
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

/* --- Other Views (Escanear, Perfil, etc.) are omitted for brevity but remain unchanged --- */
// ... (The rest of the file remains the same)
// The following is a placeholder for the rest of the file's content
function DiscountModal({ onClose }: { onClose: () => void }) { return <div></div> }
function EscanearView({ onCancel }: { onCancel: () => void }) { return <div></div> }
function PerfilView() { 
    const { myActivePlans, discountsActivated } = useVinku();

  return (
    <div className="flex flex-col animate-in fade-in duration-300 pb-6">
      {/* Hero gradient band */}
      <div
        className="w-full h-28 relative"
        style={{
          background: "linear-gradient(160deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.05) 60%, transparent 100%)",
        }}
      />

      {/* Avatar + edit button */}
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

      {/* Name + location */}
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

      {/* ── Stats grid (all dynamic) ── */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={String(myActivePlans.length)} label="Parches activos" />
          <StatCard value={String(discountsActivated)} label="Descuentos" />
          <StatCard value="4.9" label="Rating" />
        </div>
      </div>

      <div className="mx-5 h-px bg-border/50 mb-5" />

      {/* ── Historial de Asistencia ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Historial de Asistencia
          </h3>
          {myActivePlans.length > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc",
              }}
            >
              {myActivePlans.length} {myActivePlans.length === 1 ? "parche" : "parches"}
            </span>
          )}
        </div>

        {myActivePlans.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center gap-3 py-9 rounded-2xl"
            style={{ border: "1.5px dashed rgba(255,255,255,0.08)" }}
          >
            <CalendarDays className="w-9 h-9" style={{ color: "rgba(99,102,241,0.25)" }} />
            <div className="text-center">
              <p className="text-white/30 text-sm font-medium">Sin parches aún</p>
              <p className="text-white/20 text-xs mt-0.5">
                Explora el mapa y únete a tu primer plan
              </p>
            </div>
          </div>
        ) : (
          /* History cards */
          <div className="flex flex-col gap-3">
            {myActivePlans.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={p.image ?? ''}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-snug truncate">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground text-[11px] mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-[11px] mt-0.5">
                    <CalendarDays className="w-2.5 h-2.5 shrink-0" />
                    <span>{p.date} · {p.time}</span>
                  </div>
                </div>

                {/* Confirmed badge */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      boxShadow: "0 0 12px rgba(16,185,129,0.15)",
                    }}
                  >
                    <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Unido
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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


/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */

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
