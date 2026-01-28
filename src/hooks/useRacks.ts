
import type { IRack } from "@/types/Rack";
import { useQuery } from "@tanstack/react-query";
import { MockDB } from "@/mocks/rackData";

interface UseRacksOptions {
    token?: string | null;
}

export const useRacks = ({ token }: UseRacksOptions) => {
    return useQuery<IRack[]>({
        queryKey: ["racks"],
        queryFn: async () => {
            // Fallback to Mock Data because Backend lacks list endpoint (GET /racks)
            console.warn("Using Mock Data for Rack List (Backend missing GET /api/v1/racks)");
            return MockDB.getAll();
        },
        enabled: true,
    });
};
