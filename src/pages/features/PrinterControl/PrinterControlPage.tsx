import { useState, useEffect, useRef, type FC } from "react";
import {
    MoveUp, MoveDown, MoveLeft, MoveRight,
    Power, Home as HomeIcon,
    Magnet, ZapOff, PackagePlus, PackageMinus,
    Loader2, RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/constants";

// ─── Stałe (identyczne z JoystickService i GCodeService) ─────────────────────
const STEP_MM = 3.0;
const ACTION_DEBOUNCE = 1500; // ms — jak w JoystickService (1.5s)
// ──────────────────────────────────────────────────────────────────────────────

interface PrinterStatus {
    connected: boolean;
    port: string | null;
    baudrate: number | null;
    position_raw: string | null;
}

const PrinterControlPage: FC = () => {
    // ── Stan drukarki ──────────────────────────────────────────────────────────
    const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);

    // ── Stan joysticka ─────────────────────────────────────────────────────────
    const [step, setStep] = useState<number>(STEP_MM);
    const [isJogging, setIsJogging] = useState(false);

    // ── Pick / Place toggle (dokładna kopia logiki JoystickService) ─────────────
    const [isHolding, setIsHolding] = useState(false);
    const [isExecutingAction, setIsExecutingAction] = useState(false);
    const lastActionTimeRef = useRef<number>(0);

    // ── Magnes ─────────────────────────────────────────────────────────────────
    const [isMagnetBusy, setIsMagnetBusy] = useState(false);

    const isConnected = printerStatus?.connected ?? false;

    // ─── Polling statusu drukarki (co 2s) ──────────────────────────────────────
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}gcode/status`);
                if (res.ok) {
                    const data = await res.json();
                    setPrinterStatus(data);
                }
            } catch {
                // Cicho — brak połączenia z serwerem pokazany przez brak statusu
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    // ─── Home (G28) ──────────────────────────────────────────────────────────
    const handleHome = async () => {
        setIsJogging(true);
        try {
            const res = await fetch(`${API_URL}gcode/home`, { method: "POST" });
            if (res.ok) toast.success("Wybazowano osie (G28)");
            else toast.error("Nie udało się zbazować osi");
        } catch {
            toast.error("Błąd sieciowy");
        } finally {
            setIsJogging(false);
        }
    };

    // ─── JOG — fire-and-forget, identycznie jak ESP32 przez /joystick/report ───
    //     Nie blokujemy UI — Marlin buforuje komendy w lookahead
    const handleJog = (dx: number, dy: number, dz: number) => {
        if (isExecutingAction) return;
        fetch(`${API_URL}gcode/jog`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dx, dy, dz })
        }).catch(() => toast.error("Błąd joysticka"));
    };

    // ─── Magnes ──────────────────────────────────────────────────────────────
    const handleMagnet = async (on: boolean) => {
        setIsMagnetBusy(true);
        try {
            const res = await fetch(`${API_URL}${on ? "gcode/magnet/on" : "gcode/magnet/off"}`, { method: "POST" });
            if (res.ok) toast.success(on ? "Magnes WŁĄCZONY" : "Magnes WYŁĄCZONY");
            else toast.error("Błąd sterowania magnesem");
        } catch {
            toast.error("Błąd sieciowy");
        } finally {
            setIsMagnetBusy(false);
        }
    };

    // ─── Pick / Place toggle ─────────────────────────────────────────────────
    //     Kopia JoystickService._trigger_toggle_action()
    const handlePickPlace = () => {
        const now = Date.now();
        if (now - lastActionTimeRef.current < ACTION_DEBOUNCE) return;
        if (isExecutingAction) return;
        lastActionTimeRef.current = now;

        const newHolding = !isHolding;
        setIsHolding(newHolding);
        const action = newHolding ? "pick" : "place";

        setIsExecutingAction(true);
        fetch(`${API_URL}gcode/joystick/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    toast.success(data?.message ?? `Akcja ${action} wykonana`);
                } else {
                    const err = await res.json().catch(() => ({}));
                    toast.error(`Błąd ${action}: ${err?.detail ?? res.status}`);
                    setIsHolding(!newHolding); // Cofnij toggle przy błędzie
                }
            })
            .catch(() => {
                // Brak połączenia — NIE cofamy toggle (jak w JoystickService)
                toast.warning(`Drukarka niedostępna — stan "${action}" zachowany`);
            })
            .finally(() => setIsExecutingAction(false));
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const parsePosition = (raw: string | null): string => {
        if (!raw) return "Brak danych";
        const m = raw.match(/X:([\d.-]+)\s+Y:([\d.-]+)\s+Z:([\d.-]+)/);
        if (m) return `X: ${parseFloat(m[1]).toFixed(1)} mm | Y: ${parseFloat(m[2]).toFixed(1)} mm | Z: ${parseFloat(m[3]).toFixed(1)} mm`;
        return raw.split("\n")[0];
    };

    return (
        <div className="space-y-6">
            {/* Nagłówek */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plansza Magazynu</h1>
                    <p className="text-muted-foreground">Panel zarządzania fizycznym ramieniem magazynowym.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto w-full">

                {/* ── Panel Kontrolny ───────────────────────────────────────── */}
                <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col gap-5">

                    {/* Status — tylko odczyt, bez przycisku Połącz */}
                    <div className="flex items-center gap-3 border-b pb-4">
                        <Power size={20} className={isConnected ? "text-green-500" : "text-muted-foreground"} />
                        <div>
                            <h2 className="text-base font-semibold leading-tight">
                                {isConnected ? "Drukarka połączona" : "Drukarka niepodłączona"}
                            </h2>
                            {printerStatus?.port
                                ? <p className="text-xs text-muted-foreground">{printerStatus.port} @ {printerStatus.baudrate} baud</p>
                                : <p className="text-xs text-muted-foreground">Oczekiwanie na pierwsze połączenie…</p>
                            }
                        </div>
                    </div>

                    {/* Pozycja */}
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <RefreshCw size={14} className="shrink-0" />
                        <span className="font-mono">{parsePosition(printerStatus?.position_raw ?? null)}</span>
                    </div>

                    {/* Kierunki X/Y */}
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-2">
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-medium text-xs text-muted-foreground mb-1">Osie X / Y</p>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(0, step, 0)}>
                                <MoveUp size={24} />
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(-step, 0, 0)}>
                                    <MoveLeft size={24} />
                                </Button>
                                <Button variant="default" size="icon" className="h-12 w-12" onClick={handleHome} disabled={isJogging}>
                                    <HomeIcon size={24} />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(step, 0, 0)}>
                                    <MoveRight size={24} />
                                </Button>
                            </div>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(0, -step, 0)}>
                                <MoveDown size={24} />
                            </Button>
                        </div>

                        {/* Oś Z */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-medium text-xs text-muted-foreground mb-1">Oś Z (góra/dół)</p>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(0, 0, step)}>
                                <MoveUp size={24} />
                            </Button>
                            <div className="h-12 w-12 flex items-center justify-center text-muted-foreground/30 text-xs">Z</div>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleJog(0, 0, -step)}>
                                <MoveDown size={24} />
                            </Button>
                        </div>
                    </div>

                    {/* Krok (mm) */}
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium mr-1">Krok (mm):</span>
                        {[1, 3, 5, 10, 30].map((val) => (
                            <Button
                                key={val}
                                variant={step === val ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStep(val)}
                            >
                                {val}
                            </Button>
                        ))}
                    </div>

                    {/* Magnes */}
                    <div className="flex gap-3 justify-center border-t pt-4">
                        <Button variant="outline" className="gap-2" onClick={() => handleMagnet(true)} disabled={isMagnetBusy}>
                            <Magnet size={18} className="text-blue-500" />
                            Magnes ON
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => handleMagnet(false)} disabled={isMagnetBusy}>
                            <ZapOff size={18} className="text-muted-foreground" />
                            Magnes OFF
                        </Button>
                    </div>

                    {/* Pick / Place */}
                    <div className="flex flex-col items-center gap-2 border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Akcja z aktualnej pozycji (auto-centrowanie nad najbliższym polem)
                        </p>
                        <Button
                            size="lg"
                            className={`w-full gap-2 transition-colors ${
                                isHolding
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-primary text-primary-foreground"
                            }`}
                            onClick={handlePickPlace}
                            disabled={isExecutingAction}
                        >
                            {isExecutingAction ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : isHolding ? (
                                <PackageMinus size={20} />
                            ) : (
                                <PackagePlus size={20} />
                            )}
                            {isExecutingAction
                                ? "Wykonywanie..."
                                : isHolding
                                    ? "PLACE — Odłóż element"
                                    : "PICK — Pobierz element"
                            }
                        </Button>
                        {isHolding && (
                            <p className="text-xs text-green-600 font-medium animate-pulse">
                                ● Magnes aktywny — element trzymany
                            </p>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default PrinterControlPage;
