import React from "react";
import { Button } from "@/components/ui/button";
import { useRackStock } from "@/hooks/useRackStock";
import { useAuth } from "@/context/AuthProvider";
import type { IRack } from "@/types/Rack";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { useStockOutbound } from "@/hooks/useStockOutbound";
import { useQueryClient } from "@tanstack/react-query";

interface RackInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    rack: IRack | null;
}

// Komponent Modal - pomocniczy kontener UI
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden border flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        ✕
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const RackInventoryModal = ({ isOpen, onClose, rack }: RackInventoryModalProps) => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    
    // Pobieranie stanu magazynowego dla konkretnego regału
    const { data: stockItems, isLoading: isStockLoading } = useRackStock(
        isOpen && rack ? rack.id : null, 
        token
    );

    // Hook do obsługi operacji wydania (outbound)
    const { directRemove, isProcessing: isRemoving } = useStockOutbound(token);

    if (!rack) return null;

    // Funkcja obsługująca kliknięcie "Wydaj"
    const handleRemoveProduct = async (barcode: string) => {
        const success = await directRemove(barcode);
        if (success) {
            // Inwalidacja cache, aby odświeżyć widok regału po usunięciu przedmiotu
            queryClient.invalidateQueries({ queryKey: ['rack-stock', rack.id] });
        }
    };

    // Budowanie siatki: Wiersze od góry (max) do dołu (1), Kolumny od 1 do n
    const rows = Array.from({ length: rack.rows_m }, (_, i) => rack.rows_m - i);
    const cols = Array.from({ length: rack.cols_n }, (_, i) => i + 1);

    const getStockAt = (r: number, c: number) => {
        return stockItems?.find(item => item.position_row === r && item.position_col === c);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Inwentarz regału: ${rack.designation}`}>
            <div className="space-y-6">
                {/* Statystyki regału */}
                <div className="flex flex-wrap gap-6 text-sm py-3 px-4 bg-muted/30 rounded-lg border">
                    <div>Wiersze: <span className="font-bold">{rack.rows_m}</span></div>
                    <div>Kolumny: <span className="font-bold">{rack.cols_n}</span></div>
                    <div>Całkowita pojemność: <span className="font-bold">{rack.rows_m * rack.cols_n}</span></div>
                    <div>Zajęte sloty: <span className="font-bold text-primary">{stockItems?.length || 0}</span></div>
                    <div>Zajętość: 
                        <span className={`ml-1 font-bold ${stockItems && (stockItems.length / (rack.rows_m * rack.cols_n)) > 0.8 ? 'text-destructive' : 'text-green-600'}`}>
                            {stockItems ? Math.round((stockItems.length / (rack.rows_m * rack.cols_n)) * 100) : 0}%
                        </span>
                    </div>
                </div>

                {isStockLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                         <Loader2 className="h-10 w-10 animate-spin text-primary" />
                         <p className="text-muted-foreground animate-pulse">Ładowanie stanu regału...</p>
                    </div>
                ) : (
                    <div className="border rounded-xl p-4 bg-muted/10 overflow-auto shadow-inner">
                        <div 
                            className="grid gap-3 min-w-max"
                            style={{ 
                                gridTemplateColumns: `repeat(${rack.cols_n}, minmax(140px, 1fr))` 
                            }}
                        >
                            {rows.map(rowNum => (
                                cols.map(colNum => {
                                    const item = getStockAt(rowNum, colNum);
                                    return (
                                        <div 
                                            key={`${rowNum}-${colNum}`}
                                            className={`
                                                relative h-36 border rounded-lg p-3 flex flex-col justify-between transition-all duration-200
                                                ${item 
                                                    ? "bg-card border-primary/20 shadow-sm ring-1 ring-primary/5 hover:ring-primary/20" 
                                                    : "bg-background/50 border-dashed border-muted-foreground/20 opacity-60"
                                                }
                                            `}
                                        >
                                            {/* Etykieta pozycji */}
                                            <div className="absolute top-1 right-2 text-[10px] font-mono text-muted-foreground/50">
                                                R{rowNum}-C{colNum}
                                            </div>
                                            
                                            {item ? (
                                                <>
                                                    <div className="flex flex-col gap-1 overflow-hidden">
                                                        <div className="font-bold text-xs truncate pr-6" title={item.product.name}>
                                                            {item.product.name}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-muted-foreground">
                                                            {item.product.barcode}
                                                        </div>
                                                        {item.expiry_date && (
                                                            <Badge 
                                                                variant={new Date(item.expiry_date) < new Date() ? "destructive" : "secondary"} 
                                                                className="w-fit text-[9px] px-1.5 h-4 mt-1"
                                                            >
                                                                Exp: {new Date(item.expiry_date).toLocaleDateString()}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        className="w-full h-8 text-[11px] mt-2 gap-2 shadow-sm"
                                                        disabled={isRemoving}
                                                        onClick={() => handleRemoveProduct(item.product.barcode)}
                                                    >
                                                        {isRemoving ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                        Wydaj (FIFO)
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center text-muted-foreground/10 text-xs font-black uppercase tracking-widest select-none">
                                                    Puste
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose} className="px-8">
                        Zamknij
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RackInventoryModal;