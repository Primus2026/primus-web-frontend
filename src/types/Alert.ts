export type AlertType = 'TEMP' | 'WEIGHT' | 'EXPIRY' | 'EXPIRY_WARNING';

export interface Alert {
    id: number;
    alert_type: AlertType;
    rack_id?: number;
    product_id?: number;
    message: string;
    is_resolved: boolean;
    is_sent: boolean;
    created_at: string;
    position_row?: number;
    position_col?: number;
    last_valid_weight?: number;
}
