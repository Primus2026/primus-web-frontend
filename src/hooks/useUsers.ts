import { API_URL } from "@/config/constants";
import { type IUser } from "@/types/User";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher, updateFetcher, deleteFetcher } from "./utils/fetcher";
import { toast } from "react-toastify";

export function useUserSignUpRequests(
    token?: string,
) {
    const url = `${API_URL}users/requests`;
    return useQuery<IUser[]>({
        queryKey: ["users", "not_active"],
        queryFn: () => 
            fetcher(url, token),
        enabled: !!token
    })
}

export function useWareHouseWorkers(
    token?: string,
) {
    const url = `${API_URL}users/warehouse_workers`;
    return useQuery<IUser[]>({
        queryKey: ["users", "warehouse_workers"],
        queryFn: () => fetcher(url, token),
        enabled: !!token
    })
}

export function useApproveUserRequest(
    token?: string,
    id?: number
) {
    const queryClient = useQueryClient();
    const url = `${API_URL}users/approve_user/${id}`;
    return  useMutation({
        mutationFn: () => updateFetcher(url, null, token),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
            toast.success("User approved") 
        },
        onError: () => {
            toast.error("Failed to approve user")
        }
    })
}

export function useRejectUserRequest(
    token?: string,
    id?: number
) {
    const queryClient = useQueryClient();
    const url = `${API_URL}users/reject_user/${id}`;
    return  useMutation({
        mutationFn: () => updateFetcher(url, null, token),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
            toast.success("User rejected") 
        },
        onError: () => {
            toast.error("Failed to reject user")
        }
    })
}

export function useDeleteUser(
    token?: string
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => {
            const url = `${API_URL}users/${id}`;
            return deleteFetcher(url, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
}