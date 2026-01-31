
import type { IRack } from "@/types/Rack";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming we have Input
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface RackTableProps {
    racks: IRack[];
    isLoading: boolean;
    onEdit: (rack: IRack) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean;
}

const RackTable = ({ racks, isLoading, onEdit, onDelete, isAdmin }: RackTableProps) => {
    const [search, setSearch] = useState("");

    const filteredRacks = racks.filter((rack) =>
        rack.designation.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-4 text-center">Loading racks...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Input
                    placeholder="Search racks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Designation</TableHead>
                            <TableHead>Grid (R x C)</TableHead>
                            <TableHead>Temp (&deg;C)</TableHead>
                            <TableHead>Max Weight (kg)</TableHead>
                            <TableHead>Dimensions (mm)</TableHead>
                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRacks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center h-24">
                                    No racks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRacks.map((rack) => (
                                <TableRow key={rack.id}>
                                    <TableCell className="font-medium">{rack.designation}</TableCell>
                                    <TableCell>{rack.rows_m} x {rack.cols_n}</TableCell>
                                    <TableCell>{rack.temp_min} - {rack.temp_max}</TableCell>
                                    <TableCell>{rack.max_weight_kg}</TableCell>
                                    <TableCell>{rack.max_dims_x_mm} x {rack.max_dims_y_mm} x {rack.max_dims_z_mm}</TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => onEdit(rack)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(rack.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default RackTable;
