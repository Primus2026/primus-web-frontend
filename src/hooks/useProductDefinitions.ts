
import type { IProductDefinition } from "@/types/ProductDefinition";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/constants";
import { fetcher } from "@/hooks/utils/fetcher";

interface UseProductDefinitionsOptions {
    token?: string | null;
}

export const useProductDefinitions = ({ token }: UseProductDefinitionsOptions) => {
    return useQuery<IProductDefinition[]>({
        queryKey: ["product_definitions"],
        queryFn: async () => {
            return fetcher<IProductDefinition[]>(`${API_URL}product_definitions/`, token || undefined);
        },
        enabled: true,
    });
};
