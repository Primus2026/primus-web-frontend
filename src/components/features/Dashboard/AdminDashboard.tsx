import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AdminDashboardProps {
    // Props might be unused now, keeping interface to match DashboardPage for now or we can clean it up
    racks?: any[];
    isLoading?: boolean;
    token?: string | null;
}

const AdminDashboard = ({ }: AdminDashboardProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome to the specific admin area.
                    </p>
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
                <h2 className="text-lg font-semibold mb-2">Rack Management</h2>
                <p className="text-muted-foreground mb-4">
                    Rack management has been moved to the Warehouse Definition section.
                </p>
                <Button asChild>
                    <Link to="/warehouse-definition">Go to Warehouse Definition</Link>
                </Button>
            </div>
        </div>
    );
};

export default AdminDashboard;
