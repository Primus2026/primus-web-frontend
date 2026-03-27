import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Loader2, Wand2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useProductDefinitions } from "@/hooks/useProductDefinitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QRCode from "react-qr-code";
import { useRef } from "react";
import { API_URL } from "@/config/constants";

const QRGeneratorPage: FC = () => {
    const { token } = useAuth();
    const { data: products = [], isLoading: isProductsLoading } = useProductDefinitions({ token });
    const [selectedBarcode, setSelectedBarcode] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewValue, setPreviewValue] = useState<string | null>(null);
    const qrRef = useRef<HTMLDivElement>(null);

    const API_BASE = `${API_URL.replace(/\/$/, "")}/qr_generator`;

    const handleGenerateSet = async () => {
        setIsLoading(true);
        try {
            // Zakładamy, że endpoint zwraca wygenerowany obraz PNG jako blob lub paczkę ZIP
            const res = await fetch(`${API_BASE}/chess-set`, { 
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Błąd z backendem");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPreviewValue(null);
            setPreviewUrl(url);
            toast.success("Wygenerowano paczkę kodów QR dla szachów");
        } catch (e) {
            toast.error("Wystąpił błąd podczas komunikacji z serwerem generatora.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateSingle = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!selectedBarcode) {
            toast.warning("Proszę wybrać produkt z listy.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/generate?data=${encodeURIComponent(selectedBarcode)}`, { 
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPreviewValue(null);
            setPreviewUrl(url);
            toast.success("Wygenerowano kod QR");
        } catch(e) {
            toast.error("Nie udało się wygenerować kodu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (previewUrl) {
            const a = document.createElement("a");
            a.href = previewUrl;
            a.download = "primus_qr_codes.png"; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        if (!qrRef.current) return;
        const svg = qrRef.current.querySelector("svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        // Increase resolution for better print quality
        const size = 512;
        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, size, size);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `qr_${previewValue || 'product'}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Generator Kodów QR</h1>
                    <p className="text-muted-foreground">Generowanie naklejek na nowe przedmioty.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel Narzędziowy */}
                <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col gap-8">
                    
                    {/* Zestaw Szachowy */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Wand2 size={20} className="text-primary"/> Zestaw Pełny (Szachy)
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Generuje zoptymalizowany arkusz do druku (A4) zawierający wszystkie 32 kody potrzebne do stworzenia kompletnego zestawu.
                            </p>
                        </div>
                        <Button 
                            className="w-full sm:w-auto" 
                            onClick={handleGenerateSet}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                            Generuj Arkusz Szachowy
                        </Button>
                    </div>

                    <div className="border-t pt-6"></div>

                    {/* Pojedynczy Kod */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Pojedynczy Kod QR</h3>
                            <p className="text-sm text-muted-foreground">Wygeneruj testowy kod w razie zniszczenia konkretnej naklejki.</p>
                        </div>
                        <form onSubmit={handleGenerateSingle} className="flex flex-col sm:flex-row gap-3">
                            <Select 
                                value={selectedBarcode} 
                                onValueChange={setSelectedBarcode}
                                disabled={isProductsLoading}
                            >
                                <SelectTrigger className="w-full sm:w-[300px]">
                                    <SelectValue placeholder={isProductsLoading ? "Ładowanie produktów..." : "Wybierz produkt z bazy"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.barcode}>
                                            {p.name} ({p.barcode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                type="submit" 
                                variant="secondary"
                                disabled={isLoading}
                            >
                                Generuj
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Podgląd */}
                <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                    {previewUrl || previewValue ? (
                        <div className="flex flex-col items-center gap-6 w-full">
                            <div className="bg-white p-6 rounded-lg shadow-inner max-w-full overflow-hidden border">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Podgląd kodu QR" className="max-h-[300px] object-contain" />
                                ) : (
                                    <div ref={qrRef}>
                                        <QRCode value={previewValue!} size={256} />
                                    </div>
                                )}
                            </div>
                            <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" onClick={handleDownload}>
                                <Download className="mr-2 h-5 w-5" /> Pobierz Obraz (PNG)
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-3 opacity-50">
                            <QrCode size={64} className="mx-auto" />
                            <p>Brak podglądu w pamięci.<br/>Wygeneruj plik, aby go zobaczyć i pobrać.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default QRGeneratorPage;
