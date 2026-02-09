import { API_URL } from "@/config/constants";
import { type Alert } from "@/types/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher, postFetcher } from "./utils/fetcher";
import { toast } from "react-toastify";

export function useAlerts(
    token?: string,
    isResolved?: boolean,
    isSent?: boolean
) {
    let url = `${API_URL}alerts/`; // Fixed trailing slash to avoid 307 Redirects
    const params = new URLSearchParams();
    
    if (isResolved !== undefined) {
        params.append("is_resolved", isResolved.toString());
    }
    if (isSent !== undefined) {
        params.append("is_sent", isSent.toString());
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    return useQuery<Alert[]>({
        queryKey: ["alerts", isResolved, isSent],
        queryFn: () => fetcher(url, token),
        enabled: !!token,
        // Optional: polling for the list as well if needed
        // refetchInterval: 5000 
    });
}

export function useUnsentAlerts(
    token?: string
) {
    // Logic for "Unread" tab - fetches unsent/unread alerts
    // Backend endpoint /alerts/unsent is specifically for this
    const url = `${API_URL}alerts/unsent`;
    return useQuery<Alert[]>({
        queryKey: ["alerts", "unsent"],
        queryFn: () => fetcher(url, token),
        enabled: !!token
    });
}

export function useUnsentAlertsCount(
    token?: string
) {
     const url = `${API_URL}alerts/unsent`;
     return useQuery<number>({
         queryKey: ["alerts-count"],
         queryFn: async () => {
                const alerts = await fetcher<Alert[]>(url, token);
                return alerts.length;
         },
         enabled: !!token,
         refetchInterval: 3000,
         refetchIntervalInBackground: true, // Ensure updates even if tab is not focused
         retry: 1 // Don't retry too many times on poll, just wait for next functionality
     });
}

export function useMarkAlertsAsRead(
    token?: string
) {
    const queryClient = useQueryClient();
    const url = `${API_URL}alerts/mark-as-read`;
    
    return useMutation({
        mutationFn: (alertIds: number[]) => postFetcher(url, alertIds, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            queryClient.invalidateQueries({ queryKey: ["alerts-count"] });
        }
    });
}

export function useResolveAlert(
    token?: string
) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (alertId: number) => {
            const url = `${API_URL}alerts/${alertId}/resolve`;
            return postFetcher(url, {}, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            queryClient.invalidateQueries({ queryKey: ["alerts-count"] });
            toast.success("Rozwiązano alert", {
                autoClose: 1500
            });
        },
        onError: () => {
             toast.error("Nie udało się rozwiązać alertu", {
                autoClose: 300
             });
        }
    });
}
