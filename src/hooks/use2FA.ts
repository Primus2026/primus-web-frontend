import { API_URL } from "@/config/constants";
import { useMutation } from "@tanstack/react-query";

interface ISetup2FAResponse {
    secret: string;
    qr_code_url: string;
    qr_code_image: string;
}
interface I2FAVerifyResponse {
    message: string;
}

async function setup2FA(token: string): Promise<ISetup2FAResponse> {
    const response = await fetch(`${API_URL}auth/2fa/setup`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if(!response.ok) {
        throw new Error("Athorization error");
    }
    return await response.json();
}

export const useSetup2FA = (token: string) => {
    return useMutation({
        mutationFn: () => setup2FA(token)
    })
}

async function verify2FA(token: string, code: string): Promise<I2FAVerifyResponse> {
    const response = await fetch(`${API_URL}auth/2fa/verify`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });
    if(!response.ok) {
        throw new Error("Athorization error");
    }
    return await response.json();
}

export const useVerify2FA = (token: string) => {
    return useMutation({
        mutationFn: (code: string) => verify2FA(token, code)
    })
}
