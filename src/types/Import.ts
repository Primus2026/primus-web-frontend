export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportSummary {
    total_processed: number;
    created_count: number;
    updated_count: number;
    skipped_count: number;
    skipped_details: {
        row: number;
        reason: string;
        data?: Record<string, any>;
    }[];
}

export interface ImportTaskResponse {
    task_id: string;
    status: ImportStatus;
}

export interface ImportStatusResponse {
    task_id: string;
    status: ImportStatus;
    summary?: ImportSummary;
    error?: string;
    message?: string;
}
