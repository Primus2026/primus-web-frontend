
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import * as z from "zod"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { FrequencyClass } from "@/types/ProductDefinition";
import type { IProductDefinition, ProductDefinitionCreate } from "@/types/ProductDefinition";
import { ImagePlus } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(1, "Nazwa jest wymagana"),
    barcode: z.string().min(1, "Kod kreskowy jest wymagany"),
    req_temp_min: z.coerce.number(),
    req_temp_max: z.coerce.number(),
    weight_kg: z.coerce.number().positive("Musi być dodatnia"),
    dims_x_mm: z.coerce.number().int().positive("Musi być liczbą całkowitą dodatnią"),
    dims_y_mm: z.coerce.number().int().positive("Musi być liczbą całkowitą dodatnią"),
    dims_z_mm: z.coerce.number().int().positive("Musi być liczbą całkowitą dodatnią"),
    is_dangerous: z.boolean(),
    comment: z.string().optional(),
    expiry_days: z.coerce.number().int().nonnegative("Musi być nieujemna"),
    frequency_class: z.nativeEnum(FrequencyClass),
    photo_path: z.string().optional(),
}).refine((data) => data.req_temp_max > data.req_temp_min, {
    message: "Maksymalna temperatura musi być wyższa niż minimalna",
    path: ["req_temp_max"],
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductDefinitionCreate & { imageFile?: File }) => void;
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
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);

    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
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
            setSelectedImage(undefined); // Reset image on open
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = (values: ProductFormValues) => {
        onSubmit({ ...values, imageFile: selectedImage });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? "Szczegóły Produktu" : (initialData ? "Edytuj Produkt" : "Utwórz Nowy Produkt")}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <fieldset disabled={readOnly} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nazwa</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="barcode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kod Kreskowy</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        {!readOnly && (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <ImagePlus className="h-4 w-4" />
                                    Zdjęcie Produktu
                                </FormLabel>
                                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/10 group hover:bg-muted/20 transition-colors">
                                    <div className="bg-background p-2 rounded-full border shadow-sm group-hover:scale-105 transition-transform">
                                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <FormControl>
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange}
                                                className="border-0 bg-transparent shadow-none p-0 h-auto file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:hover:bg-primary/90 cursor-pointer"
                                            />
                                        </FormControl>
                                    </div>
                                </div>
                                {selectedImage ? (
                                    <p className="text-xs text-muted-foreground mt-2 ml-1 font-medium text-primary max-w-[280px] truncate" title={selectedImage.name}>Wybrano: {selectedImage.name}</p>
                                ) : (
                                    initialData && <p className="text-xs text-muted-foreground mt-2 ml-1">Zostaw puste, aby zachować obecne zdjęcie</p>
                                )}
                            </FormItem>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="weight_kg" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Waga (kg)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="frequency_class" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Klasa Częstotliwości</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Wybierz klasę" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={FrequencyClass.A}>Klasa A</SelectItem>
                                            <SelectItem value={FrequencyClass.B}>Klasa B</SelectItem>
                                            <SelectItem value={FrequencyClass.C}>Klasa C</SelectItem>
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
                                    <FormLabel>Wym. X (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dims_y_mm" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wym. Y (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dims_z_mm" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wym. Z (mm)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="expiry_days" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dni Ważności</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="is_dangerous" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Towar Niebezpieczny</FormLabel>
                                    <div className="flex flex-row items-center space-x-3 rounded-md border h-10 px-3">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={readOnly} />
                                        </FormControl>
                                        <span className="text-sm text-muted-foreground">Oznacz jako niebezpieczny</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="comment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Komentarz</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                    </fieldset>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading && !readOnly}>{readOnly ? "Zamknij" : "Anuluj"}</Button>
                        {!readOnly && (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Zapisywanie..." : (initialData ? "Zaktualizuj Produkt" : "Utwórz Produkt")}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
