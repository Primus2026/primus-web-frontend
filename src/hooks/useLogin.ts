import { API_URL } from "@/config/constants";
import { useAuth } from "@/context/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface LoginIn {
    login: string;
    password: string;
}
interface Token {
    access_token: string;
    token_type: string;
    is_2fa_required: boolean;
}
interface SignUp {
    login: string;
    email: string;
    password: string;   
}
    
async function loginRequest(credentials: LoginIn): Promise<Token> {
    const formData = new URLSearchParams();
    
    formData.append('username', credentials.login); 
    formData.append('password', credentials.password);

    const response = await fetch(`${API_URL}auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
            throw new Error(error.detail || "Nieprawidłowe dane logowania");
        }
        throw new Error(error.detail || "Something went wrong");
    }
    
    return await response.json();
}

export const useLogin = () => {
    const {login} = useAuth();

    return useMutation({
        mutationFn: loginRequest,
        onSuccess: async (data) => {
            try {
                await login(data.access_token);
            } catch (error: any) {
                toast.error(error.message || "Something went wrong");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong");
        }
    })
}