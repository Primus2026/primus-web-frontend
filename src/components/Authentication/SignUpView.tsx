import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import z from "zod"
import { useSignUpRequest } from "@/hooks/useLogin";
import { toast } from "react-toastify";

// Schemat dla rejestracji
const signupSchema = z.object({
  login: z.string().min(2, "Login jest wymagany"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
})



const SignupView = ({ onToggle }: { onToggle: () => void }) => {
  const signUpMutation = useSignUpRequest();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { login: "", email: "", password: "" },
  })

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    signUpMutation.mutate({
      email: values.email,
      login: values.login,
      password: values.password,
    }, {
      onSuccess: () => {
        toast.success("Twoje konto zostało utworzone i oczekuje na potwierdzenie");
        onToggle();
      }
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Rejestracja</CardTitle>
        <CardDescription className="text-center">Utwórz nowe konto pracownika</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login</FormLabel>
                  <FormControl><Input placeholder="nowy_login" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="twoj@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Zarejestruj się</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <button 
          onClick={onToggle}
          className="cursor-pointer text-sm text-blue-600 hover:underline mt-2"
        >
          Masz już konto? Zaloguj się
        </button>
      </CardFooter>
    </>
  )
}
export default SignupView;