# Primus Web Frontend

Panel administracyjny systemu **Primus Inter Pares 2026** – interfejs webowy dla administratorów i pracowników magazynu. Aplikacja umożliwia zarządzanie regałami, katalogiem produktów, użytkownikami, backupami oraz monitorowanie stanu magazynu.

**Pełna dokumentacja projektu:** [Primus Docs](https://github.com/Primus2026/primus-docs)



## Architektura

Aplikacja frontendowa zbudowana jako **Single Page Application** w oparciu o React i TypeScript + Vite.

### Kluczowe technologie:

| Kategoria | Technologia | Zastosowanie |
|-----------|-------------|--------------|
| **Framework** | React 18 | Biblioteka UI |
| **Język** | TypeScript | Statyczne typowanie |
| **Bundler** | Vite | Szybki serwer deweloperski i build |
| **Stylowanie** | CSS + shadcn/ui | Komponenty UI |
| **State Management** | TanStack React Query | Zarządzanie stanem serwera i cache |
| **Routing** | React Router | Nawigacja |
| **HTTP Client** | Axios | Komunikacja z API |



## Realizacja Wymagań Specyfikacji

Frontend realizuje interfejs użytkownika dla funkcjonalności wymaganych przez regulamin:

### 1. Definiowanie Magazynu (Regały)
*   **Strona:** [`WarehouseDefinition`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/WarehouseDefinition)
*   **Funkcje:** Przeglądanie, dodawanie, edycja i usuwanie regałów (MxN, temperatury, waga, wymiary).
*   **Import CSV:** Modal do wczytywania definicji regałów z pliku CSV ([`ImportRacksModal`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/components/features/Racks/ImportRacksModal.tsx)).

### 2. Definiowanie Asortymentu (Produkty)
*   **Strona:** [`ProductDefinitions`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/ProductDefinitions)
*   **Funkcje:** Pełny CRUD katalogu produktów z uploadem zdjęć ([`ProductFormModal`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/components/features/ProductDefinitions/ProductFormModal.tsx)).
*   **Import CSV:** Masowe dodawanie produktów.

### 3. Wizualizacja Magazynu
*   **Strona:** [`Dashboard`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/Dashboard)
*   **Komponenty:**
    *   [`RackCardGrid`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/components/features/Dashboard/RackCardGrid.tsx) – Interaktywna siatka regałów z wizualizacją zajętości slotów.
    *   [`RackSlotGrid`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/components/features/Dashboard/RackSlotGrid.tsx) – Szczegółowy widok pojedynczego regału (MxN).
    *   [`SlotDetailsModal`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/components/features/Dashboard/SlotDetailsModal.tsx) – Podgląd zawartości slotu (produkt, data ważności, operacje).

### 4. Monitorowanie i Alerty
*   **Strona:** [`AlertsPage`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/AlertsPage.tsx)
*   **Funkcje:** Lista alertów (przekroczenie temperatury, zbliżający się termin ważności, nieautoryzowane zdjęcie wagi), oznaczanie jako rozwiązane.

### 5. Raportowanie
*   **Strona:** [`Reports`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/Reports)
*   **Funkcje:** Generowanie raportów PDF (ważność, temperatura, inwentaryzacja), pobieranie wygenerowanych plików.

### 6. Backupy
*   **Strona:** [`Backups`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/Backups)
*   **Funkcje:** Tworzenie manualnych backupów, przeglądanie listy kopii, przywracanie stanu magazynu.

### 7. Zarządzanie Użytkownikami (Admin)
*   **Strona:** [`WarehouseUsers`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/WarehouseUsers)
*   **Funkcje:** Lista użytkowników, zatwierdzanie/odrzucanie wniosków o rejestrację, usuwanie kont.

### 8. Panel AI (Admin)
*   **Strona:** [`AdminAIPage`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/AdminAIPage.tsx)
*   **Funkcje:** Zarządzanie modelem rozpoznawania obrazów (YOLO), upload zbioru danych, inicjowanie treningu, podgląd statusu.

### 9. Profil Użytkownika
*   **Strona:** [`Profile`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/features/Profile)
*   **Funkcje:** Zmiana hasła, konfiguracja 2FA (Google Authenticator).

### 10. Uwierzytelnianie
*   **Strona:** [`Authentication/LoginPage`](https://github.com/Primus2026/primus-web-frontend/blob/main/src/pages/Authentication/LoginPage.tsx)
*   **Funkcje:** Logowanie OAuth2, obsługa 2FA (TOTP).

---

## Struktura Projektu

```
src/
├── components/
│   ├── features/        # Komponenty specyficzne dla funkcjonalności (Dashboard, Products...)
│   ├── ui/              # Reużywalne komponenty UI (Button, Card, Modal...)
│   └── Navigation/      # Nawigacja i layout
├── hooks/               # Custom React Hooks (useAuth, useRacks, useProducts...)
├── pages/               # Strony aplikacji (routing)
├── context/             # React Context (AuthContext)
├── types/               # Definicje TypeScript
└── config/              # Konfiguracja (API URL)
```

---

## Uruchomienie

### Docker (Zalecane)
Cała infrastruktura jest definiowana w repozytorium [primus-infra](https://github.com/Primus2026/primus-infra).
```bash
docker compose up -d frontend
```
Aplikacja dostępna pod: `http://localhost:5173`

### Lokalnie (Development)
Wymagane: Node.js 18+, npm

1. Instalacja zależności:
```bash
npm install
```
2. Uruchomienie serwera deweloperskiego:
```bash
npm run dev
```
*Uwaga: Upewnij się, że backend jest uruchomiony pod adresem `http://localhost:8000`.*
