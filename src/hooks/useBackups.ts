
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config/constants";
import { toast } from "react-toastify";

export interface IBackupResponse {
    name: string;
    size: number;
    modified: number;
    source?: string;
}

// Fetcher helper
async function fetcher<T>(url: string, token?: string): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error("API Error");
    }
    return res.json();
}

async function postFetcher<T>(url: string, token?: string): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, { 
        method: "POST",
        headers 
    });
    if (!res.ok) {
        throw new Error("API Error");
    }
    return res.json();
}

export const useBackups = (token?: string | null) => {
    return useQuery({
        queryKey: ["backups"],
        queryFn: () => fetcher<IBackupResponse[]>(`${API_URL}backups/`, token || undefined),
        enabled: !!token
    });
};

export const useCreateBackup = (token?: string | null) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => postFetcher<{ task_id: string }>(`${API_URL}backups/`, token || undefined),
        onSuccess: () => {
             // We can't immediately refetch as it's async, but we can invalidate
             queryClient.invalidateQueries({ queryKey: ["backups"] });
        },
        onError: () => {
            toast.error("Failed to initiate backup");
        }
    });
};

export const useRestoreBackup = (token?: string | null) => {
    return useMutation({
        mutationFn: (filename: string) => 
            postFetcher<{ task_id: string }>(`${API_URL}backups/${filename}/restore`, token || undefined),
        onError: () => {
            toast.error("Failed to initiate restore");
        }
    });
};
