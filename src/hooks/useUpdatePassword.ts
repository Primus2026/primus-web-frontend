
import { API_URL } from "@/config/constants";
import { useMutation } from "@tanstack/react-query";
import { postFetcher } from "./utils/fetcher";
import { toast } from "react-toastify";

interface UpdatePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export const useUpdatePassword = (token: string) => {
    return useMutation({
        mutationFn: (data: UpdatePasswordRequest) => {
            return postFetcher(`${API_URL}auth/change-password`, data, token);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update password");
        }
    });
};
