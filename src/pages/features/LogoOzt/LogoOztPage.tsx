import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2 } from "lucide-react";

const LogoOztPage: FC = () => {
    const [isActionRunning, setIsActionRunning] = useState<boolean>(false);
    const API_BASE = "http://localhost:8000/api/v1";

    const executeLayoutLogo = async () => {
        setIsActionRunning(true);
        try {
            const res = await fetch(`${API_BASE}/chess/layout-logo`, { method: "POST" });
            if (res.ok) {
                toast.success("Ułożono LOGO OZT z bloków magazynowych!");
            } else {
                toast.error("Wystąpił błąd podczas pracy maszyny.");
            }
        } catch (e) {
            toast.error("Błąd połączenia sieciowego podczas wykonywania polecenia.");
        } finally {
            setIsActionRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Budowa LOGO OZT</h1>
                    <p className="text-muted-foreground">Edukacyjna demonstracja algorytmów układających bloki w konkretny wzór (logo uczelni).</p>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-center min-h-[400px]">
                
                {isActionRunning ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-24 w-24 animate-spin text-primary mb-6" />
                        <h2 className="text-2xl font-bold">Ramię pracuje...</h2>
                        <p className="text-muted-foreground text-center mt-2 max-w-sm">
                            Maszyna przekłada klocki w celu odtworzenia predefiniowanego wzoru logo na obszarze planszy.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                        <div className="h-32 w-32 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-inner border border-indigo-100">
                            <LayoutGrid size={64} />
                        </div>
                        <p className="text-muted-foreground">
                            Kliknij poniższy przycisk, aby uruchomić autonomiczną procedurę przygotowaną specjalnie na etap Finałowy Primus 2026.
                            Robot przesunie dostępne bloki w taki sposób, aby na planszy ukazało się odpowiednie lico z nazwą i symbolem organizacji.
                        </p>
                        <Button 
                            size="lg"
                            className="w-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700 text-white" 
                            disabled={isActionRunning}
                            onClick={executeLayoutLogo}
                        >
                            <LayoutGrid className="mr-3 h-6 w-6" /> 
                            Zbuduj fizyczne LOGO
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogoOztPage;
