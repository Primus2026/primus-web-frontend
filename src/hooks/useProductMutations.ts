
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetcher, deleteFetcher, updateFetcher } from "@/hooks/utils/fetcher";
import type { ProductDefinitionCreate, IProductDefinition, ProductDefinitionUpdate } from "@/types/ProductDefinition";
import { API_URL } from "@/config/constants";

interface UseProductMutationsOptions {
    token?: string | null;
}

export const useProductMutations = ({ token }: UseProductMutationsOptions) => {
    const queryClient = useQueryClient();

    const createProduct = useMutation<IProductDefinition, Error, ProductDefinitionCreate>({
        mutationFn: (data: ProductDefinitionCreate) => 
            postFetcher(`${API_URL}product_definitions/`, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        },
    });

    const updateProduct = useMutation<IProductDefinition, Error, ProductDefinitionUpdate>({
        mutationFn: ({ id, ...data }: ProductDefinitionUpdate) => 
             updateFetcher(`${API_URL}product_definitions/${id}`, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: (id: number) =>
            deleteFetcher(`${API_URL}product_definitions/${id}`, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        },
    });

    const uploadProductImage = useMutation({
        mutationFn: async ({ id, file }: { id: number; file: File }) => {
            const formData = new FormData();
            formData.append("file", file); // endpoint expects 'file'
            
            const url = `${API_URL}product_definitions/${id}/upload_image`;
            console.log("Uploading image to:", url, "for ID:", id);

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: formData,
            });

            if (!res.ok) {
                 const resData = await res.json();
                 throw new Error(await resData.detail || "Image upload failed");
            }
            return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["product_definitions"] });
        }
    });

    return {
        createProduct,
        updateProduct,
        deleteProduct,
        uploadProductImage,
    };
};
