import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config/constants";

interface UseStockInboundMutationsProps {
    token: string | null;
}

interface DirectAddPayload {
    barcode: string;
}

export const useStockInboundMutations = ({ token }: UseStockInboundMutationsProps) => {
    const queryClient = useQueryClient();

    const directAdd = useMutation({
        mutationFn: async (payload: DirectAddPayload) => {
            const response = await fetch(`${API_URL}stock-inbound/direct-add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Wystąpił błąd podczas przyjmowania do magazynu");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate relevant queries if needed
            queryClient.invalidateQueries({ queryKey: ["product-definitions"] });
            queryClient.invalidateQueries({ queryKey: ["stock"] });
        },
    });

    return { directAdd };
};
