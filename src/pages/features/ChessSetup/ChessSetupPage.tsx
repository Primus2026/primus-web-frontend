import { useState, useEffect, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, QrCode, ScanEye, Search, LayoutGrid, Play } from "lucide-react";

type BoardState = string[];

const ChessSetupPage: FC = () => {
    const [board, setBoard] = useState<BoardState>(Array(64).fill(null));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isActionRunning, setIsActionRunning] = useState<boolean>(false);
    const [gantry, setGantry] = useState<{x: number, y: number, holding: string | null}>({ x: 0, y: 0, holding: null });
    const [isSimulating, setIsSimulating] = useState<boolean>(false);

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
            if (!isSimulating) toast.error("Brak komunikacji z backendem");
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
            if (!isSimulating) toast.error("Błąd połączenia sieciowego podczas wykonywania polecenia");
        } finally {
            setIsActionRunning(false);
        }
    };

    const moveGantry = async (targetX: number, targetY: number, holding: string | null, speed: number = 10) => {
        const startX = gantry.x;
        const startY = gantry.y;
        const frames = speed; 
        for (let i = 1; i <= frames; i++) {
            const t = i / frames;
            const easeT = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
            
            setGantry({
                x: startX + (targetX - startX) * easeT,
                y: startY + (targetY - startY) * easeT,
                holding: holding
            });
            await new Promise(r => setTimeout(r, 5)); // Jeszcze szybciej dla efektu "co milisekundy"
        }
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        setIsActionRunning(true);
        
        // 1. Definicja 8 wybranych figur
        const PIECE_TYPES = ["BK", "BQ", "BR", "BN", "WK", "WQ", "WR", "WN"];
        const FINAL_TARGET = Array(64).fill(null);
        // Cele: pierwsze 4 pola i ostatnie 4 pola
        FINAL_TARGET[0] = "BK"; FINAL_TARGET[1] = "BQ"; FINAL_TARGET[2] = "BR"; FINAL_TARGET[3] = "BN";
        FINAL_TARGET[60] = "WK"; FINAL_TARGET[61] = "WQ"; FINAL_TARGET[62] = "WR"; FINAL_TARGET[63] = "WN";

        // Stan rzeczywisty (8 figur w losowych pozycjach)
        const REAL_BOARD_A = Array(64).fill(null);
        let piecesPlaced = 0;
        while (piecesPlaced < 8) {
            const rIdx = Math.floor(Math.random() * 64);
            if (!REAL_BOARD_A[rIdx]) {
                REAL_BOARD_A[rIdx] = PIECE_TYPES[piecesPlaced];
                piecesPlaced++;
            }
        }

        // Startujemy z pustą planszą (Phase 1: Discovery)
        setBoard(Array(64).fill(null));
        setGantry({ x: 0, y: 0, holding: null });
        let discoveredBoard = Array(64).fill(null);
        
        toast.info("Faza 1: Smart Discovery (Szukanie 8 figur)");
        await new Promise(r => setTimeout(r, 800));

        // Ścieżka wężykowa
        for (let row = 0; row < 8; row++) {
            const cols = row % 2 === 0 ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
            for (const col of cols) {
                await moveGantry(col, row, null, 4); // Jeszcze szybszy skan
                const idx = row * 8 + col;
                if (REAL_BOARD_A[idx]) {
                    discoveredBoard[idx] = REAL_BOARD_A[idx];
                    setBoard([...discoveredBoard]);
                    await new Promise(r => setTimeout(r, 100));
                }
            }
        }

        toast.success("Faza 1 Zakończona. Znaleziono 8 figur.");
        await new Promise(r => setTimeout(r, 1000));
        toast.info("Rozpoczynanie Fazy 2/3: Rozwiązywanie układu (Sorting)");

        // 2. Logika ruchu (Sorting)
        let currentBoard = [...discoveredBoard];
        let solved = false;
        while (!solved) {
            let moveFound = false;
            // Szukamy figury która nie jest na miejscu a jej cel jest pusty (Ścieżka prosta)
            for (let i = 0; i < 64; i++) {
                const piece = currentBoard[i];
                if (piece && piece !== FINAL_TARGET[i]) {
                    // Gdzie ten konkretny typ figury powinien być?
                    let targetIdx = -1;
                    for (let j = 0; j < 64; j++) {
                        if (FINAL_TARGET[j] === piece && currentBoard[j] !== FINAL_TARGET[j]) {
                            // Sprawdź czy pole docelowe jest puste
                            if (currentBoard[j] === null) {
                                targetIdx = j;
                                break;
                            }
                        }
                    }

                    if (targetIdx !== -1) {
                        moveFound = true;
                        const srcRow = Math.floor(i / 8);
                        const srcCol = i % 8;
                        const dstRow = Math.floor(targetIdx / 8);
                        const dstCol = targetIdx % 8;

                        await moveGantry(srcCol, srcRow, null, 15);
                        await new Promise(r => setTimeout(r, 200));
                        
                        currentBoard[i] = null;
                        setBoard([...currentBoard]);
                        setGantry(g => ({ ...g, holding: piece }));
                        await new Promise(r => setTimeout(r, 200));
                        
                        await moveGantry(dstCol, dstRow, piece, 15);
                        await new Promise(r => setTimeout(r, 200));

                        currentBoard[targetIdx] = piece;
                        setBoard([...currentBoard]);
                        setGantry(g => ({ ...g, holding: null }));
                        await new Promise(r => setTimeout(r, 200));
                        
                        break;
                    }
                }
            }
            
            if (!moveFound) {
                // Jeśli nie ma prostych ruchów, sprawdź czy są jakiekolwiek złe pola (cykle)
                // Tutaj dla potrzeb demo symulujemy rozwiązanie cyklu przez bufor
                let badIdx = currentBoard.findIndex((p, idx) => p && p !== FINAL_TARGET[idx]);
                if (badIdx === -1) {
                    solved = true;
                } else {
                    // Prosty skok do bufora (pierwsze wolne pole)
                    let bufferIdx = currentBoard.findIndex(p => p === null);
                    if (bufferIdx !== -1) {
                        const piece = currentBoard[badIdx];
                        const srcRow = Math.floor(badIdx / 8);
                        const srcCol = badIdx % 8;
                        const bufRow = Math.floor(bufferIdx / 8);
                        const bufCol = bufferIdx % 8;

                        await moveGantry(srcCol, srcRow, null, 15);
                        currentBoard[badIdx] = null;
                        setBoard([...currentBoard]);
                        setGantry(g => ({ ...g, holding: piece }));
                        
                        await moveGantry(bufCol, bufRow, piece, 15);
                        currentBoard[bufferIdx] = piece;
                        setBoard([...currentBoard]);
                        setGantry(g => ({ ...g, holding: null }));
                        moveFound = true;
                    } else {
                        solved = true; // Safety
                    }
                }
            }
        }

        setIsActionRunning(false);
        setIsSimulating(false);
        toast.success("Symulacja zakończona: Układ B osiągnięty!");
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Szachownica</h1>
                    <p className="text-muted-foreground">Wizualizacja stanu 8x8 i operacje masowe na układzie figur szachowych.</p>
                </div>
                <Button variant="outline" onClick={fetchBoard} disabled={isLoading || isActionRunning}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Odśwież planszę
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Szachownica 8x8 */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full max-w-lg aspect-square bg-muted/30 border-2 rounded-md p-2 relative">
                        {/* Gantry / Arm Simulation overlay */}
                        {isActionRunning && (
                            <div 
                                className="absolute z-10 pointer-events-none transition-all duration-75 flex items-center justify-center"
                                style={{
                                    left: `calc(${(gantry.x / 8) * 100}% + 4px)`,
                                    top: `calc(${(gantry.y / 8) * 100}% + 4px)`,
                                    width: 'calc(12.5% - 8px)',
                                    height: 'calc(12.5% - 8px)',
                                }}
                            >
                                <div className="w-full h-full border-4 border-emerald-500 rounded-lg bg-emerald-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                    <div className="w-4 h-4 bg-emerald-600 rounded-full animate-pulse" />
                                    {gantry.holding && (
                                        <div className="absolute -bottom-4 bg-emerald-600 text-white text-[10px] px-1 rounded font-bold">
                                            {gantry.holding}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute w-[2000px] h-1 bg-emerald-500/20 -left-[1000px]" />
                                <div className="absolute h-[2000px] w-1 bg-emerald-500/20 -top-[1000px]" />
                            </div>
                        )}
                        
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
                                        } ${cell ? 'border border-primary text-primary shadow-md bg-primary/10' : 'border border-transparent'} relative`}
                                    >
                                        {cell || ""}
                                        {/* Podświetlenie pola docelowego */}
                                        {isActionRunning && gantry.holding && (
                                            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse border border-emerald-500/30 rounded-sm" />
                                        )}
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
                            onClick={() => executeAction("setup-smart", "Zakończono automatyczne rozstawianie")}
                        >
                            <ScanEye className="mr-3 h-5 w-5 text-primary" /> Rozstaw figury (Auto-detekcja wzorów)
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 mt-2" 
                            disabled={isActionRunning}
                            onClick={() => executeAction("inventory", "Zakończono Inwentaryzację")}
                        >
                            <Search className="mr-3 h-5 w-5" /> Skan Inwentaryzacji
                        </Button>

                        <div className="pt-4 border-t border-muted">
                            <Button 
                                className="w-full justify-start border-emerald-500 text-emerald-600 hover:bg-emerald-50" 
                                variant="outline"
                                disabled={isActionRunning}
                                onClick={runSimulation}
                            >
                                <Play className="mr-3 h-5 w-5 text-emerald-500" /> Symulacja Krok-po-Kroku (Frontend)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Nakładka blokująca w trakcie pracy */}
            {(isActionRunning && !isSimulating) && (
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
