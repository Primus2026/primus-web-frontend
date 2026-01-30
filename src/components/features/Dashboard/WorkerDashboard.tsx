import { useState } from "react";
import type { IRack } from "@/types/Rack";
import RackCardGrid from "./RackCardGrid";
import RackFormModal from "./RackFormModal";

interface WorkerDashboardProps {
    racks: IRack[];
    isLoading: boolean;
}

const WorkerDashboard = ({ racks, isLoading }: WorkerDashboardProps) => {
    const [viewingRack, setViewingRack] = useState<IRack | undefined>(undefined);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        View current rack configurations and layout.
                    </p>
                </div>
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    Read Only Mode
                </div>
            </div>

            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Rack Status</h2>
                    <span className="text-sm text-muted-foreground">
                        Total Racks: {racks.length}
                    </span>
                </div>

                <RackCardGrid 
                    racks={racks} 
                    isLoading={isLoading} 
                    onEdit={() => {}} 
                    onDelete={() => {}}
                    onView={setViewingRack}
                    isAdmin={false}
                />
            </div>

            <RackFormModal
                isOpen={!!viewingRack}
                onClose={() => setViewingRack(undefined)}
                onSubmit={() => {}} 
                initialData={viewingRack}
                isLoading={false}
                readOnly={true}
            />
        </div>
    );
};

export default WorkerDashboard;
