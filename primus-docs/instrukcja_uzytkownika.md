# Instrukcja Obsługi Systemu Magazynowego — Primus 2026
---
**Typ Dokumentu:** Podręcznik Użytkownika Końcowego (Kierownika Magazynu / Operatora zrobotyzowanej stacji pomiarowej).  
**Wymagania brzegowe:** Utworzone w pełni zweryfikowane poświadczenia klasy `ADMIN`.

## 1. Dostęp do Panelu Finałowego
Po pomyślnym przeprowadzeniu autoryzacji w panelu dostępowym, system uwierzytelniania waliduje rolę użytkownika. Operatorzy logistyczni posiadający prawo kontroli nad manipulatorem zyskają widoczność nowej sekcji rozwijanej znajdującej się w lewym pasku nawigacji bocznej zatytułowanej **Dodatkowe (Etap 3)**.

## 2. Kalibracja Wstępna (Przed pracą)
Nim system webowy będzie w stanie prawidłowo operować szachownicą magazynową, konieczne jest obudzenie sterownika sprzętowego (Drukarki 3D).

1. Upewnij się, że urządzenie (magazyn na drukarce) jest fizycznie połączone przewodem Data-USB z serwerem obliczeniowym.
2. Przejdź do zakładki **Plansza Magazynu** w menu.
3. Kliknij przycisk **Połącz z drukarką**. Status zmieni kolor na zielony informując o otwarciu portu szeregowego.
4. Użyj przycisku piktogramu "Dom" (**Home**) na środku okna joysticka, aby wyzerować pozycje głowicy magnetycznej manipulatora w krańcówkach `X=0, Y=0, Z=0`. Od tej pory system synchronizuje logiczną macierz 8x8 z rzeczywistym wymiarem blatu.

## 3. Moduły Oprogramowania
Interfejs został podzielony na wyizolowane zakładki zadaniowe odpowiedzialne za dedykowane procesy technologiczne obiektu.

### 3.1. Plansza Magazynu
Konsola operatorska dostarczająca podglądu z kamery maszynowej w czasie rzeczywistym oraz ręczny joystick kontrolny. Umożliwia precyzyjne odzyskiwanie zablokowanych towarów lub korekty offsetowe za pomocą zdefiniowanego marginesu kroku: `1mm`, `10mm`, `50mm`, `100mm`.

### 3.2. Szachownica (Centrum Inwentaryzacji)
Podziałka numeryczna 8x8 (64 dedykowane sloty składowania).
- **Odśwież planszę**: Zaciągnięcie ostatniego logicznie zapisanego modelu ułożenia z węzła decyzyjnego backendu.
- **Skan Inwentaryzacji**: Bezobsługowy cykl ruchu robota nad całą planszą układem zygzakowatym; za pomocą obiektywu w locie mapuje wszystkie zastane przedmioty, podsumowując stan towaru na półkach.
- **Rozstaw figury (Auto-detekcja)**: Naciśnięcie tego wyzwalacza powoduje próbę autonomicznego przeorganizowania towarów z punktów dostępowych na dedykowane pozycje. Wbudowano tzw. fall-back: jeśli maszyna nie wykryje dedykowanego kodu QR na towarze ze względu na brud lub zdarcie etykiety, następuje automatyczna próba zliczenia asortymentu w oparciu o logikę AI modelu percepcji obrazu piktogramowego (np. zarysu naklejki pojazdu czy kształtu logo).

### 3.3. Budowa Logo OZT
Wizualnie imponujące narzędzie zautomatyzowane demonstrujące skryptowe możliwości manipulatora. Aplikacja każe maszynie bezbłędnie przetestować pętlę podnoszenia (pick) i kładzenia (place) asortymentu w ustrukturyzowany napis "OZT".

### 3.4. Kółko i Krzyżyk
Praktyczny demonstrator symulacyjny ucieleśniający system przeciwstawnej Sztucznej Inteligencji (gry 0-sum). Zagrywaj partię przeciwko samemu serwerowi analizującemu z precyzją, a urządzenie posłuży za gracza przesuwającego swoje bloki za pomocą manipulatora.

### 3.5. Generowanie QR
Wypuszczenie do otwartego uniwersum biznesowego. Jeżeli w sekcji *Definicje Produktów* dodasz nowy element asortymentu ERP w Etapie 2, tutaj masz możliwość wygenerowania pliku produkcyjnego PNG w postaci gęstego, zaszyfrowanego kodu QR. Kody należy nakleić stricte na powierzchni wierzchniej bryły towarowej.

---
## 4. Rozwiązywanie Problemów (Troubleshooting)

| Aspekt Awarii | Obiekny Objaw | Zalecana Akcja w Systemie (Zatwierdzone Procedury Interwencyjne) |
|---|---|---|
| **Frontend/UI** | Kliknięcie w dowolny ruch nie skutkuje zmianami na pulpicie UI lub zawiesza Loader obracającym elementem | Utracono Socket / Fetch Timeout. Wejdź w Planszę Magazynu i wymuś **Zrestartuj Połączenie**. W ostateczności F5 i oczyszczenie ciastek/LocalStorage. |
| **Backend API** | [TODO: Osoby B uzupełniają ten wiersz po podłączeniu silników REST] | [POLE DO UZUPEŁNIENIA] |
| **Hardware** | Karetka gubi pozycję i przestrzeliwuje punkt docelowy piktogramu. | [POLE DO UZUPEŁNIENIA przez OSOBĘ C - opisać procedurę kalibracji śrub trapezowych czy też dociągnięcia pasków dla silników Nema 17] |
| **Wizja (AI)** | Urządzenie zapętla się i nie rozpoznaje białych pionków na oświetlonym tle. | [POLE DO UZUPEŁNIENIA przez OSOBĘ C - wskazówka o jasności/wybudzeniu kamer, kalibracji balansu bieli w OpenCV w pokoju prelekcji OZT] |
