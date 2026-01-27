import { useMutation, useQuery } from "@tanstack/react-query";
import { postFetcher, fetcher } from "@/hooks/utils/fetcher";
import type { ImportTaskResponse, ImportStatusResponse } from "@/types/Import";
import { useState } from "react";

interface UseImportRacksOptions {
    token?: string | null;
}

export const useImportRacks = ({ token }: UseImportRacksOptions) => {
    const [taskId, setTaskId] = useState<string | null>(null);

    const uploadCsv = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            
            // We need a custom fetcher for FormData as postFetcher JSON.stringifies body
            const res = await fetch("/api/v1/racks/import", {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: formData,
            });

            if(!res.ok) {
                const resData = await res.json();
                throw new Error(await resData.detail || "Import init failed");
            }
            return res.json() as Promise<ImportTaskResponse>;
        },
        onSuccess: (data) => {
            setTaskId(data.task_id);
        }
    });

    // Valid statuses for refetching: polling should continue if state is 'pending' or 'processing'
    // But react-query's refetchInterval is easier to manage if we return it here.
    
    const importStatus = useQuery({
        queryKey: ["import-status", taskId],
        queryFn: () => fetcher<ImportStatusResponse>(`/api/v1/racks/import/${taskId}`, token || undefined),
        enabled: !!taskId && !!token,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "completed" || status === "failed") {
                return false;
            }
            return 1000; // Poll every 1s
        },
    });

    const resetImport = () => {
        setTaskId(null);
    };

    return {
        uploadCsv,
        importStatus,
        resetImport,
        taskId
    };
};
