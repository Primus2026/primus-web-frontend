# Skrypt Obrony i Agendy Prezentacji — Projekt Primus Finał OZT

Dokument ten jest ściągawką dla prezentera prowadzącego wystąpienie (pitching) dla kapituły konkursowej. Służy do spójnego połączenia wątków Web-Dev (Etap 2) z IoT/Robotics (Etap 3).

## 1. Architektura Slajdów (Oś Czasowa Wystąpienia: 8 min)

- **Slajd 1: Intro (0:00 - 0:30)** 
  - *Tytuł*: Primus Warehouse 2026 – Magazyn Zdolny Do Samojezdnej Refleksji
  - *Słowa Kluczowe*: Cyfrowy bliźniak (Digital Twin), Przemysł 4.0, Modułowość.
- **Slajd 2: Ewolucja z Etapu 2 (0:30 - 2:00)**
  - Omówienie, jak system PIM (zarządzania i kontroli asortymentem) i uwierzytelniania pracowniczego wzbogaciliśmy o fizykę. Zamiast tabelek w przeglądarce, mamy ruch fizyczny. Tabela staje się halą.
- **Slajd 3: Technologia Frontend (2:00 - 3:30) [Osoba A]**
  - **Reaktywność**: Dlaczego React w połączniu z Tailwind? (Brak lagów w odczycie z kamery, minimalizm, elegancja UI i responsywność u pracownika z tabletem na klatce magazynowej).
- **Slajd 4: Serce Przelotu, czyli Backend API (3:30 - 5:00) [Osoba B]**
  - **[PLACEHOLDER]**: Tu osoba B opisuje, jak złącze Serial Port w Pythonie pozwalało ugrać milisekundy do płynnej animacji, oraz jak budowane było odseparowane API mikrousług (G-code niezależny od algorytmu Szachów).
- **Slajd 5: Percepcja Maszyn i sztuczna Niezłomność (5:00 - 6:30) [Osoba C]**
  - **[PLACEHOLDER]**: Opowieść o trudach rozpoznawania QR z kamery USB (zniekształcenia kątowe) i dlatego o dodaniu detekcji klasycznego CV/YOLO dla piktogramów – Fallback w świecie AI!
- **Slajd 6: Demo i Pokaz Gry w Tic-Tac-Toe (6:30 - 8:00)**
  - Uruchomienie fizycznego rzędu maszyny, gra z człowiekiem – moment wizualnego WOW dla sędziów łączącego algorytm Minimax z kinematyką drukarki 3D.

---

## 2. Argumentacja Biznesowa (Pitching)

Największą trudnością tego systemu nie był odrębnie działający frontend ani nie odrębnie napisany mechanizm na sprzęt, lecz ich synergiczne, absolutnie **bezbłędne połączenie poprzez stabilny łącznik REST**. Taka komunikacja, połączona z redundancją sensorów (brak 1 QR-kodu? System przechodzi gładko do skanowania figur z pomocą sztucznych sieci graficznych i piktogramów) jest dowodem na **odporność projektowanego systemu na sytuacje wyjątkowe (Graceful Degradation)**.
Primus 26 nie boi się niepomyślnych warunków i błędu ludzkiego – z inwentaryzacją zygzaka wyeliminuje pomyłkę magazyniara. Umożliwia "Stacking" - piętrowanie 2-na-sobie w Z osi, optymalizując obszar 8x8 o +100%.

---

## 3. Anticipated Q&A z Jury (Szybka Siatka Odpowiedzi)

- **Q: W projekcie macie dedykowaną obsługę i AI, a sterujecie tym poprzez zwykły... protokół z drukarki 3D (Marlin w maszynie)?**
  - **Operator Frontendu**: Ponieważ protokół G-Code w maszynach CNC jest najszerzej zaimplementowanym i zbadanym protokołem komunikacyjnym precyzyjnego ruchu na Świecie. Budowanie kontrolera serwomotora od 0 to by było marnowanie koła na wynalazek. My zajęliśmy się wynalezieniem sterowania najwyższego poziomu (System ERP jako Mózg Ręki).
- **Q: Co się stało z awarią sieci / rozłączeniem laptopa na żywo?**
  - **Operator Frontendu**: Połączenie Reacta z Backendem sprawdza flagi. Oraz po ponownym odpaleniu wymagane jest kliknięcie fizyczne "HOME", re-kalibrując system "do zera". Maszyna zaparła by się na krancówkach mechanicznych nie łamiąc osi – więc system sam się chroni z podwójnym bezpieczeństwem.
- **Q: [Pole na pytanie dla Osoby B o algorytmy backendu]**
  - **Operator Backendu**: [TODO: Uzupełnić o sposób szybkiego ucinania Drzewa Przeszukiwań, bądź wielowątkowości w Pythonie].
- **Q: [Pole na pytanie dla Osoby C o dobór modelu CV AI]**
  - **Operator AI**: [TODO: Rozprawić o parametrach kompresji mjpeg stream, żeby przeglądarka pożerała mało pasma WIFI z kamerki].
