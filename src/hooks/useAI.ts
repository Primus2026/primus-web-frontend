import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config/constants";
import type { TaskRequestResponse, TaskStatusResponse, FeedbackResponse } from "@/types/AI";
import { useAuth } from "@/context/AuthProvider";

// Helper for authorized requests
const useAuthHeader = () => {
    const { token } = useAuth();
    return { Authorization: `Bearer ${token}` };
};

export function useRecognizeProduct() {
    const headers = useAuthHeader();
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const { data } = await axios.post<TaskRequestResponse>(
                `${API_URL}ai/recognize`, 
                formData, 
                { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        }
    });
}

export function useRetrainModel() {
    const headers = useAuthHeader();
    return useMutation({
        mutationFn: async () => {
            const { data } = await axios.get<TaskRequestResponse>(
                `${API_URL}ai/retrain`, 
                { headers }
            );
            return data;
        }
    });
}

export function useResetModel() {
    const headers = useAuthHeader();
    return useMutation({
        mutationFn: async () => {
            const { data } = await axios.post<{ message: string }>(
                `${API_URL}ai/model/reset`, 
                {},
                { headers }
            );
            return data;
        }
    });
}

export function useUploadTrainingData() {
    const headers = useAuthHeader();
    return useMutation({
        mutationFn: async ({ productId, files }: { productId: number; files: File[] }) => {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            
            const { data } = await axios.post<FeedbackResponse>(
                `${API_URL}ai/training-data/${productId}`, 
                formData,
                { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
            );
            return data;
        }
    });
}

export function useTaskStatus(taskId: string | null) {
    const headers = useAuthHeader();
    
    return useQuery({
        queryKey: ['ai-task', taskId],
        queryFn: async () => {
             if (!taskId) return null;
             const { data } = await axios.get<TaskStatusResponse>(
                 `${API_URL}ai/task-status/${taskId}`, 
                 { headers }
             );
             return data;
        },
        enabled: !!taskId,
        refetchInterval: (query) => {
            const state = query.state.data?.status;
            if (state === 'SUCCESS' || state === 'FAILURE') {
                return false; // Stop polling
            }
            return 1000; // Poll every 1s
        }
    });
}
