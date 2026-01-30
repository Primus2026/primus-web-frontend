import type { FC } from "react";
import RackManagement from "@/components/features/Racks/RackManagement";

const WarehouseDefinitionPage: FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Definition</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure warehouse layout and properties.
                    </p>
                </div>
            </div>
            
            {/* Content will go here */}
<RackManagement />
        </div>
    )
}
export default WarehouseDefinitionPage;