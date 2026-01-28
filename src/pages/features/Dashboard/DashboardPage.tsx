import type { FC } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRacks } from "@/hooks/useRacks";
import AdminDashboard from "@/components/features/Dashboard/AdminDashboard";
import WorkerDashboard from "@/components/features/Dashboard/WorkerDashboard";

const DashboardPage: FC = () => {
    const { token, isAdmin } = useAuth(); // isAdmin is directly available from AuthProvider context
    
    // Fetch data at page level to potentially pass down, or let components fetch.
    // Fetching here avoids double fetching if we switch logic, but fine to pass data down.
    const { data: racks = [], isLoading, error } = useRacks({ token });

    return (
        <div className="container mx-auto p-6 animate-in fade-in duration-500">
            {error ? (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                    Failed to load racks. Please try again later.
                </div>
            ) : (
                <>
                    {isAdmin ? (
                        <AdminDashboard 
                            racks={racks} 
                            isLoading={isLoading} 
                            token={token} 
                        />
                    ) : (
                        <WorkerDashboard 
                            racks={racks} 
                            isLoading={isLoading} 
                        />
                    )}
                </>
            )}
        </div>
    )
}
export default DashboardPage;
