
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RackCreate, IRack } from "@/types/Rack";
import { useEffect } from "react";

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
    distance_from_exit_m: z.preprocess(
        (val) => (val === "" || val === 0 || val === "0" ? undefined : val),
        z.coerce.number().positive("Must be positive").optional()
    ),
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
    readOnly?: boolean;
}

// Simple Modal UI since Dialog component is missing
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>X</Button>
                </div>
                {children}
            </div>
        </div>
    );
};

const RackFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading, readOnly }: RackFormModalProps) => {
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
            distance_from_exit_m: undefined, 
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
                    distance_from_exit_m: undefined,
                });
            }
        }
    }, [isOpen, initialData, form]);

    const handleSubmit = (values: RackFormValues) => {
        onSubmit(values);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? "Rack Details" : (initialData ? "Edit Rack" : "Create New Rack")}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <fieldset disabled={readOnly} className="space-y-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="distance_from_exit_m" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dist. from Exit (m)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="comment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comment</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </fieldset>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading && !readOnly}>{readOnly ? "Close" : "Cancel"}</Button>
                        {!readOnly && (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : (initialData ? "Update Rack" : "Create Rack")}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </Modal>
    );
};

export default RackFormModal;
