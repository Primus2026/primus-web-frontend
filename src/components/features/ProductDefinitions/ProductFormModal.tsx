
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { FrequencyClass } from "@/types/ProductDefinition";
import type { IProductDefinition, ProductDefinitionCreate } from "@/types/ProductDefinition";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    barcode: z.string().min(1, "Barcode is required"),
    req_temp_min: z.coerce.number(),
    req_temp_max: z.coerce.number(),
    weight_kg: z.coerce.number().positive("Must be positive"),
    dims_x_mm: z.coerce.number().int().positive("Must be positive integer"),
    dims_y_mm: z.coerce.number().int().positive("Must be positive integer"),
    dims_z_mm: z.coerce.number().int().positive("Must be positive integer"),
    is_dangerous: z.boolean(),
    comment: z.string().optional(),
    expiry_days: z.coerce.number().int().nonnegative("Must be non-negative"),
    frequency_class: z.nativeEnum(FrequencyClass),
    photo_path: z.string().optional(),
}).refine((data) => data.req_temp_max > data.req_temp_min, {
    message: "Max temp must be greater than Min temp",
    path: ["req_temp_max"],
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductDefinitionCreate) => void;
    initialData?: IProductDefinition;
    isLoading: boolean;
    readOnly?: boolean;
}

// Simple Modal UI
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

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading, readOnly }: ProductFormModalProps) => {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            barcode: "",
            req_temp_min: 0,
            req_temp_max: 20,
            weight_kg: 1,
            dims_x_mm: 100,
            dims_y_mm: 100,
            dims_z_mm: 100,
            is_dangerous: false,
            comment: "",
            expiry_days: 365,
            frequency_class: FrequencyClass.C,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    ...initialData,
                    comment: initialData.comment || "",
                });
            } else {
                form.reset({
                    name: "",
                    barcode: "",
                    req_temp_min: 0,
                    req_temp_max: 20,
                    weight_kg: 1,
                    dims_x_mm: 100,
                    dims_y_mm: 100,
                    dims_z_mm: 100,
                    is_dangerous: false,
                    comment: "",
                    expiry_days: 365,
                    frequency_class: FrequencyClass.C,
                });
            }
        }
    }, [isOpen, initialData, form]);

    const handleSubmit = (values: ProductFormValues) => {
        onSubmit(values);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? "Product Details" : (initialData ? "Edit Product" : "Create New Product")}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <fieldset disabled={readOnly} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="barcode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Barcode</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="weight_kg" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight (kg)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="frequency_class" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequency Class</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={FrequencyClass.A}>Class A</SelectItem>
                                            <SelectItem value={FrequencyClass.B}>Class B</SelectItem>
                                            <SelectItem value={FrequencyClass.C}>Class C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="req_temp_min" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Temp (&deg;C)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="req_temp_max" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Temp (&deg;C)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="dims_x_mm" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dim X (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dims_y_mm" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dim Y (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dims_z_mm" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dim Z (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="expiry_days" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiry Days</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="is_dangerous" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dangerous Goods</FormLabel>
                                    <div className="flex flex-row items-center space-x-3 rounded-md border h-10 px-3">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={readOnly} />
                                        </FormControl>
                                        <span className="text-sm text-muted-foreground">Mark as dangerous</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="comment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                    </fieldset>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading && !readOnly}>{readOnly ? "Close" : "Cancel"}</Button>
                        {!readOnly && (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
