
import type { IRack } from "@/types/Rack";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/constants";
import { fetcher } from "@/hooks/utils/fetcher";

interface UseRacksOptions {
    token?: string | null;
}

export const useRacks = ({ token }: UseRacksOptions) => {
    return useQuery<IRack[]>({
        queryKey: ["racks"],
        queryFn: async () => {
            return fetcher<IRack[]>(`${API_URL}racks/`, token || undefined);
        },
        enabled: true,
    });
};
