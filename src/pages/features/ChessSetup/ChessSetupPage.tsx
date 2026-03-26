import { useState, useEffect, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, QrCode, ScanEye, Search, LayoutGrid } from "lucide-react";

type BoardState = string[];

const ChessSetupPage: FC = () => {
    const [board, setBoard] = useState<BoardState>(Array(64).fill(null));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isActionRunning, setIsActionRunning] = useState<boolean>(false);

    const API_BASE = "http://localhost:8000/api/v1";

    const fetchBoard = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/chess/board-state`);
            if (res.ok) {
                const data = await res.json();
                setBoard(data.board || Array(64).fill(null));
                toast.success("Odświeżono stan planszy");
            }
        } catch (e) {
            toast.error("Brak komunikacji z backendem");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const executeAction = async (endpoint: string, successMsg: string) => {
        setIsActionRunning(true);
        try {
            const res = await fetch(`${API_BASE}/chess/${endpoint}`, { method: "POST" });
            if (res.ok) {
                toast.success(successMsg);
                await fetchBoard();
            } else {
                toast.error("Wystąpił błąd podczas pracy maszyny");
            }
        } catch (e) {
            toast.error("Błąd połączenia sieciowego podczas wykonywania polecenia");
        } finally {
            setIsActionRunning(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Magazyn Szachowy</h1>
                    <p className="text-muted-foreground">Wizualizacja stanu 8x8 i operacje masowe na układzie figur.</p>
                </div>
                <Button variant="outline" onClick={fetchBoard} disabled={isLoading || isActionRunning}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Odśwież planszę
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Szachownica 8x8 */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full max-w-lg aspect-square bg-muted/30 border-2 rounded-md p-2">
                        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
                            {board.map((cell, index) => {
                                const row = Math.floor(index / 8);
                                const col = index % 8;
                                const isBlack = (row + col) % 2 === 1;
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex items-center justify-center rounded-sm text-xs font-bold transition-all shadow-sm ${
                                            isBlack ? 'bg-muted-foreground/20' : 'bg-background'
                                        } ${cell ? 'border border-primary text-primary shadow-md bg-primary/10' : 'border border-transparent'}`}
                                    >
                                        {cell || ""}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Akcje */}
                <div className="flex flex-col gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Automatyzacja Szachów</h3>
                        
                        <Button 
                            className="w-full justify-start hover:bg-muted" 
                            variant="outline"
                            disabled={isActionRunning}
                            onClick={() => executeAction("setup-qr", "Zakończono rozstawianie QR")}
                        >
                            <QrCode className="mr-3 h-5 w-5 text-primary" /> Rozstaw wg kodu QR
                        </Button>
                        
                        <Button 
                            className="w-full justify-start hover:bg-muted" 
                            variant="outline"
                            disabled={isActionRunning}
                            onClick={() => executeAction("setup-pictogram", "Zakończono rozstawianie Piktogramów")}
                        >
                            <ScanEye className="mr-3 h-5 w-5 text-primary" /> Rozstaw wg Piktogramów
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 mt-2" 
                            disabled={isActionRunning}
                            onClick={() => executeAction("inventory", "Zakończono Inwentaryzację")}
                        >
                            <Search className="mr-3 h-5 w-5" /> Skan Inwentaryzacji
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Nakładka blokująca w trakcie pracy */}
            {isActionRunning && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground">
                    <div className="bg-card border shadow-xl rounded-2xl p-8 flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                        <h2 className="text-2xl font-bold text-center">Ramię w ruchu...</h2>
                        <p className="mt-2 text-muted-foreground text-center">
                            Proszę nie przerywać połączenia, trwa wykonywanie fizycznej operacji na stole.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ChessSetupPage;
