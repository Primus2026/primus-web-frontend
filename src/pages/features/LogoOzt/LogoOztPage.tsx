import { useState, type FC } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LogoOztPage: FC = () => {
    const { token } = useAuth();
    const [isActionRunning, setIsActionRunning] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const API_BASE = "/api/v1";

    const executeLayoutLogo = async () => {
        setIsActionRunning(true);
        setErrorMsg(null);
        
        try {
            const res = await fetch(`${API_BASE}/chess/layout-logo`, { 
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "LOGO OZT ułożone pomyślnie!");
            } else {
                // Obsługa błędów walidacji (za dużo/za mało klocków)
                const detail = data.detail || "Wystąpił nieoczekiwany błąd.";
                setErrorMsg(detail);
                toast.error("Błąd walidacji planszy");
            }
        } catch (e) {
            toast.error("Błąd połączenia z serwerem.");
            setErrorMsg("Nie można nawiązać połączenia z backendem drukarki.");
        } finally {
            setIsActionRunning(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-100">
                        Budowa LOGO OZT
                    </h1>
                    <p className="text-muted-foreground">
                        System automatycznego układania wzoru fizycznego za pomocą ramienia robotycznego.
                    </p>
                </div>
            </div>

            {/* Komunikat o błędzie liczby figur */}
            {errorMsg && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Błąd przygotowania planszy</AlertTitle>
                    <AlertDescription>
                        {errorMsg}
                    </AlertDescription>
                </Alert>
            )}

            <div className="bg-card border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl p-12 shadow-md flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {isActionRunning ? (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="relative mb-8">
                            <Loader2 className="h-32 w-32 animate-spin text-indigo-600" />
                            <LayoutGrid className="absolute inset-0 m-auto h-12 w-12 text-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Proces w toku...</h2>
                        <p className="text-muted-foreground mt-3 max-w-sm">
                            Kamera sprawdza każde pole. Jeśli liczba klocków będzie poprawna, ramię rozpocznie układanie.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center space-y-8 max-w-md z-10">
                        <div className="my-5 h-40 w-40 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-3xl flex items-center justify-center mb-2 shadow-xl rotate-2 hover:rotate-0 transition-transform duration-500 border-2 border-white dark:border-indigo-800">
                            <LayoutGrid size={80} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Wymagania systemowe</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Dokładnie 21 dowolnych figur</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Pozycje dowolne (poza rzędem 1)</span>
                            </div>
                        </div>

                        <Button 
                            size="lg"
                            className="w-full text-lg h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95 gap-3" 
                            disabled={isActionRunning}
                            onClick={executeLayoutLogo}
                        >
                            <LayoutGrid className="h-6 w-6" /> 
                            Uruchom Analizę i Budowę
                        </Button>
                    </div>
                )}
            </div>

            
        </div>
    );
};

export default LogoOztPage;