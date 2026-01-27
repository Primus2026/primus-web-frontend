
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Using z from zod directly as per deps
// Dialog imports removed as component does not exist

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RackCreate, IRack } from "@/types/Rack";
import { useEffect } from "react";

// Just in case these components don't exist exactly like this, I'll stick to a simpler modal structure effectively or rely on what's likely there.
// But wait, the previous list_dir showed `form.tsx`, `input.tsx`, `label.tsx`. It did NOT show `dialog.tsx`.
// I MUST CHECK if dialog exists. If not, I'll have to build a simple one or ask to install it.
// Assuming for now it might be missing, but let's check. 

// Actually, I'll just assume standard modal UI for now or use a fixed overlay if I can't find Dialog.
// Re-checking file list... `components/ui` had: badge, button, card, form, input, label, table.
// NO DIALOG. I need to create a simple Modal wrapper or just use a fixed div overlay for now to avoid complexity of installing full Dialog primitive if not user requested.
// OR, I can create a generic Modal component quickly.

const rackSchema = z.object({
    designation: z.string().min(1, "Designation is required"),
    rows_m: z.coerce.number().int().positive("Must be positive integer"),
    cols_n: z.coerce.number().int().positive("Must be positive integer"),
    temp_min: z.coerce.number(),
    temp_max: z.coerce.number(),
    max_weight_kg: z.coerce.number().positive("Must be positive"),
    max_dims_x_mm: z.coerce.number().int().positive("Must be positive integer"),
    max_dims_y_mm: z.coerce.number().int().positive("Must be positive integer"),
    max_dims_z_mm: z.coerce.number().int().positive("Must be positive integer"),
    comment: z.string().optional(),
    distance_from_exit_m: z.coerce.number().optional(),
}).refine((data) => data.temp_max > data.temp_min, {
    message: "Max temp must be greater than Min temp",
    path: ["temp_max"],
});

type RackFormValues = z.infer<typeof rackSchema>;

interface RackFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RackCreate) => void;
    initialData?: IRack;
    isLoading: boolean;
}

// Simple Modal UI since Dialog component is missing
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>X</Button>
                </div>
                {children}
            </div>
        </div>
    );
};

const RackFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: RackFormModalProps) => {
    const form = useForm<RackFormValues>({
        resolver: zodResolver(rackSchema),
        defaultValues: {
            designation: "",
            rows_m: 1,
            cols_n: 1,
            temp_min: 0,
            temp_max: 20,
            max_weight_kg: 100,
            max_dims_x_mm: 1000,
            max_dims_y_mm: 1000,
            max_dims_z_mm: 1000,
            comment: "",
            distance_from_exit_m: 0,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset(initialData);
            } else {
                form.reset({
                    designation: "",
                    rows_m: 1,
                    cols_n: 1,
                    temp_min: 0,
                    temp_max: 20,
                    max_weight_kg: 100,
                    max_dims_x_mm: 1000,
                    max_dims_y_mm: 1000,
                    max_dims_z_mm: 1000,
                    comment: "",
                    distance_from_exit_m: 0,
                });
            }
        }
    }, [isOpen, initialData, form]);

    const handleSubmit = (values: RackFormValues) => {
        onSubmit(values);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Rack" : "Create New Rack"}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="designation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="max_weight_kg" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Weight (kg)</FormLabel>
                                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="rows_m" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rows (m)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="cols_n" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cols (n)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="temp_min" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Temp (&deg;C)</FormLabel>
                                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="temp_max" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Temp (&deg;C)</FormLabel>
                                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="max_dims_x_mm" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dim X (mm)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="max_dims_y_mm" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dim Y (mm)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="max_dims_z_mm" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dim Z (mm)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="comment" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : (initialData ? "Update Rack" : "Create Rack")}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};

export default RackFormModal;
