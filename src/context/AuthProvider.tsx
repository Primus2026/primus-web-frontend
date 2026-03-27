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
    refreshProfile: () => Promise<void>;
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
        
        // Common paths for both roles
        const commonPaths = ["", "dashboard", "product-definitions", "reports", "backups", "alerts"];

        if (isAdmin) {
            // ADMIN can access: User Management, Warehouse Definition, + Common
            // Explicitly excluding 'profile' if that's the requirement, but usually admins need profile. 
            // However, following the requirement: "Personal Security: Change own login password" is listed under Warehouse Employee.
            // Let's assume Admin also has a profile for now to avoid locking them out of basic settings if they exist.
            // Requirement says: "workers: can do everything except what admins can do". 
            // And Admin: "User Management, Warehouse Definition, Assortment, Reports, Backups".
            // It DOES NOT explicitly list "Profile" for Admin.
            const adminPaths = ["users-manager", "warehouse-definition", "admin/ai", "printer-control", "chess-setup", "tictactoe", "qr-generator", "logo-ozt", "warehouse-inventory", ...commonPaths]; 
            return adminPaths.includes(cleanPath);
        } else {
            // WAREHOUSEMAN: Assortment (Product Definitions), Reports, Backups, Personal Security (Profile).
            const workerPaths = [...commonPaths, "profile"];
            return workerPaths.includes(cleanPath);
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

    const refreshProfile = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
    }, [queryClient]);

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
            refreshProfile,
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