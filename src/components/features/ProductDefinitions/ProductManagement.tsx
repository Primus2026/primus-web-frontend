
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import { useProductDefinitions } from "@/hooks/useProductDefinitions";
import { useProductMutations } from "@/hooks/useProductMutations";
import { useAuth } from "@/context/AuthProvider";
import type { ProductDefinitionCreate } from "@/types/ProductDefinition";

const ProductManagement = () => {
    const { token, isAdmin } = useAuth();
    const { data: products = [], isLoading, error } = useProductDefinitions({ token });
    const { createProduct, deleteProduct } = useProductMutations({ token });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    const handleCreate = (data: ProductDefinitionCreate) => {
        createProduct.mutate(data, {
            onSuccess: () => {
                toast.success("Product created successfully");
                setIsCreateModalOpen(false);
            },
            onError: (err) => {
                toast.error(`Failed to create product: ${err.message}`);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
             deleteProduct.mutate(id, {
                onSuccess: () => {
                    toast.success("Product deleted successfully");
                },
                onError: (err) => {
                    toast.error(`Failed to delete product: ${err.message}`);
                }
            });
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) || 
        product.barcode.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Product Definitions</h2>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-md border">
                        Total Products: <span className="font-medium text-foreground ml-1">{products.length}</span>
                    </span>
                    {isAdmin && (
                        <div className="flex gap-3">
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> New Product
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-sm">
                <Input
                    placeholder="Search by name or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error ? (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                    Error loading products: {error.message}
                </div>
            ) : isLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 rounded-lg bg-muted/50 animate-pulse border" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No products found matching your search.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onDelete={handleDelete}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            <ProductFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={createProduct.isPending}
            />
        </div>
    );
};

export default ProductManagement;
