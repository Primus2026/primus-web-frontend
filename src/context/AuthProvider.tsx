import { API_URL } from "@/config/constants";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { IUser, UserRole } from "@/types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


interface AuthContextType {
    user: IUser | null;
    role: UserRole | null;
    isAdmin: boolean;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<IUser>;
    logout: () => void;
    canAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {data: user, isLoading} = useAuthUser();

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("access-token")
    });

    const role = (user?.role as UserRole) || null;
    const isAdmin = role === "ADMIN";

    const canAccess = useCallback((path: string): boolean => {
        if (!role) return false;

        const cleanPath = path.replace(/^\/+|\/+$/g, "");
        if (isAdmin) {
            // ADMIN can access every path except /profile
            return cleanPath !== "profile";
        } else {
            // WAREHOUSEMAN can access dashboard, repoorts, backups and his profile pages
            const allowedPaths = ["", "reports", "backups", "profile", "warehouse-definition"];
            return allowedPaths.includes(cleanPath);
        }
    }, [role, isAdmin])

    useEffect(() => {
        const handleStorage = () => {
            setToken(localStorage.getItem("access-token"));
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [])
    
    const loginMutation = useMutation({
        mutationFn: async (token: string): Promise<IUser> => {
            localStorage.setItem("access-token", token);
            setToken(token);

            const response = await fetch(`${API_URL}users/me`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (!response.ok) {
                localStorage.removeItem("access-token");
                setToken(null);
                throw new Error("Authorization error");
            }

            const data = await response.json();

            if (data.role === "ADMIN" || data.role === "WAREHOUSEMAN") {
                return data;
            }
            throw new Error("You do not have permission to access the system")
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["user"], data);
            navigate("/");
        },
        onError: () => logout(),
    });

    const logout = useCallback(() => {
        localStorage.removeItem("access-token");
        setToken(null);
        queryClient.setQueryData(["user"], null);
        navigate("/signin");
    }, [navigate, queryClient])

    return (
        <AuthContext.Provider
        value={{
            user: user || null,
            role,
            isAdmin,
            token,
            isLoading,
            login: loginMutation.mutateAsync,
            logout,
            canAccess,
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};