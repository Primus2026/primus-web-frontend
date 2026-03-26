import { useState, type FC } from "react";
import { MoveUp, MoveDown, MoveLeft, MoveRight, Maximize, Play, Power, Home as HomeIcon, Video } from "lucide-react";
import { toast } from "react-toastify";

// Zakładamy dostępność Button i Input ze standardu shadcn/ui w projekcie
import { Button } from "@/components/ui/button";

const PrinterControlPage: FC = () => {
    const [step, setStep] = useState<number>(10);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isMoving, setIsMoving] = useState<boolean>(false);

    // Endpointy do zdefiniowania potem w proxy Vite lub na stałe jeśli to produkcja
    const API_BASE = "http://localhost:8000/api/v1"; 

    const handleConnect = async () => {
        try {
            const res = await fetch(`${API_BASE}/gcode/connect`, { method: "POST" });
            if (res.ok) {
                setIsConnected(true);
                toast.success("Połączono z drukarką");
            } else {
                toast.error("Błąd połączenia z drukarką");
            }
        } catch (e) {
            toast.error("Brak komunikacji z serwerem");
        }
    };

    const handleHome = async () => {
        try {
            setIsMoving(true);
            const res = await fetch(`${API_BASE}/gcode/home`, { method: "POST" });
            if (res.ok) toast.success("Zbazowano (Home) osie");
            else toast.error("Nie udało się zbazować osi");
        } catch (e) {
            toast.error("Błąd sieciowy");
        } finally {
            setIsMoving(false);
        }
    };

    const handleMove = async (axis: "X" | "Y" | "Z", direction: 1 | -1) => {
        try {
            setIsMoving(true);
            const distance = step * direction;
            const payload = { axis, distance };
            
            const res = await fetch(`${API_BASE}/gcode/move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) toast.error(`Błąd przy ruchu ${axis}${distance}`);
        } catch (e) {
            toast.error("Błąd sieciowy podczas ruchu");
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sterowanie Drukarką</h1>
                <p className="text-muted-foreground">Panel zarządzania ramieniem magazynu oraz podgląd na żywo z kamery.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel Kontrolny */}
                <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <div className="flex items-center gap-2">
                            <Power size={20} className={isConnected ? "text-green-500" : "text-muted-foreground"} />
                            <h2 className="text-lg font-semibold">Status: {isConnected ? "Połączona" : "Odłączona"}</h2>
                        </div>
                        <Button variant={isConnected ? "outline" : "default"} onClick={handleConnect}>
                            {isConnected ? "Zrestartuj połączenie" : "Połącz z drukarką"}
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-4">
                        {/* Joystick X/Y */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-medium text-sm text-muted-foreground mb-2">Osie X i Y</p>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("Y", 1)} disabled={isMoving}>
                                <MoveUp size={24} />
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("X", -1)} disabled={isMoving}>
                                    <MoveLeft size={24} />
                                </Button>
                                <Button variant="default" size="icon" className="h-12 w-12" onClick={handleHome} disabled={isMoving}>
                                    <HomeIcon size={24} />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("X", 1)} disabled={isMoving}>
                                    <MoveRight size={24} />
                                </Button>
                            </div>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("Y", -1)} disabled={isMoving}>
                                <MoveDown size={24} />
                            </Button>
                        </div>

                        {/* Joystick Z */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-medium text-sm text-muted-foreground mb-2">Oś Z (Magnes)</p>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("Z", 1)} disabled={isMoving}>
                                <MoveUp size={24} />
                            </Button>
                            <div className="h-12 w-12 flex items-center justify-center">
                                <Maximize size={24} className="text-muted-foreground/50"/>
                            </div>
                            <Button variant="secondary" size="icon" className="h-12 w-12" onClick={() => handleMove("Z", -1)} disabled={isMoving}>
                                <MoveDown size={24} />
                            </Button>
                        </div>
                    </div>

                    {/* Nastawy Kroków */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium mr-2">Skok (mm):</span>
                        {[1, 10, 50, 100].map((val) => (
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
                </div>

                {/* Widok Kamery */}
                <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Video size={20} /> Podgląd na żywo
                        </h2>
                    </div>
                    
                    <div className="flex-1 bg-black/5 border rounded-lg overflow-hidden relative flex items-center justify-center min-h-[300px] aspect-video">
                        <img 
                            src={`${API_BASE}/camera/snapshot`} 
                            alt="Strumień z kamery" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback w razie braku kamery
                                (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1a1a1a/FFF?text=Brak+Sygnału";
                            }}
                        />
                        {/* Nakładka celownika na środku kamery (opcjonalna pomoc w kalibracji) */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-10 h-10 border-2 border-green-500/50 rounded-full flex items-center justify-center">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                <div className="absolute w-full h-[1px] bg-green-500/50"></div>
                                <div className="absolute h-full w-[1px] bg-green-500/50"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PrinterControlPage;
