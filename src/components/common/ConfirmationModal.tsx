
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

export const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    isLoading = false 
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-background rounded-lg shadow-lg w-full max-w-md border p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>X</Button>
                </div>
                
                <div className="mb-6">
                    <p className="text-muted-foreground">{message}</p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        Anuluj
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm} 
                        disabled={isLoading}
                    >
                        {isLoading ? "Usuwanie..." : "Usuń"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
