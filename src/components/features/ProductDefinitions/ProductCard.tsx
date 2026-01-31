
import type { IProductDefinition } from "@/types/ProductDefinition";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProductCardProps {
    product: IProductDefinition;
    onDelete: (id: number) => void;
    isAdmin: boolean;
}

const ProductCard = ({ product, onDelete, isAdmin }: ProductCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                        <span>Barcode</span>
                        <span className="font-medium text-foreground">{product.barcode}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Temp Range</span>
                        <span className="font-medium text-foreground">
                            {product.req_temp_min}°C - {product.req_temp_max}°C
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Weight</span>
                        <span className="font-medium text-foreground">{product.weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Dimensions</span>
                        <span className="font-mono text-xs">{product.dims_x_mm}x{product.dims_y_mm}x{product.dims_z_mm}</span>
                    </div>
                    {product.is_dangerous && (
                         <div className="text-xs font-bold text-red-500 mt-2">
                            DANGEROUS GOODS
                        </div>
                    )}
                </div>
            </CardContent>
            {isAdmin && (
                <CardFooter className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default ProductCard;
