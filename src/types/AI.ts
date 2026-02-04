export interface TaskRequestResponse {
    task_id: string;
}

export interface TaskStatusResponse {
    task_id: string;
    status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';
    result?: RecognitionResult | { error: string } | any;
}

export interface RecognitionResult {
    product_id: number;
    name: string;
    confidence: number;
    barcode: string;
}

export interface FeedbackResponse {
    success: boolean;
    message: string;
}
