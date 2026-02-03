import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { FC } from "react";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "react-toastify";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
  confirmPassword: z.string().min(1, "Potwierdź swoje hasło")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hasła nie pasują do siebie",
  path: ["confirmPassword"],
});

interface EditPasswordModalProps {
    setIsPasswordModalOpen: (open: boolean) => void;
}

const EditPasswordModal: FC<EditPasswordModalProps> = ({ setIsPasswordModalOpen }) => {
    const { token } = useAuth();
    const updatePasswordMutation = useUpdatePassword(token || "");

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: z.infer<typeof changePasswordSchema>) => {
        updatePasswordMutation.mutate({
            old_password: values.oldPassword,
            new_password: values.newPassword,
            confirm_password: values.confirmPassword
        }, {
            onSuccess: () => {
                toast.success("Hasło zaktualizowane pomyślnie");
                setIsPasswordModalOpen(false);
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4">
                <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Zmień Hasło</h3>
                        <p className="text-sm text-muted-foreground">
                            Wprowadź obecne hasło oraz nowe, aby zaktualizować.
                        </p>
                    </div>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                                control={form.control}
                                name="oldPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Obecne Hasło</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nowe Hasło</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Potwierdź Nowe Hasło</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="mt-2 sm:mt-0"
                                >
                                    Anuluj
                                </Button>
                                <Button type="submit" disabled={updatePasswordMutation.isPending}>
                                    {updatePasswordMutation.isPending ? "Aktualizowanie..." : "Zmień Hasło"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
        </div>
    )
}

export default EditPasswordModal;