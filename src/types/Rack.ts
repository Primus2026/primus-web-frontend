
export interface IRack {
    id: number;
    designation: string;
    rows_m: number;
    cols_n: number;
    temp_min: number;
    temp_max: number;
    max_weight_kg: number;
    max_dims_x_mm: number;
    max_dims_y_mm: number;
    max_dims_z_mm: number;
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
    temp_min: number;
    temp_max: number;
    max_weight_kg: number;
    max_dims_x_mm: number;
    max_dims_y_mm: number;
    max_dims_z_mm: number;
    comment?: string;
    distance_from_exit_m?: number;
}

export interface RackUpdate extends Partial<RackCreate> {
    id: number;
}
