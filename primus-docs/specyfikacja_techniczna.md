# Specyfikacja Techniczna i API — Primus Warehouse 2026

Kluczowy dokument kalibracyjny i komunikacyjny, definiujący ramy przestrzeni roboczej robota (magazynu), mapowanie koordynatów komórek regału regułami matematycznymi oraz kontrakty sieciowe pomiędzy frontendem a backendem.

## 1. Parametry Sterowania Osią Z (Manipulator)
W manipulacji obiektami wykorzystano oś osiową `Z` drukarki kartezjańskiej połączoną ze sterowanym sygnałem PWM elektromagnesem chwytnym.

| Parametr / Operacja | Wysokość (Pozycja Z) | Ekwiwalent w G-code | Cel użycia |
|---|---|---|---|
| **Płaszczyzna Bezpieczna (Przejazd)** | `14.0 mm` | `G1 Z14 F1000` | Bezkolizyjny ruch poprzeczny (XY) karetką |
| **Zanurzenie 1-Poziomowe (Pick)** | `0.0 mm` | `G1 Z0 F1000` | Pobranie przedmiotu z poziomu stołu (dno slotu 8x8) |
| **Zanurzenie 2-Poziomowe (Stack)** | `4.2 mm` | `G1 Z4.2 F1000` | Podejście pod blok leżący na innym bloku (stakowanie LIFO) |
| **Uruchomienie Chwytaka** | - | `M106 S200` | Włączenie cewki elektromagnesu (wentylator na PIN 200) |
| **Zrzucenie Ładunku** | - | `M107` | Odcięcie prądu na cewce, zwolnienie bloku na podłoże |

## 2. Geometria Przestrzeni (Mapowanie Macierzy 8x8)
Interfejs użytkownika generuje indeksy tabelaryczne `[0..63]` (Szachownica). Są one przeliczane dynamicznie przez serwer na koordynaty fizyczne CNC.

### Wzory Płaszczyzny Płaskiej (XY)
Wyśrodkowanie pola odbywa się według parametrów konfiguracyjnych szerokości komórki (`30mm`) oraz marginesu startowego na stole platformy maszynowej (`31mm`). Pomiary od krańcówek brzegowych osi mechanicznych:
- **X_mm** = `31 + (col - 1) × 30`
- **Y_mm** = `31 + (row - 1) × 30`

*(Gdzie `row` i `col` to odpowiednio rząd i kolumna w zakresie 1 do 8).*

## 3. Komunikacja Sieciowa i API Contracts (REST)

*(Wykaz częściowy ustalony na potrzeby wywołań w React `fetch()`. Pełna struktura pól do uzupełnienia po uruchomieniu dokumentacji deweloperskiej Swagger UI/OpenAPI ze strony FastAPI).*

| Moduł | Metoda | Ścieżka (Endpoint) | Odpowiedź Oczekiwana / Opis |
|---|---|---|---|
| Kontrola Ręczna | POST | `/api/v1/gcode/move` | `200 OK` (Body: axis = X,Y,Z / distance = n) |
| System Wizyjny | GET | `/api/v1/camera/snapshot` | Strumień obrazu dla taga `<img src=...>` (MJPEG Stream / Snapshot raw) |
| Układ Szachownicy| GET | `/api/v1/chess/board-state` | `JSON` z tablicą 64 elementów string (np. `["WC", null, "PB"...]`) |
| Inwentaryzacja | POST | `/api/v1/chess/inventory` | Zatrzymuje odpowiedź HTTP do czasu ukończenia procesu fizycznego przez maszynę (long-polling) |
| AI | POST | `/api/v1/tictactoe/move` | [TODO: Osoba B opisuje kształt Request/Response body] |
| QR Generator | GET/POST | `/api/v1/qr_generator/generate`| Zwraca wynik kodowania do pliku PNG w oparciu o przesłane kody `barcode` z tabeli bazy ERP. |


## 4. Logika Obliczeniowa i Inteligencja (AI) — [SEKCJA DO UZUPEŁNIENIA]
Zadaniem **Osoby C** będzie wylistowanie i uzasadnienie decyzji naukowych dotyczących silników rozpoznających w tym miejscu:
- **Minimax (TicTacToe)**: [TODO: Ile poziomów głębokości (depth limit) drzewa alfa-beta zastosowano dla wydajnego procesora webowego/Raspberry Pi (jeśli serwer lata na małym hardware)?]
- **YOLO Piktogramy**: [TODO: Opisać użyty dataset dla zestawu obrazkowego, precyzję detekcji (Confidence threshold = n%), metodę fine-tuningu.]
- **Optymalizacja Ścieżek (TSP / Snake)**: [TODO: Dowód obliczeniowy, dlaczego inwentaryzacja metodą "zygzaka" przebiega i sekund krócej niż ruch liniowy.]
