export enum FrequencyClass {
    A = 'A',
    B = 'B',
    C = 'C'
}

export interface IProductDefinition {
    id: number;
    name: string;
    barcode: string;
    photo_path?: string;
    req_temp_min: number;
    req_temp_max: number;
    weight_kg: number;
    dims_x_mm: number;
    dims_y_mm: number;
    dims_z_mm: number;
    is_dangerous: boolean;
    comment?: string;
    expiry_days: number;
    frequency_class: FrequencyClass;
}

export interface ProductDefinitionCreate {
    name: string;
    barcode: string;
    req_temp_min: number;
    req_temp_max: number;
    weight_kg: number;
    dims_x_mm: number;
    dims_y_mm: number;
    dims_z_mm: number;
    is_dangerous: boolean;
    comment?: string;
    expiry_days: number;
    frequency_class: FrequencyClass;
}

export interface ProductDefinitionUpdate extends Partial<ProductDefinitionCreate> {
    id: number;
}
