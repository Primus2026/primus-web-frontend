import type { FC } from "react";
import AdminDashboard from "@/components/features/Dashboard/AdminDashboard";
import WorkerDashboard from "@/components/features/Dashboard/WorkerDashboard";
import { useAuth } from "@/context/AuthProvider";

const DashboardPage: FC = () => {
    const { isAdmin } = useAuth();
    
    return (
        <div className="container mx-auto p-6">
            {isAdmin ? <AdminDashboard /> : <WorkerDashboard />}
        </div>
    )
}
export default DashboardPage;
