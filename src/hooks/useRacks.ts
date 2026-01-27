
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
            // Fetch from shared Mock DB
            return MockDB.getAll();
        },
        enabled: true, 
    });
};
