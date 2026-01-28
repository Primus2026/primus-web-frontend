import { API_URL } from "@/config/constants";
import { useAuth } from "@/context/AuthProvider";
import type { IUser } from "@/types/User";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface LoginIn {
    login: string;
    password: string;
}

interface SignUp {
    login: string;
    email: string;
    password: string;   
}
    
interface LoginResponse {
    access_token: string;
    token_type: string;
    is_2fa_required: boolean;
}
interface Login2FARequest {
    token: string;
    code: string;
}
async function loginRequest(credentials: LoginIn): Promise<LoginResponse> {
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

async function signupRequest(signupData: SignUp): Promise<IUser> {
    const response = await fetch(`${API_URL}users/request_register`, {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if(!response.ok) {
        const error = await response.json();
        if (response.status == 422) {
            throw new Error(error.detail || "Invalid date")
        }
        throw new Error(error.detail || "Something went wrong")
    }
    return await response.json();
}
async function login2FARequest(token: string, code: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}auth/2fa/login`, {
        method: "POST",
        body: JSON.stringify({token, code}),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if(!response.ok) {
        const error = await response.json();
        if (response.status == 422) {
            throw new Error(error.detail || "Invalid data")
        }
        throw new Error(error.detail || "Something went wrong")
    }
    return await response.json();
}

export const useLogin = () => {

    return useMutation({
        mutationFn: loginRequest,
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong");
        }
    })
}
export const useLogin2FA = () => {
    const {login} = useAuth();

    return useMutation({
        mutationFn: async ({token, code}: Login2FARequest) => login2FARequest(token, code),
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

export const useSignUpRequest = () => {
    return useMutation({
        mutationFn: signupRequest,
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong")
        }
    })
}