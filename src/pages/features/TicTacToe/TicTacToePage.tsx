import { useState, useEffect, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Gamepad2, UserCircle2, Cpu, RotateCcw } from "lucide-react";

type Player = "X" | "O" | null;

interface GameState {
    board: Player[]; // length 9
    currentPlayer: "X" | "O";
    winner: Player | "DRAW";
    gameMode: "PvP" | "AI";
}

const TicTacToePage: FC = () => {
    // Local copy of board for optimistic UI updates before robot finishes
    const [gameState, setGameState] = useState<GameState>({
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        gameMode: "PvP",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAITurn, setIsAITurn] = useState<boolean>(false);

    const API_BASE = "http://localhost:8000/api/v1/tictactoe";

    const fetchState = async () => {
        try {
            const res = await fetch(`${API_BASE}/state`);
            if (res.ok) {
                const data: GameState = await res.json();
                setGameState(data);
                if (data.gameMode === "AI" && data.currentPlayer === "O" && !data.winner) {
                    setIsAITurn(true);
                } else {
                    setIsAITurn(false);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchState();
        // Polling w przypadku tury AI, aby wykryć kiedy robot skończy układać swój ruch
        const interval = setInterval(() => {
            if (isAITurn) fetchState();
        }, 2000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAITurn]);

    const handleNewGame = async (mode: "PvP" | "AI") => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/new-game`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode })
            });
            if (res.ok) {
                toast.success(`Rozpoczęto nową grę w trybie ${mode}`);
                await fetchState();
            } else {
                toast.error("Nie udało się rozpocząć nowej gry");
            }
        } catch (e) {
            toast.error("Błąd połączenia do utworzenia gry");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMove = async (index: number) => {
        if (gameState.winner || gameState.board[index] || isLoading || isAITurn) return;
        
        // Optimistic UI
        const newBoard = [...gameState.board];
        newBoard[index] = gameState.currentPlayer;
        setGameState(prev => ({ ...prev, board: newBoard }));
        
        setIsLoading(true);
        try {
            const x = index % 3;
            const y = Math.floor(index / 3);
            const res = await fetch(`${API_BASE}/move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x, y })
            });
            if (!res.ok) {
                toast.error("Niedozwolony ruch na planszy");
            }
        } catch (e) {
            toast.error("Błąd podczas wysyłania ruchu do robota!");
        } finally {
            setIsLoading(false);
            await fetchState();
        }
    };

    const renderCell = (index: number) => {
        const val = gameState.board[index];
        const isWinning = false; // Gdyby API zdradzało wygrywającą linię, moglibyśmy ją podświetlić
        
        return (
            <button
                key={index}
                className={`h-24 sm:h-32 transition-all duration-300 rounded-xl text-5xl font-extrabold flex items-center justify-center
                    ${val === 'X' ? 'text-blue-500' : 'text-rose-500'}
                    ${!val && !gameState.winner && !isAITurn ? 'hover:bg-muted/80 bg-muted/30 cursor-pointer shadow-none' : 'bg-card border-2 shadow-sm'}
                    ${isWinning ? 'ring-4 ring-green-500 ring-offset-2' : ''}
                `}
                onClick={() => handleMove(index)}
                disabled={!!val || !!gameState.winner || isAITurn || isLoading}
            >
                {val}
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kółko i Krzyżyk (Fizycznie)</h1>
                    <p className="text-muted-foreground">Gra na żywym stole przy udziale robota jako przeciwnika lub sędziego.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Plansza */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative">
                    <div className="w-full max-w-sm grid grid-cols-3 grid-rows-3 gap-3">
                        {gameState.board.map((_, i) => renderCell(i))}
                    </div>

                    {/* Overlay informujący o czyjejś turze */}
                    {isAITurn && (
                        <div className="absolute min-w-[200px] bottom-6 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-lg animate-pulse">
                            Robot wykonuje swój ruch...
                        </div>
                    )}
                </div>

                {/* Status i Ustawienia */}
                <div className="flex flex-col gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-muted-foreground">Status Gry</h3>
                            
                            {gameState.winner ? (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono tracking-wider">
                                        {gameState.winner === "DRAW" ? "REMIS!" : `WYGRYWA ${gameState.winner}`}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium">Aktualna Tura:</span>
                                    <span className={`text-xl font-bold ${gameState.currentPlayer === 'X' ? 'text-blue-500' : 'text-rose-500'}`}>
                                        {gameState.currentPlayer} 
                                    </span>
                                    {!isAITurn && <span className="text-xs text-muted-foreground ml-2">(Twój ruch)</span>}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Zacznij Nową</h3>
                            
                            <Button 
                                className="w-full justify-start h-12" 
                                variant={gameState.gameMode === "PvP" ? "default" : "outline"}
                                disabled={isLoading}
                                onClick={() => handleNewGame("PvP")}
                            >
                                <UserCircle2 className="mr-3 h-5 w-5" /> 
                                Gracz vs Gracz
                            </Button>
                            
                            <Button 
                                className="w-full justify-start h-12" 
                                variant={gameState.gameMode === "AI" ? "default" : "outline"}
                                disabled={isLoading}
                                onClick={() => handleNewGame("AI")}
                            >
                                <Cpu className="mr-3 h-5 w-5" /> 
                                Zagraj przeciwko AI
                            </Button>

                            <Button 
                                className="w-full mt-4" 
                                variant="secondary"
                                onClick={fetchState}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> 
                                Wymuś Odświeżenie Statusu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TicTacToePage;
