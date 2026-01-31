
import type { FC } from "react";
import ProductManagement from "@/components/features/ProductDefinitions/ProductManagement";

const ProductDefinitionsPage: FC = () => {
    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Definitions</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage product specifications and catalog.
                    </p>
                </div>
            </div>
            
            <ProductManagement />
        </div>
    )
}
export default ProductDefinitionsPage;
