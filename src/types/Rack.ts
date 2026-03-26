
export interface IRack {
    id: number;
    designation: string;
    rows_m: number;
    cols_n: number;
    min_temp: number;
    max_temp: number;
    max_weight_kg: number;
    slot_max_x_mm: number;
    slot_max_y_mm: number;
    slot_max_z_mm: number;
    comment?: string;
    distance_from_exit_m?: number;
    active_slots?: {
        row: number;
        col: number;
        current_weight: number;
    }[];
}

export interface RackCreate {
    designation: string;
    rows_m: number;
    cols_n: number;
    min_temp: number;
    max_temp: number;
    max_weight_kg: number;
    slot_max_x_mm: number;
    slot_max_y_mm: number;
    slot_max_z_mm: number;
    comment?: string;
    distance_from_exit_m?: number;
}

export interface RackUpdate extends Partial<RackCreate> {
    id: number;
}
