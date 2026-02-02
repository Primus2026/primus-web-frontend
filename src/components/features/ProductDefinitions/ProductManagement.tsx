
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import { useProductDefinitions } from "@/hooks/useProductDefinitions";
import { useProductMutations } from "@/hooks/useProductMutations";
import { useImportProducts } from "@/hooks/useImportProducts";
import { useAuth } from "@/context/AuthProvider";
import type { ProductDefinitionCreate } from "@/types/ProductDefinition";
import ImportProductsModal from "./ImportProductsModal";
import ImportProductPhotosModal from "./ImportProductPhotosModal";
import { Upload, ImagePlus } from "lucide-react";
import type { IProductDefinition } from "@/types/ProductDefinition"; // Added for IProductDefinition

const ProductManagement = () => {
    const { token, isAdmin } = useAuth();
    const { data: products = [], isLoading, error } = useProductDefinitions({ token });
    const [editingProduct, setEditingProduct] = useState<IProductDefinition | undefined>(undefined);
    const { createProduct, updateProduct, deleteProduct, uploadProductImage } = useProductMutations({ token });
    const { 
        uploadCsv, 
        importCsvStatus, 
        resetCsvImport, 
        uploadImages, 
        importImagesStatus, 
        resetImagesImport 
    } = useImportProducts({ token });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportCsvModalOpen, setIsImportCsvModalOpen] = useState(false);
    const [isImportImagesModalOpen, setIsImportImagesModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    const handleCreate = (data: ProductDefinitionCreate & { imageFile?: File }) => {
        const { imageFile, ...productData } = data;
        
        if (editingProduct) {
             // Update Mode
             updateProduct.mutate({ id: editingProduct.id, ...productData }, {
                onSuccess: (updatedProduct) => {
                    // If there is an image, upload it now
                    if (imageFile) {
                        uploadProductImage.mutate({ id: updatedProduct.id, file: imageFile }, {
                            onSuccess: () => {
                                toast.success("Product updated successfully");
                                setIsCreateModalOpen(false);
                                setEditingProduct(undefined);
                            },
                             onError: (err) => { // Added err parameter
                                toast.warning(`Product updated but image upload failed: ${err.message}`); // Added err.message
                                setIsCreateModalOpen(false);
                                setEditingProduct(undefined);
                            }
                        });
                    } else {
                        toast.success("Product updated successfully");
                        setIsCreateModalOpen(false);
                        setEditingProduct(undefined);
                    }
                },
                onError: (err) => toast.error(`Failed to update product: ${err.message}`) // Added err.message
            });
        } else {
            // Create Mode
            createProduct.mutate(productData, {
                onSuccess: (newProduct) => {
                    // If there is an image, upload it now
                    if (imageFile && newProduct.id) {
                         uploadProductImage.mutate({ id: newProduct.id, file: imageFile }, {
                            onSuccess: () => {
                                 toast.success("Product created and image uploaded successfully");
                                  setIsCreateModalOpen(false);
                            },
                            onError: (err) => {
                                 toast.warning(`Product created but image upload failed: ${err.message}`);
                                 setIsCreateModalOpen(false);
                            }
                        });
                    } else {
                        toast.success("Product created successfully");
                        setIsCreateModalOpen(false);
                    }
                },
                onError: (err) => toast.error(`Failed to create product: ${err.message}`), // Added err.message
            });
        }
    };

    const handleEdit = (product: IProductDefinition) => {
        setEditingProduct(product);
        setIsCreateModalOpen(true);
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
                             <Button variant="outline" onClick={() => setIsImportCsvModalOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" /> Import CSV
                            </Button>
                            <Button variant="outline" onClick={() => setIsImportImagesModalOpen(true)}>
                                <ImagePlus className="mr-2 h-4 w-4" /> Bulk Images
                            </Button>
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
                            onEdit={handleEdit}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            <ProductFormModal 
                isOpen={isCreateModalOpen} 
                onClose={() => { setIsCreateModalOpen(false); setEditingProduct(undefined); }}
                onSubmit={handleCreate}
                initialData={editingProduct} 
                isLoading={createProduct.isPending || updateProduct.isPending}
            />

            <ImportProductsModal 
                isOpen={isImportCsvModalOpen} 
                onClose={() => setIsImportCsvModalOpen(false)} 
                onUpload={(file) => uploadCsv.mutate(file)}
                importState={importCsvStatus.data}
                isUploading={uploadCsv.isPending}
                onReset={resetCsvImport}
            />

             <ImportProductPhotosModal 
                isOpen={isImportImagesModalOpen} 
                onClose={() => setIsImportImagesModalOpen(false)} 
                onUpload={(files) => uploadImages.mutate(files)}
                importState={importImagesStatus.data}
                isUploading={uploadImages.isPending}
                onReset={resetImagesImport}
            />
        </div>
    );
};

export default ProductManagement;
