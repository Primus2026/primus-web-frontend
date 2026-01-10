import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";
import type { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: FC = () => {
    const {user, isLoading} = useAuth();

    if (isLoading) return <Loader2  className="animate-spin w-20 h-20"/>

    return user ? <Outlet/> : <Navigate to="/signin" replace />
}
export default ProtectedRoute;