import { useMutation, useQuery } from "@tanstack/react-query"
import { fetcher, postFetcher } from "./utils/fetcher"
import { API_URL } from "@/config/constants";

export interface IReportResponse {
    filename: string;
    created_at: string;
    size_bytes: number;
}

export interface IReportGenerateResponse {
    task_id: string;
    message: string;
}

export interface IReportStatusResponse {
    task_id: string;
    status: string;
    result: IReportResponse | null;
    download_url: string | null;
    error: string | null;
}

export type ReportType = "expiry" | "audit" | "temp";

export const useReports = (
    token?: string | null,
    typeFilter?: string | null
) => {
    return useQuery({
        queryKey: ["reports", typeFilter],
        queryFn: async () => {
            const url = typeFilter 
                ? `${API_URL}reports?type_filter=${typeFilter}` 
                : `${API_URL}reports`;
            return fetcher<IReportResponse[]>(url, token || undefined)
        },
        enabled: !!token
    })
}

export const useGenerateReport = (
    token?: string | null
) => {
    return useMutation({
        mutationFn: async (type: ReportType) => {
            return postFetcher<IReportGenerateResponse>(`${API_URL}reports/generate/${type}`, {}, token || undefined)
        }
    })
}

export const useDownloadReport = (
    token?: string | null
) => {
    return useMutation({
        mutationFn: async (filename: string) => {
            const response = await fetch(`${API_URL}reports/download/${filename}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Download failed");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    })
}

export const useCheckReportStatus = (
    token?: string | null
) => {
    return useMutation({
        mutationFn: async (task_id: string) => {
            return fetcher<IReportStatusResponse>(`${API_URL}reports/status/${task_id}`, token || undefined)
        }
    })
}