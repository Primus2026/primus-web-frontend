import { useRacks } from "@/hooks/useRacks";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WorkerDashboard = () => {
    const { token } = useAuth();
    const { data: racks = [], error } = useRacks({ token });

    // Basic Stats
    const totalRacks = racks.length;
    const activeRacks = racks.filter(r => (r.active_slots?.length || 0) > 0).length;

    if (error) {
        return (
             <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                Failed to load racks. Please try again later.
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Worker Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                         Warehouse operations and rack overview.
                    </p>
                </div>
            </div>

            {/* Operational Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warehouse Activity</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRacks} / {totalRacks}</div>
                        <p className="text-xs text-muted-foreground">Racks with active stock</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Access</div>
                        <p className="text-xs text-muted-foreground mb-4">View and download reports</p>
                         <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                            <Link to="/reports">Go to Reports</Link>
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Catalog</div>
                        <p className="text-xs text-muted-foreground mb-4">Check product definitions</p>
                         <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                            <Link to="/product-definitions">Go to Products</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WorkerDashboard;
