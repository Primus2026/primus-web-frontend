
import type { IProductDefinition } from "@/types/ProductDefinition";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIcon, Pencil } from "lucide-react";
import { API_URL } from "@/config/constants";
import { useState, useEffect } from "react";

interface ProductCardProps {
    product: IProductDefinition;
    onDelete: (id: number) => void;
    onEdit: (product: IProductDefinition) => void;
    isAdmin: boolean;
}

const ProductCard = ({ product, onDelete, onEdit, isAdmin }: ProductCardProps) => {
    const getImageUrl = (path: string) => {
        if (path.startsWith("http")) return path;
        const baseUrl = API_URL.replace(/\/api\/v1\/?$/, "");
        // Ensure path doesn't have leading slash if we append
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        // If path doesn't start with media, assuming we might need to prepend it, 
        // OR checking if the backend returns the full media url relative to root.
        // Usually Django returns 'media/...' or just '...' if configured differently.
        // Let's assume it returns relative to MEDIA_ROOT which is mapped to /media url usually.
        // Use a safer bet: try to construct it. 
        // If path implies media, use it.
        return `${baseUrl}/${cleanPath}`;
    };

    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        setImageError(false);
        setRetryCount(0);
    }, [product.photo_path]);

    const handleImageError = () => {
        if (retryCount < 3) {
            const timer = setTimeout(() => {
                setRetryCount((prev: number) => prev + 1);
            }, 1000 * (retryCount + 1)); // Backoff: 1s, 2s, 3s
            return () => clearTimeout(timer);
        } else {
            setImageError(true);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden">
            <div className="relative h-48 w-full bg-muted/20 flex items-center justify-center overflow-hidden">
                {product.photo_path && !imageError ? (
                    <img 
                        src={`${getImageUrl(product.photo_path)}${retryCount > 0 ? `?retry=${retryCount}` : ''}`} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={handleImageError}
                    />
                ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                )}
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                <CardTitle className="text-lg font-bold tracking-wide truncate pr-4" title={product.name}>
                    {product.name}
                </CardTitle>
                <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className={product.is_dangerous ? "border-red-500 text-red-500" : ""}>
                        {product.frequency_class}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm space-y-2 mt-2">
                     <div className="flex justify-between items-center text-muted-foreground">
                        <span>Kod kreskowy</span>
                        <span className="font-medium text-foreground">{product.barcode}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Zakres Temp.</span>
                        <span className="font-medium text-foreground">
                            {product.req_temp_min}°C - {product.req_temp_max}°C
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Waga</span>
                        <span className="font-medium text-foreground">{product.weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Wymiary</span>
                        <span className="font-mono text-xs">{product.dims_x_mm}x{product.dims_y_mm}x{product.dims_z_mm}</span>
                    </div>
                    {product.is_dangerous && (
                         <div className="text-xs font-bold text-red-500 mt-2">
                            MATERIAŁ NIEBEZPIECZNY
                        </div>
                    )}
                </div>
            </CardContent>
            {isAdmin && (
                <CardFooter className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary" 
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                        title="Edytuj"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                        title="Usuń"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default ProductCard;
