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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Budowa LOGO OZT</h1>
                    <p className="text-muted-foreground">
                        System automatycznego układania wzoru fizycznego za pomocą ramienia robotycznego.
                    </p>
                </div>
            </div>

            {errorMsg && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Błąd przygotowania planszy</AlertTitle>
                    <AlertDescription>
                        {errorMsg}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel główny */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    {isActionRunning ? (
                        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                            <div className="relative mb-8">
                                <Loader2 className="h-24 w-24 animate-spin text-primary" />
                                <LayoutGrid className="absolute inset-0 m-auto h-10 w-10 text-primary/60 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold">Proces w toku...</h2>
                            <p className="text-muted-foreground mt-3 max-w-sm">
                                Kamera sprawdza każde pole. Jeśli liczba klocków będzie poprawna, ramię rozpocznie układanie.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                            <div className="h-32 w-32 bg-muted rounded-2xl flex items-center justify-center shadow-sm border">
                                <LayoutGrid size={64} className="text-primary" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Gotowy do uruchomienia</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upewnij się, że plansza spełnia wymagania systemowe przed uruchomieniem analizy.
                                </p>
                            </div>

                            <Button 
                                size="lg"
                                className="w-full text-base h-14 gap-3"
                                disabled={isActionRunning}
                                onClick={executeLayoutLogo}
                            >
                                <LayoutGrid className="h-5 w-5" /> 
                                Uruchom Analizę i Budowę
                            </Button>
                        </div>
                    )}
                </div>

                {/* Panel boczny – wymagania */}
                <div className="flex flex-col gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Wymagania systemowe</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Liczba figur</p>
                                    <p className="text-xs text-muted-foreground">Dokładnie 21 dowolnych figur</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Rozmieszczenie</p>
                                    <p className="text-xs text-muted-foreground">Pozycje dowolne</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informacja techniczna */}
                    <div className="p-4 bg-muted/30 rounded-lg border text-[10px] text-muted-foreground space-y-1">
                        <p>● Endpoint: POST /api/v1/chess/layout-logo</p>
                        <p>● Wymagana autoryzacja JWT</p>
                        <p>● Czas operacji: ok. 60–120 s</p>
                    </div>
                </div>
            </div>

            {/* Nakładka blokująca w trakcie pracy */}
            {isActionRunning && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground">
                    <div className="bg-card border shadow-xl rounded-2xl p-8 flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                        <h2 className="text-2xl font-bold text-center">Ramię w ruchu...</h2>
                        <p className="mt-2 text-muted-foreground text-center">
                            Proszę nie przerywać połączenia, trwa wykonywanie fizycznej operacji na stole.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogoOztPage;