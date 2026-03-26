// src/hooks/useStockOutbound.ts
import { useState } from 'react';
import { toast } from "react-toastify"; // Zakładam, że używasz sonner lub podobnego do powiadomień

export const useStockOutbound = (token: string | null) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const directRemove = async (barcode: string) => {
        if (!token) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/v1/stock-outbound/direct-remove/${barcode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Błąd podczas usuwania produktu");
            }

            toast.success("Produkt został pomyślnie wydany (G-Code wysłany)");
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    return { directRemove, isProcessing };
};