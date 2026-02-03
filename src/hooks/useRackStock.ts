
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/constants";
import { fetcher } from "@/hooks/utils/fetcher";

export interface StockItemOut {
    id: number;
    product: {
        id: number;
        name: string;
        barcode: string;
    };
    rack_id: number;
    position_row: number;
    position_col: number;
    entry_date: string;
    expiry_date: string;
    received_by: {
        id: number;
        login: string;
    }
}

export const useRackStock = (rackId: number | null, token?: string | null) => {
    return useQuery<StockItemOut[]>({
        queryKey: ["rack-stock", rackId],
        queryFn: async () => {
             if (!rackId) return [];
             return fetcher<StockItemOut[]>(`${API_URL}racks/${rackId}/stock-items`, token || undefined);
        },
        enabled: !!rackId,
    });
};
