import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { UserCircle2, Cpu, RotateCcw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

type Player = "X" | "O" | "";

const TicTacToePage: FC = () => {
    const { token } = useAuth();
    const [board, setBoard] = useState<Player[]>(Array(9).fill(''));
    const [gameMode, setGameMode] = useState<'PvP' | 'AI'>('AI');
    const [isWorking, setIsWorking] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");

    const checkLocalWinner = (newBoard: Player[]) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let [a, b, c] of lines) {
            if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) return newBoard[a];
        }
        return newBoard.every(s => s !== '') ? 'DRAW' : null;
    };

    const handleMove = async (index: number) => {
        if (board[index] || isWorking || winner) return;
        if (gameMode === 'AI' && currentPlayer !== 'X') return;

        setIsWorking(true);
        try {
            // 1. RUCH GRACZA (X)
            const xCount = board.filter(s => s === 'X').length;
            const res = await fetch('/api/v1/ttt/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ board, move_index: index, piece_type: 'X', x_count: xCount, o_count: 0 })
            });
            if (!res.ok) throw new Error();

            const nextBoard = [...board];
            nextBoard[index] = 'X';
            setBoard(nextBoard);

            const winStatus = checkLocalWinner(nextBoard);
            if (winStatus) {
                setWinner(winStatus);
                setIsWorking(false);
                return;
            }

            // 2. RUCH SI (O)
            if (gameMode === 'AI') {
                setCurrentPlayer('O');
                const oCount = board.filter(s => s === 'O').length;
                const aiRes = await fetch('/api/v1/ttt/ai-move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ board: nextBoard, move_index: 0, piece_type: 'O', x_count: 0, o_count: oCount })
                });
                const aiData = await aiRes.json();

                const finalBoard = [...nextBoard];
                finalBoard[aiData.move_index] = 'O';
                setBoard(finalBoard);
                setWinner(checkLocalWinner(finalBoard));
                setCurrentPlayer('X');
            } else {
                setCurrentPlayer('O'); // W PvP przełącz na kółko
            }
        } catch (e) {
            toast.error("Błąd komunikacji z drukarką!");
        } finally {
            setIsWorking(false);
        }
    };

    const handleRestart = async () => {
        setIsWorking(true);
        try {
            await fetch('/api/v1/ttt/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(board)
            });
            setBoard(Array(9).fill(''));
            setWinner(null);
            setCurrentPlayer('X');
            toast.success("Plansza wyczyszczona");
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Kółko i Krzyżyk SI</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative min-h-[450px]">
                    <div className="w-full max-w-sm grid grid-cols-3 grid-rows-3 gap-3">
                        {board.map((val, i) => (
                            <button
                                key={i}
                                className={`h-24 sm:h-32 transition-all duration-300 rounded-xl text-5xl font-extrabold flex items-center justify-center
                                    ${val === 'X' ? 'text-blue-500 bg-blue-50' : val === 'O' ? 'text-rose-500 bg-rose-50' : 'bg-muted/30 hover:bg-muted/80'}
                                    ${isWorking ? 'cursor-wait opacity-80' : ''}
                                `}
                                onClick={() => handleMove(i)}
                                disabled={!!val || !!winner || isWorking}
                            >
                                {val}
                            </button>
                        ))}
                    </div>

                    {isWorking && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20">
                            <div className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 animate-pulse">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                DRUKARKA PRACUJE...
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-muted-foreground mb-4">Status Gry</h3>
                            {winner ? (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <p className="text-2xl font-bold text-green-600 font-mono tracking-widest uppercase">
                                        {winner === "DRAW" ? "REMIS" : `WYGRYWA ${winner}`}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-center gap-3">
                                    <span className="text-sm font-medium">Tura:</span>
                                    <span className={`text-2xl font-black ${currentPlayer === 'X' ? 'text-blue-500' : 'text-rose-500'}`}>
                                        {currentPlayer}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <Button
                                className="w-full h-12 justify-start"
                                variant={gameMode === "AI" ? "default" : "outline"}
                                disabled={isWorking}
                                onClick={() => handleNewGame('AI')}
                            >
                                <Cpu className="mr-3 h-5 w-5" /> Gra z SI (Qwen)
                            </Button>
                            <Button
                                className="w-full h-12 justify-start"
                                variant={gameMode === "PvP" ? "default" : "outline"}
                                disabled={isWorking}
                                onClick={() => handleNewGame('PvP')}
                            >
                                <UserCircle2 className="mr-3 h-5 w-5" /> Gracz vs Gracz
                            </Button>

                            <Button
                                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={handleRestart}
                                disabled={isWorking || (board.every(s => s === '') && !winner)}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> Restart i Odstaw Figury
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToePage;