import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { UserCircle2, Cpu, RotateCcw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

type Player = "X" | "O" | "";

const TicTacToePage: FC = () => {
    const { token } = useAuth();
    
    // Stan gry (pamiętamy o systemie 1-9 lub 0-8)
    const [board, setBoard] = useState<Player[]>(Array(9).fill(''));
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
    const [gameMode, setGameMode] = useState<'PvP' | 'PvAI'>('PvAI');
    const [isWorking, setIsWorking] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);

    // Lokalna walidacja zwycięstwa (frontendowa)
    const checkLocalWinner = (newBoard: Player[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // poziomo
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // pionowo
            [0, 4, 8], [2, 4, 6]             // ukosy
        ];
        for (let [a, b, c] of lines) {
            if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) return newBoard[a];
        }
        if (newBoard.every(s => s !== '')) return 'DRAW';
        return null;
    };

    const handleNewGame = async (mode: 'PvP' | 'PvAI') => {
        if (board.some(s => s !== '')) {
            if (!confirm("Czy chcesz zresetować planszę i odstawić figury na miejsce?")) return;
            await handleRestart();
        }
        setGameMode(mode);
        setBoard(Array(9).fill(''));
        setWinner(null);
        setCurrentPlayer("X");
        toast.info(`Tryb gry: ${mode === 'PvAI' ? 'Przeciwko AI' : 'Gracz vs Gracz'}`);
    };

    const handleMove = async (index: number) => {
        if (board[index] || isWorking || winner) return;

        const piece = currentPlayer;
        const xCount = board.filter(s => s === 'X').length;
        const oCount = board.filter(s => s === 'O').length;

        setIsWorking(true);
        try {
            // 1. Ruch Człowieka (do API sterującego drukarką)
            const res = await fetch('/api/v1/ttt/move', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    board, 
                    move_index: index, 
                    piece_type: piece, 
                    x_count: xCount, 
                    o_count: oCount 
                })
            });

            if (!res.ok) throw new Error("Drukarka odrzuciła ruch");

            const newBoard = [...board];
            newBoard[index] = piece;
            setBoard(newBoard);

            const win = checkLocalWinner(newBoard);
            if (win) {
                setWinner(win);
                setIsWorking(false);
                return;
            }

            // 2. Obsługa tury po ruchu gracza
            if (gameMode === 'PvAI') {
                // Tura AI (zawsze kładzie X wg. Twojej logiki minimax)
                const aiRes = await fetch('/api/v1/ttt/ai-move', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        board: newBoard, 
                        move_index: 0, 
                        piece_type: 'X', 
                        x_count: xCount + (piece === 'X' ? 1 : 0), 
                        o_count: oCount + (piece === 'O' ? 1 : 0)
                    })
                });
                
                const aiData = await aiRes.json();
                const boardAfterAi = [...newBoard];
                boardAfterAi[aiData.move_index] = 'X';
                setBoard(boardAfterAi);
                setWinner(checkLocalWinner(boardAfterAi));
            } else {
                // PvP - zmiana gracza
                setCurrentPlayer(piece === "X" ? "O" : "X");
            }
        } catch (e) {
            toast.error("Błąd połączenia z robotem!");
        } finally {
            setIsWorking(false);
        }
    };

    const handleRestart = async () => {
        setIsWorking(true);
        try {
            const res = await fetch('/api/v1/ttt/restart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(board)
            });
            if (res.ok) {
                setBoard(Array(9).fill(''));
                setWinner(null);
                setCurrentPlayer("X");
                toast.success("Robot uprzątnął planszę.");
            }
        } catch (e) {
            toast.error("Błąd podczas sprzątania planszy!");
        } finally {
            setIsWorking(false);
        }
    };

    const renderCell = (index: number) => {
        const val = board[index];
        return (
            <button
                key={index}
                className={`h-24 sm:h-32 transition-all duration-300 rounded-xl text-5xl font-extrabold flex items-center justify-center
                    ${val === 'X' ? 'text-blue-500' : 'text-rose-500'}
                    ${!val && !winner && !isWorking ? 'hover:bg-muted/80 bg-muted/30 cursor-pointer shadow-none' : 'bg-card border-2 shadow-sm'}
                    ${winner && board[index] === winner ? 'ring-4 ring-green-500 ring-offset-2' : ''}
                `}
                onClick={() => handleMove(index)}
                disabled={!!val || !!winner || isWorking}
            >
                {val}
            </button>
        );
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kółko i Krzyżyk 3D</h1>
                    <p className="text-muted-foreground">Fizyczna rozgrywka sterowana ramieniem drukarki.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Plansza */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
                    <div className="w-full max-w-sm grid grid-cols-3 grid-rows-3 gap-3">
                        {board.map((_, i) => renderCell(i))}
                    </div>

                    {/* Overlay pracy drukarki */}
                    {isWorking && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20">
                            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 animate-bounce">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Drukarka pracuje...
                            </div>
                        </div>
                    )}
                </div>

                {/* Status i Ustawienia */}
                <div className="flex flex-col gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-muted-foreground">Status Gry</h3>
                            
                            {winner ? (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono tracking-wider">
                                        {winner === "DRAW" ? "REMIS!" : `WYGRYWA ${winner}`}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium">Tura:</span>
                                    <span className={`text-xl font-bold ${currentPlayer === 'X' ? 'text-blue-500' : 'text-rose-500'}`}>
                                        {currentPlayer} 
                                    </span>
                                    {!isWorking && <span className="text-xs text-muted-foreground ml-2">(Twój ruch)</span>}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Wybierz Tryb</h3>
                            
                            <Button 
                                className="w-full justify-start h-12" 
                                variant={gameMode === "PvP" ? "default" : "outline"}
                                disabled={isWorking}
                                onClick={() => handleNewGame("PvP")}
                            >
                                <UserCircle2 className="mr-3 h-5 w-5" /> 
                                Gracz vs Gracz
                            </Button>
                            
                            <Button 
                                className="w-full justify-start h-12" 
                                variant={gameMode === "PvAI" ? "default" : "outline"}
                                disabled={isWorking}
                                onClick={() => handleNewGame("PvAI")}
                            >
                                <Cpu className="mr-3 h-5 w-5" /> 
                                SI (Minimax)
                            </Button>

                            <Button 
                                className="w-full mt-4 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200" 
                                variant="outline"
                                onClick={handleRestart}
                                disabled={isWorking || board.every(s => s === '')}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> 
                                Restart i Sprzątanie
                            </Button>
                        </div>
                    </div>

                    {/* Informacja techniczna */}
                    <div className="p-4 bg-muted/30 rounded-lg border text-[10px] text-muted-foreground space-y-1">
                        <p>● Magazyn O: R8 C1-5</p>
                        <p>● Magazyn X: R7 C1-5</p>
                        <p>● Plansza: R1-3 C1-3</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToePage;