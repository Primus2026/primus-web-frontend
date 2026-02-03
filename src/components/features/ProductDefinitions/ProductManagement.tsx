
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

    const handleCreate = async (data: ProductDefinitionCreate & { imageFile?: File }) => {
        const { imageFile, ...productData } = data;

        try {
            if (editingProduct) {
                // Update Mode
                const updatedProduct = await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
                
                if (imageFile) {
                    await uploadProductImage.mutateAsync({ id: updatedProduct.id, file: imageFile });
                    toast.success("Produkt zaktualizowany z nowym zdjęciem");
                } else {
                    toast.success("Produkt zaktualizowany pomyślnie");
                }
            } else {
                // Create Mode
                const newProduct = await createProduct.mutateAsync(productData);
                
                if (imageFile) {
                    // Check if ID exists to avoid NetworkError
                    if (newProduct && newProduct.id) {
                        await uploadProductImage.mutateAsync({ id: newProduct.id, file: imageFile });
                        toast.success("Produkt utworzony ze zdjęciem");
                    } else {
                        console.error("Created product is missing ID", newProduct);
                        toast.warning("Produkt utworzony, ale nie udało się przesłać zdjęcia (brak ID)");
                    }
                } else {
                     toast.success("Produkt utworzony pomyślnie");
                }
            }
            setIsCreateModalOpen(false);
            setEditingProduct(undefined);
        } catch (err: any) {
            console.error("Operation failed", err);
            // Distinguish between create/update error and upload error if possible, 
            // but for now a generic message with the error details is good.
            toast.error(`Operacja nie powiodła się: ${err.message || "Nieznany błąd"}`);
        }
    };

    const handleEdit = (product: IProductDefinition) => {
        setEditingProduct(product);
        setIsCreateModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Czy na pewno chcesz usunąć ten produkt?")) {
             deleteProduct.mutate(id, {
                onSuccess: () => {
                    toast.success("Produkt usunięty pomyślnie");
                },
                onError: (err) => {
                    toast.error(`Nie udało się usunąć produktu: ${err.message}`);
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
                <h2 className="text-xl font-semibold tracking-tight">Definicje Produktów</h2>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-md border">
                        Wszystkich Produktów: <span className="font-medium text-foreground ml-1">{products.length}</span>
                    </span>
                    {isAdmin && (
                        <div className="flex gap-3">
                             <Button variant="outline" onClick={() => setIsImportCsvModalOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" /> Importuj CSV
                            </Button>
                            <Button variant="outline" onClick={() => setIsImportImagesModalOpen(true)}>
                                <ImagePlus className="mr-2 h-4 w-4" /> Prześlij Bulk Zdjęć
                            </Button>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Nowy Produkt
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-sm">
                <Input
                    placeholder="Szukaj po nazwie lub kodzie kreskowym..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error ? (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                    Błąd ładowania produktów: {error.message}
                </div>
            ) : isLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 rounded-lg bg-muted/50 animate-pulse border" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">Nie znaleziono produktów pasujących do wyszukiwania.</p>
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
