
import { Button } from "@/components/ui/button";
import { useRackStock } from "@/hooks/useRackStock";
import { useAuth } from "@/context/AuthProvider";
import type { IRack } from "@/types/Rack";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface RackInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    rack: IRack | null;
}

// Reusing Simple Modal UI
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>X</Button>
                </div>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const RackInventoryModal = ({ isOpen, onClose, rack }: RackInventoryModalProps) => {
    const { token } = useAuth();
    const { data: stockItems, isLoading } = useRackStock(isOpen && rack ? rack.id : null, token);

    if (!rack) return null;

    // Grid construction
    // Rows usually bottom to top or top to bottom?
    // Physical racks: Row 1 is usually bottom? Or top?
    // Let's assume Row 1 is BOTTOM.
    // So we render rows starting from rack.rows_m down to 1?
    // Or just 1 to rows_m.
    // Let's perform standard visualization: Row 1 at bottom.
    
    // We need an array of rows [rows_m, ..., 1]
    const rows = Array.from({ length: rack.rows_m }, (_, i) => rack.rows_m - i);
    const cols = Array.from({ length: rack.cols_n }, (_, i) => i + 1);

    const getStockAt = (r: number, c: number) => {
        return stockItems?.find(item => item.position_row === r && item.position_col === c);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Inventory: ${rack.designation}`}>
            <div className="space-y-6">
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <div>Rows: <span className="font-medium text-foreground">{rack.rows_m}</span></div>
                    <div>Cols: <span className="font-medium text-foreground">{rack.cols_n}</span></div>
                    <div>Occupancy: <span className="font-medium text-foreground">
                        {stockItems ? Math.round((stockItems.length / (rack.rows_m * rack.cols_n)) * 100) : 0}%
                    </span></div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="border rounded-md p-4 bg-muted/10 overflow-auto">
                        <div 
                            className="grid gap-2 min-w-max"
                            style={{ 
                                gridTemplateColumns: `repeat(${rack.cols_n}, minmax(80px, 1fr))` 
                            }}
                        >
                            {rows.map(rowNum => (
                                cols.map(colNum => {
                                    const item = getStockAt(rowNum, colNum);
                                    return (
                                        <div 
                                            key={`${rowNum}-${colNum}`}
                                            className={`
                                                relative h-24 border rounded-md p-2 text-xs flex flex-col justify-between transition-colors
                                                ${item ? "bg-primary/10 border-primary/30 hover:bg-primary/20" : "bg-card border-dashed hover:bg-muted/50"}
                                            `}
                                            title={item ? `Product: ${item.product.name}\nExpiry: ${item.expiry_date}` : `Empty Slot (R${rowNum}, C${colNum})`}
                                        >
                                            <div className="absolute top-1 right-1 text-[10px] text-muted-foreground opacity-50">
                                                {rowNum}-{colNum}
                                            </div>
                                            
                                            {item ? (
                                                <>
                                                    <div className="font-medium truncate" title={item.product.name}>
                                                        {item.product.name}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                        {item.product.barcode}
                                                    </div>
                                                    {item.expiry_date && (
                                                        <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 h-4 mt-1 border-primary/20">
                                                            {new Date(item.expiry_date).toLocaleDateString()}
                                                        </Badge>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center text-muted-foreground/20 font-bold">
                                                    Empty
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RackInventoryModal;
