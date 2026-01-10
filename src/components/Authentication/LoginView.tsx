import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import z from "zod"
import { useLogin } from "@/hooks/useLogin";

const loginSchema = z.object({
  login: z.string().min(2, "Login is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const LoginView = ({ onToggle }: { onToggle: () => void }) => {
    const loginMutation = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutateAsync({
        login: values.login,
        password: values.password
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
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
                  <FormControl><Input placeholder="your_login" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <button 
          onClick={onToggle}
          className="cursor-pointer text-sm text-blue-600 hover:underline mt-2"
        >
          Register as a worker
        </button>
      </CardFooter>
    </>
  )
}
export default LoginView;
