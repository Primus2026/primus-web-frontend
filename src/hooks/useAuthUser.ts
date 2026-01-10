import { API_URL } from "@/config/constants";
import type { IUser } from "@/types/User";
import { useQuery } from "@tanstack/react-query";

async function fetchUser(token: string | null): Promise<IUser | null> {
    if (!token) return null;

    const response = await fetch(`${API_URL}users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if(!response.ok) {
        localStorage.removeItem("access-token");
        throw new Error("Athorization error");
    }
    return await response.json();
}

export const useAuthUser = () => {
    const token = localStorage.getItem("access-token");
    return useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(token),
        staleTime: 1000 * 60 * 5,
        retry: false
    })
}