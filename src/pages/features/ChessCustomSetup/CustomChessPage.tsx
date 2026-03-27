import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Play, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

const PIECE_TYPES = ["PB", "SB", "GB", "WB", "HB", "KB", "PC", "SC", "GC", "WC", "HC", "KC"];

const CustomChessPage: FC = () => {
    const { token } = useAuth();
    const [selectedPiece, setSelectedPiece] = useState<string>("PB");
    const [grid, setGrid] = useState<Record<string, string>>({}); // klucz "col-row": "type"
    const [isWorking, setIsWorking] = useState(false);

    const toggleCell = (col: number, row: number) => {
        const key = `${col}-${row}`;
        const newGrid = { ...grid };
        if (newGrid[key]) {
            delete newGrid[key];
        } else {
            newGrid[key] = selectedPiece;
        }
        setGrid(newGrid);
    };

    const handleExecute = async () => {
        const pieces = Object.entries(grid).map(([key, type]) => {
            const [col, row] = key.split("-").map(Number);
            return { type, col, row };
        });

        if (pieces.length === 0) return toast.warning("Dodaj figury na planszę!");

        setIsWorking(true);
        try {
            const res = await fetch("/api/v1/chess/custom-formation", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(pieces)
            });
            if (res.ok) toast.success("Formacja ułożona pomyślnie!");
        } catch (e) {
            toast.error("Błąd komunikacji.");
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold">Generator Formacji Szachowej</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Wybór figury */}
                <Card className="p-4 space-y-4 h-fit">
                    <h3 className="font-bold text-sm uppercase text-muted-foreground">Wybierz Figurę</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {PIECE_TYPES.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedPiece(t)}
                                className={`h-12 border rounded-md font-bold text-xs ${selectedPiece === t ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setGrid({})}>
                        <Trash2 className="mr-2 h-4" /> Wyczyść Projekt
                    </Button>
                </Card>

                {/* Edytor Planszy */}
                <div className="lg:col-span-2 flex flex-col items-center bg-slate-900 p-8 rounded-2xl relative">
                    <div className="grid grid-cols-8 gap-1 bg-slate-700 p-1 border-4 border-slate-800 rounded-sm">
                        {Array.from({ length: 8 }, (_, r) => 8 - r).map(row => (
                            Array.from({ length: 8 }, (_, c) => c + 1).map(col => {
                                const piece = grid[`${col}-${row}`];
                                return (
                                    <button
                                        key={`${col}-${row}`}
                                        onClick={() => toggleCell(col, row)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[10px] font-bold transition-all
                                            ${(row + col) % 2 === 0 ? 'bg-slate-300' : 'bg-slate-500'}
                                            ${piece ? 'ring-2 ring-yellow-400 scale-95 shadow-inner' : 'hover:bg-yellow-100'}
                                        `}
                                    >
                                        {piece}
                                    </button>
                                );
                            })
                        ))}
                    </div>

                    {isWorking && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20">
                            <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                            <p className="text-white font-bold animate-pulse">DRUKARKA UKŁADA TWOJĄ FORMACJĘ...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Button size="lg" className="h-16 px-12 text-xl gap-3" disabled={isWorking} onClick={handleExecute}>
                    <Play className="h-6 w-6" /> URUCHOM PROCES FIZYCZNY
                </Button>
            </div>
        </div>
    );
};

export default CustomChessPage;