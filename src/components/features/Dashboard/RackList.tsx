
import { type FC } from "react";
import { type IRack } from "@/types/Rack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RackListProps {
    racks: IRack[];
    isLoading: boolean;
}

const RackList: FC<RackListProps> = ({ racks, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="h-16 bg-muted/50 rounded-t-lg" />
                        <CardContent className="h-24" />
                    </Card>
                ))}
            </div>
        );
    }

    if (!racks.length) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No racks found in the warehouse.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {racks.map((rack) => (
                <Card key={rack.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-bold">
                            {rack.designation}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {rack.temp_max <= 10 && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200" variant="secondary">
                                    Cold Storage
                                </Badge>
                            )}
                            <Badge variant="outline">
                                {rack.rows_m}x{rack.cols_n}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm space-y-2 mt-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Temperature:</span>
                                <span className={rack.temp_max < 10 ? "text-blue-500" : ""}>
                                    {rack.temp_min}°C - {rack.temp_max}°C
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Max Weight:</span>
                                <span>{rack.max_weight_kg} kg</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Max Dimensions:</span>
                                <span>{rack.max_dims_x_mm}x{rack.max_dims_y_mm}x{rack.max_dims_z_mm} mm</span>
                            </div>
                            {rack.comment && (
                                <p className="text-xs italic text-muted-foreground border-t pt-2 mt-2">
                                    "{rack.comment}"
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default RackList;
