import type { FC } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRacks } from "@/hooks/useRacks";
import RackList from "@/components/features/Dashboard/RackList";

const DashboardPage: FC = () => {
    const { token } = useAuth();
    const { data: racks = [], isLoading, error } = useRacks({ token });

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Overview of warehouse status and racks.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Warehouse Racks</h2>
                    <span className="text-sm text-muted-foreground">
                        Total: {racks.length}
                    </span>
                </div>
                
                {error ? (
                    <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                        Failed to load racks. Please try again later.
                    </div>
                ) : (
                    <RackList racks={racks} isLoading={isLoading} />
                )}
            </div>
        </div>
    )
}
export default DashboardPage;