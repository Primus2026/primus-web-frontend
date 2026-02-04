import { useState } from 'react';
import { useRecognizeProduct, useResetModel, useRetrainModel, useTaskStatus, useUploadTrainingData } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, BrainCircuit, Upload, Play, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminAIPage() {
    // Hooks
    const retrainMutation = useRetrainModel();
    const resetMutation = useResetModel();
    const recognizeMutation = useRecognizeProduct();
    const uploadTrainingDataMutation = useUploadTrainingData();

    // State
    const [activeTab, setActiveTab] = useState<"control" | "test" | "train">("control");
    
    // Prediction State
    const [predictionFile, setPredictionFile] = useState<File | null>(null);
    const [predictionPreview, setPredictionPreview] = useState<string | null>(null);
    const [predictionTaskId, setPredictionTaskId] = useState<string | null>(null);

    // Retrain State
    const [retrainTaskId, setRetrainTaskId] = useState<string | null>(null);

    // Training Data State
    const [trainingFiles, setTrainingFiles] = useState<File[]>([]);
    const [trainingProductId, setTrainingProductId] = useState<string>("");

    // Poll for status
    const { data: predictionStatus } = useTaskStatus(predictionTaskId);
    const { data: retrainStatus } = useTaskStatus(retrainTaskId);

    const handleRetrain = () => {
        retrainMutation.mutate(undefined, {
            onSuccess: (data) => {
                setRetrainTaskId(data.task_id);
                toast.info("Trening modelu rozpoczęty...");
            },
            onError: (_err) => toast.error("Błąd rozpoczynania treningu")
        });
    };

    const handleReset = () => {
        if (!confirm("Czy na pewno chcesz zresetować model? Zostanie on pobrany ponownie.")) return;
        resetMutation.mutate(undefined, {
            onSuccess: () => toast.success("Model zresetowany pomyślnie"),
            onError: (_err) => toast.error("Błąd resetowania modelu")
        });
    };

    const handlePredictionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPredictionFile(file);
            setPredictionPreview(URL.createObjectURL(file));
            setPredictionTaskId(null); // Reset previous result
        }
    };

    const runPrediction = () => {
        if (!predictionFile) return;
        recognizeMutation.mutate(predictionFile, {
            onSuccess: (data) => {
                setPredictionTaskId(data.task_id);
            },
            onError: () => toast.error("Błąd wysyłania zdjęcia")
        });
    };

    const handleTrainingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setTrainingFiles(Array.from(e.target.files));
        }
    };

    const uploadTrainingData = () => {
        if (!trainingProductId || trainingFiles.length === 0) {
            toast.warning("Wybierz produkt i zdjęcia");
            return;
        }
        
        uploadTrainingDataMutation.mutate({
            productId: parseInt(trainingProductId),
            files: trainingFiles
        }, {
            onSuccess: () => {
                toast.success(`Wgrano ${trainingFiles.length} zdjęć treningowych`);
                setTrainingFiles([]);
                setTrainingProductId("");
                // Clear file input manually if needed via ref, keeping it simple for now
            },
            onError: (_err) => toast.error("Błąd wgrywania danych")
        });
    };

    return (
        <div className="container mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Zarządzanie AI</h1>
                    <p className="text-muted-foreground">Panel administracyjny modelu rozpoznawania obrazu</p>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="w-full">
                <div className="grid grid-cols-3 bg-muted p-1 rounded-lg mb-4">
                    <button 
                        onClick={() => setActiveTab('control')}
                        className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'control' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                    >
                        Sterowanie Modelem
                    </button>
                    <button 
                        onClick={() => setActiveTab('test')}
                        className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'test' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                    >
                        Testowanie (Predykcja)
                    </button>
                    <button 
                        onClick={() => setActiveTab('train')}
                        className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'train' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
                    >
                        Dane Treningowe
                    </button>
                </div>

                {/* --- MODEL CONTROL TAB --- */}
                {activeTab === 'control' && (
                    <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="text-primary"/> Dotrenowanie Modelu
                                </CardTitle>
                                <CardDescription>Uruchom proces ponownego treningu z wykorzystaniem nowych danych.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {retrainTaskId && retrainStatus && (
                                    <div className="bg-muted p-4 rounded-lg mb-4 text-sm border">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">Status zadania:</span>
                                            <span className={`font-mono ${retrainStatus.status === 'SUCCESS' ? 'text-green-600' : retrainStatus.status === 'FAILURE' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {retrainStatus.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground break-all">ID: {retrainTaskId}</div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    onClick={handleRetrain} 
                                    disabled={retrainMutation.isPending || (retrainStatus?.status === 'STARTED' || retrainStatus?.status === 'PENDING')}
                                    className="w-full"
                                >
                                    {retrainMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2 h-4 w-4"/>}
                                    Rozpocznij Trening
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-destructive/20 border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <RotateCcw/> Reset Modelu
                                </CardTitle>
                                <CardDescription>Usuń lokalne pliki modelu i wymuś pobranie/inicjalizację od nowa.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground bg-destructive/5 p-4 rounded border-destructive/10 border">
                                    Uwaga: Operacja ta jest nieodwracalna. Model zostanie zresetowany do stanu początkowego, a następnie pobrany ponownie z serwerów HuggingFace.
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleReset} 
                                    disabled={resetMutation.isPending}
                                    className="w-full"
                                >
                                    {resetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RotateCcw className="mr-2 h-4 w-4"/>}
                                    Zresetuj Model
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* --- TEST / PREDICTION TAB --- */}
                {activeTab === 'test' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Testowanie Rozpoznawania</CardTitle>
                                <CardDescription>Wgraj zdjęcie, aby sprawdzić jak model je sklasyfikuje.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label htmlFor="prediction-file">Wybierz zdjęcie</Label>
                                        <div className="flex items-center gap-4">
                                            <Input 
                                                id="prediction-file" 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handlePredictionUpload}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        
                                        {predictionPreview && (
                                            <div className="relative aspect-square w-full max-w-[300px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                                <img src={predictionPreview} alt="Preview" className="object-contain w-full h-full"/>
                                            </div>
                                        )}

                                        <Button 
                                            onClick={runPrediction} 
                                            disabled={!predictionFile || recognizeMutation.isPending}
                                            className="w-full"
                                        >
                                            {recognizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                                            Analizuj Obraz
                                        </Button>
                                    </div>

                                    {/* Results Column */}
                                    <div className="space-y-4">
                                        <Label>Wynik Analizy</Label>
                                        
                                        {!predictionTaskId && !recognizeMutation.isPending && (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border rounded-lg border-dashed">
                                                <ImageIcon size={48} className="mb-4 opacity-20"/>
                                                <p>Oczekiwanie na zdjęcie...</p>
                                            </div>
                                        )}

                                        {predictionTaskId && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded border">
                                                    Status Zadania: 
                                                    <span className="font-mono font-bold ml-auto">{predictionStatus?.status || 'Waiting...'}</span>
                                                    {(predictionStatus?.status === 'PENDING' || predictionStatus?.status === 'STARTED') && <Loader2 className="h-3 w-3 animate-spin"/>}
                                                </div>

                                                {predictionStatus?.status === 'SUCCESS' && predictionStatus.result && (
                                                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-in zoom-in-95">
                                                        <div className="p-6 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-muted-foreground">Rozpoznano:</p>
                                                                    <p className="text-2xl font-bold text-primary">{predictionStatus.result.name}</p>
                                                                </div>
                                                                <CheckCircle2 className="text-green-500 h-8 w-8"/>
                                                            </div>
                                                            <div className="h-px bg-border my-4" /> {/* Separator replacement */}
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-muted-foreground">Pewność (Confidence):</p>
                                                                    <p className="font-mono font-medium">{(predictionStatus.result.confidence * 100).toFixed(2)}%</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">ID Produktu:</p>
                                                                    <p className="font-mono font-medium">{predictionStatus.result.product_id}</p>
                                                                </div>
                                                            </div>
                                                            {predictionStatus.result.barcode && (
                                                                <div className="pt-2">
                                                                    <p className="text-muted-foreground text-xs">Kod kreskowy:</p>
                                                                    <p className="font-mono">{predictionStatus.result.barcode}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                 {predictionStatus?.status === 'FAILURE' && (
                                                     <div className="border border-destructive/50 bg-destructive/10 p-4 rounded-lg flex items-start gap-3">
                                                         <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                         <div>
                                                             <h5 className="font-medium text-destructive mb-1">Błąd</h5>
                                                             <p className="text-sm text-destructive/80">
                                                                 Nie udało się przetworzyć obrazu. {JSON.stringify(predictionStatus.result)}
                                                             </p>
                                                         </div>
                                                     </div>
                                                 )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- TRAINING DATA / UPLOAD TAB --- */}
                {activeTab === 'train' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Wgrywanie Danych Treningowych</CardTitle>
                                <CardDescription>Dodaj zdjęcia do zbioru treningowego dla konkretnego produktu.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-id">ID Produktu</Label>
                                    <Input 
                                        id="product-id" 
                                        placeholder="np. 12" 
                                        value={trainingProductId}
                                        onChange={(e) => setTrainingProductId(e.target.value)}
                                        type="number"
                                    />
                                    <p className="text-xs text-muted-foreground">Wpisz ID produktu, dla którego wgrywasz zdjęcia.</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="training-files">Zdjęcia (Wiele)</Label>
                                    <Input 
                                        id="training-files" 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleTrainingUpload}
                                    />
                                    {trainingFiles.length > 0 && (
                                        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                            <CheckCircle2 className="h-3 w-3"/> Wybrano {trainingFiles.length} plików
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    onClick={uploadTrainingData} 
                                    disabled={uploadTrainingDataMutation.isPending || !trainingProductId || trainingFiles.length === 0}
                                >
                                    {uploadTrainingDataMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                                    Wyślij do Treningu
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
