
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/hooks/utils/fetcher";
import type { ImportTaskResponse, ImportStatusResponse } from "@/types/Import";
import { useState, useEffect } from "react";
import { API_URL } from "@/config/constants";

interface UseImportRacksOptions {
    token?: string | null;
}

export const useImportRacks = ({ token }: UseImportRacksOptions) => {
    const [taskId, setTaskId] = useState<string | null>(null);

    const uploadCsv = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            
            // Explicitly use proper API URL
            const res = await fetch(`${API_URL}racks/import`, {
                method: "POST",
                headers: {
                     // Do not set Content-Type for FormData, browser sets it with boundary
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

    const queryClient = useQueryClient();

    const importStatus = useQuery({
        queryKey: ["import-status", taskId],
        queryFn: () => fetcher<ImportStatusResponse>(`${API_URL}racks/import/${taskId}`, token || undefined),
        enabled: !!taskId && !!token,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "completed" || status === "failed") {
                return false;
            }
            return 1000; // Poll every 1s
        },
    });

    useEffect(() => {
        if (importStatus.data?.status === "completed") {
            queryClient.invalidateQueries({ queryKey: ["racks"] });
        }
    }, [importStatus.data?.status, queryClient]);

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
