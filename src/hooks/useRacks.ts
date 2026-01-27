
import { type IRack } from "@/types/Rack";
import { useQuery } from "@tanstack/react-query";

interface UseRacksOptions {
    token?: string | null;
}

const MOCK_RACKS: IRack[] = [
    {
        id: 1,
        designation: "A-01",
        rows_m: 5,
        cols_n: 10,
        temp_min: 15,
        temp_max: 25,
        max_weight_kg: 500,
        max_dims_x_mm: 1000,
        max_dims_y_mm: 800,
        max_dims_z_mm: 600,
        comment: "Standard storage",
        distance_from_exit_m: 10
    },
    {
        id: 2,
        designation: "B-02",
        rows_m: 6,
        cols_n: 12,
        temp_min: 2,
        temp_max: 8,
        max_weight_kg: 300,
        max_dims_x_mm: 800,
        max_dims_y_mm: 600,
        max_dims_z_mm: 400,
        comment: "Special temperature",
        distance_from_exit_m: 25
    },
    {
        id: 3,
        designation: "C-03",
        rows_m: 4,
        cols_n: 8,
        temp_min: 18,
        temp_max: 30,
        max_weight_kg: 1000,
        max_dims_x_mm: 1200,
        max_dims_y_mm: 1000,
        max_dims_z_mm: 1000,
        comment: "Heavy items",
        distance_from_exit_m: 5
    }
];

export const useRacks = ({ token }: UseRacksOptions) => {
    return useQuery<IRack[]>({
        queryKey: ["racks"],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return MOCK_RACKS;
        },
        enabled: true,
    });
};
