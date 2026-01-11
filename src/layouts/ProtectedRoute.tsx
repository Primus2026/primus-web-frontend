import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";
import type { FC } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute: FC = () => {
    const { user, isLoading, canAccess } = useAuth();
    const location = useLocation();

    // 1. Czekamy na załadowanie danych użytkownika
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="animate-spin w-20 h-20 text-blue-500" />
            </div>
        );
    }

    // 2. Jeśli nie ma użytkownika -> do strony logowania
    if (!user) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // 3. Sprawdzamy uprawnienia do aktualnej ścieżki (URL)
    // Jeśli canAccess zwróci false -> przekierowujemy na Dashboard ("/")
    if (!canAccess(location.pathname)) {
        console.warn(`Access denied for path: ${location.pathname}`);
        return <Navigate to="/" replace />;
    }

    // 4. Jeśli wszystko OK -> renderujemy podstronę
    return <Outlet />;
};

export default ProtectedRoute;