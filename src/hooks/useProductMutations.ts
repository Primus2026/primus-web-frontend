
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, deleteFetcher } from "@/hooks/utils/fetcher";
import type { ProductDefinitionCreate } from "@/types/ProductDefinition";
import { API_URL } from "@/config/constants";

interface UseProductMutationsOptions {
    token?: string | null;
}

export const useProductMutations = ({ token }: UseProductMutationsOptions) => {
    const queryClient = useQueryClient();

    const createProduct = useMutation({
        mutationFn: (data: ProductDefinitionCreate) => 
            postFetcher(`${API_URL}product_definitions/`, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: (id: number) =>
            deleteFetcher(`${API_URL}product_definitions/${id}`, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        },
    });

    return {
        createProduct,
        deleteProduct,
    };
};
