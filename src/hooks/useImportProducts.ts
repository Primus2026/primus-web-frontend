
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/hooks/utils/fetcher";
import type { ImportTaskResponse, ImportStatusResponse } from "@/types/Import";
import { useState, useEffect } from "react";
import { API_URL } from "@/config/constants";

interface UseImportProductsOptions {
    token?: string | null;
}

export const useImportProducts = ({ token }: UseImportProductsOptions) => {
    const [taskCsvId, setTaskCsvId] = useState<string | null>(null);
    const [taskImagesId, setTaskImagesId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // --- CSV IMPORT ---

    const uploadCsv = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            
            const res = await fetch(`${API_URL}product_definitions/import_csv`, {
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
            setTaskCsvId(data.task_id);
        }
    });

    const importCsvStatus = useQuery({
        queryKey: ["import-products-csv-status", taskCsvId],
        queryFn: () => fetcher<ImportStatusResponse>(`${API_URL}product_definitions/import_csv/${taskCsvId}`, token || undefined),
        enabled: !!taskCsvId && !!token,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "completed" || status === "failed") {
                return false;
            }
            return 1000;
        },
    });

    useEffect(() => {
        if (importCsvStatus.data?.status === "completed") {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        }
    }, [importCsvStatus.data?.status, queryClient]);

    const resetCsvImport = () => {
        setTaskCsvId(null);
    };

    // --- BULK IMAGE IMPORT ---

    const uploadImages = useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach(file => {
                 formData.append("files", file);
            });
           
            const res = await fetch(`${API_URL}product_definitions/bulk-images`, {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: formData,
            });

            if(!res.ok) {
                const resData = await res.json();
                throw new Error(await resData.detail || "Image bulk import init failed");
            }
            return res.json() as Promise<ImportTaskResponse>;
        },
        onSuccess: (data) => {
            setTaskImagesId(data.task_id);
        }
    });

    const importImagesStatus = useQuery({
        queryKey: ["import-products-images-status", taskImagesId],
        queryFn: () => fetcher<ImportStatusResponse>(`${API_URL}product_definitions/bulk-images/${taskImagesId}`, token || undefined),
        enabled: !!taskImagesId && !!token,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "completed" || status === "failed") {
                return false;
            }
            return 1000;
        },
    });

    const resetImagesImport = () => {
        setTaskImagesId(null);
    };

    return {
        // CSV
        uploadCsv,
        importCsvStatus,
        resetCsvImport,
        taskCsvId,
        // Images
        uploadImages,
        importImagesStatus,
        resetImagesImport,
        taskImagesId
    };
};
