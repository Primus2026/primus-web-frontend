import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import z from "zod"
import { useLogin, useLogin2FA } from "@/hooks/useLogin";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";
import { Label } from "../ui/label";

const loginSchema = z.object({
  login: z.string().min(2, "Login jest wymagany"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
})

const LoginView = ({ onToggle }: { onToggle: () => void }) => {
  const {login} = useAuth();
  const loginMutation = useLogin();
  const login2FAMutation = useLogin2FA();
  const [is2FARequired, setIs2FARequired] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const [twoFACode, setTwoFACode] = useState("")
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutateAsync({
        login: values.login,
        password: values.password
    },
    {
      onSuccess: async (data) => {
            try {
                if(data.is_2fa_required) {
                    setIs2FARequired(true)
                    setTempToken(data.access_token)
                } else {
                    await login(data.access_token);
                }
            } catch (error: any) {
                toast.error(error.message || "Coś poszło nie tak");
            }
        }
    })
  }

  const handle2FAClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("2FA Code:", twoFACode)
    login2FAMutation.mutate({
        token: tempToken,
        code: twoFACode
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Zaloguj się</CardTitle>
        <CardDescription className="text-center">Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={is2FARequired ? handle2FAClick : form.handleSubmit(onSubmit)} className="space-y-4">
            {!is2FARequired ? (
             <>
                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login</FormLabel>
                      <FormControl><Input placeholder="twój_login" {...field} /></FormControl>
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
                <Button type="submit" className="w-full">Zaloguj się</Button>
             </>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="2fa-code">Kod Weryfikacyjny</Label>
                        <Input 
                            id="2fa-code"
                            placeholder="Wprowadź 6-cyfrowy kod"
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value)}
                            className="text-center text-lg tracking-widest"
                            autoFocus
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={!twoFACode}
                    >
                        Zweryfikuj i Zaloguj
                    </Button>
                </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <button 
          onClick={onToggle}
          className="cursor-pointer text-sm text-blue-600 hover:underline mt-2"
        >
          Zarejestruj się jako pracownik
        </button>
      </CardFooter>
    </>
  )
}
export default LoginView;
