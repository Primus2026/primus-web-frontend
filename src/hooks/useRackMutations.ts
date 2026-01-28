
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, updateFetcher, deleteFetcher } from "@/hooks/utils/fetcher";
import type { RackCreate, RackUpdate } from "@/types/Rack";
import { API_URL } from "@/config/constants";

interface UseRackMutationsOptions {
    token?: string | null;
}

export const useRackMutations = ({ token }: UseRackMutationsOptions) => {
    const queryClient = useQueryClient();

    const createRack = useMutation({
        mutationFn: (data: RackCreate) => 
            // Swagger says: POST /api/v1/racks/
            postFetcher(`${API_URL}racks/`, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["racks"] });
        },
    });

    const updateRack = useMutation({
        mutationFn: (data: RackUpdate) =>
            // Swagger says: PUT /api/v1/racks/{rack_id}
            updateFetcher(`${API_URL}racks/${data.id}`, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["racks"] });
        },
    });

    const deleteRack = useMutation({
        mutationFn: (id: number) =>
            // Swagger says: DELETE /api/v1/racks/{rack_id}
            deleteFetcher(`${API_URL}racks/${id}`, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["racks"] });
        },
    });

    return {
        createRack,
        updateRack,
        deleteRack,
    };
};
