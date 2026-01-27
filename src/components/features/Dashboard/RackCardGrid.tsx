
import type { IRack } from "@/types/Rack";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface RackCardGridProps {
    racks: IRack[];
    isLoading: boolean;
    onEdit: (rack: IRack) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean;
}

const RackCardGrid = ({ racks, isLoading, onEdit, onDelete, isAdmin }: RackCardGridProps) => {
    const [search, setSearch] = useState("");

    const filteredRacks = racks.filter((rack) =>
        rack.designation.toLowerCase().includes(search.toLowerCase())
    );

    // Grouping Logic: Assumes designation starts with category e.g. "A-01" -> "A"
    const groupedRacks = filteredRacks.reduce((groups, rack) => {
        const category = rack.designation.split(/[-_0-9]/)[0] || "Uncategorized"; // simple split by hyphen/underscore/number
        const key = category.toUpperCase();
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(rack);
        return groups;
    }, {} as Record<string, IRack[]>);

    // Sort categories
    const sortedCategories = Object.keys(groupedRacks).sort();

    if (isLoading) {
        return (
            <div className="space-y-8">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-16 bg-muted/50 rounded-t-lg" />
                            <CardContent className="h-24" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="max-w-sm">
                <Input
                    placeholder="Search racks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredRacks.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No racks found matching your search.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedCategories.map(category => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-2xl font-semibold tracking-tight border-b pb-2 text-primary/80">
                                Zone {category}
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {groupedRacks[category].map((rack) => (
                                    <Card key={rack.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group bg-card/50 backdrop-blur-sm border-primary/20">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-lg font-bold tracking-wide">
                                                {rack.designation}
                                            </CardTitle>
                                            <div className="flex gap-1">
                                                {rack.temp_max <= 10 && (
                                                     <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200" variant="outline">
                                                        Cold
                                                    </Badge>
                                                )}
                                                <Badge variant="secondary" className="font-mono">
                                                    {rack.rows_m}x{rack.cols_n}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm space-y-3 mt-2">
                                                <div className="flex justify-between items-center text-muted-foreground">
                                                    <span>Temp Range</span>
                                                    <span className={`font-medium ${rack.temp_max < 10 ? "text-blue-500" : "text-foreground"}`}>
                                                        {rack.temp_min}°C - {rack.temp_max}°C
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-muted-foreground">
                                                    <span>Max Load</span>
                                                    <span className="font-medium text-foreground">{rack.max_weight_kg} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center text-muted-foreground">
                                                    <span>Dimensions</span>
                                                    <span className="font-mono text-xs">{rack.max_dims_x_mm}x{rack.max_dims_y_mm}x{rack.max_dims_z_mm}</span>
                                                </div>
                                                {rack.comment && (
                                                    <div className="text-xs italic text-muted-foreground bg-muted/50 p-2 rounded-md mt-2">
                                                        "{rack.comment}"
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        {isAdmin && (
                                            <CardFooter className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(rack)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(rack.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RackCardGrid;
