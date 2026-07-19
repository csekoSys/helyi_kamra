# **HelyiKamra \- Részletes Projektleírás és Specifikáció (Vibe Coding Alap)**

Ez a dokumentum a HelyiKamra platform fejlesztési útmutatója. Célja, hogy olyan részletességgel és struktúrával írja le a rendszert, amely alkalmas AI-alapú kódgenerálásra (vibe coding), minimalizálva a félreértéseket a **Next.js \+ Supabase** (Fullstack) implementáció során. Fő fókusz a kistermelők és a tudatos vásárlók összekötése a lehető legegyszerűbb felhasználói élménnyel.

## **1\. Technológiai Stack és Architektúra**

* **Teljes Keretrendszer (Fullstack):** Next.js 14+ (React, App Router, TypeScript)  
  * *Backend logika:* Next.js Server Actions (Közvetlen és biztonságos kommunikáció az adatbázissal).  
  * *Űrlapkezelés és Validáció:* react-hook-form \+ zod (Kötelező a shadcn/ui űrlapokhoz).  
  * *UI/Stílus:* Tailwind CSS \+ shadcn/ui (Mobile-first megközelítéssel).  
  * *Térkép integráció:* Leaflet.js (vagy React-Leaflet).  
* **BaaS (Backend as a Service):** Supabase  
  * *Adatbázis:* PostgreSQL \+ PostGIS kiterjesztés. (A távolságalapú kereséseket Supabase RPC \- Remote Procedure Call \- függvényekkel végezzük).  
  * *Adatbiztonság:* RLS (Row Level Security).  
  * *Hitelesítés (Auth):* Supabase Auth (E-mailes bejelentkezés).  
  * *Fájltárolás:* Supabase Storage. (Két fix bucket: avatars a profilképeknek, product\_images a termékfotóknak).  
* **Hosztolás (Hosting):** Vercel (Frontend futtatása).

## **2\. Felhasználói Szerepkörök és Üzleti Modell**

1. **Vevő (Buyer):**  
   * Térképes és listás keresés helyszín és egyszerű kategóriák alapján.  
   * Közvetlen kapcsolatfelvétel a termelővel (beépített belső üzenet / foglalási űrlap).  
   * Kedvencek mentése.  
2. **Termelő (Producer):**  
   * Profil és elérhetőségek kezelése (szabályozható publikus/rejtett adatokkal).  
   * Termékek felöltése (Egyszerű "Kapható / Nem kapható" kapcsolóval).  
   * **Üzleti modell (Freemium):** Az alap fiók ingyenes (max. 20 aktív termékig). 20 termék felett havidíjas/éves előfizetés szükséges.  
3. **Hirdető / Szolgáltató:**  
   * Külső cégek, akik fizetnek a megjelenésért (bannerek, szponzorált PR cikkek).  
4. **Adminisztrátor:**  
   * Felhasználók moderálása, hirdetések, cikkek és kategóriák kezelése. Piacok központi felvitele.

## **3\. Funkcionális Követelmények (MVP fókusz)**

*A letisztult, indulásra kész verzió funkciói.*

### **3.1. Regisztráció és Hitelesítés**

* E-mailes regisztráció (Supabase Auth segítségével).  
* E-mail megerősítés után azonnali aktiválódás. Adminisztrátori utómoderáció az éles megjelenéshez.  
* **Fontos:** A frontend csak az auth.users táblába regisztrál. A profiles és buyer\_profiles táblákba a rekordokat egy Supabase SQL Trigger (handle\_new\_user) hozza létre automatikusan\!

### **3.2. Szuper-egyszerű Termelői Vezérlőpult (Dashboard)**

Kizárólag 4 fő menüpont a maximális egyszerűségért, mobile-first nézettel:

1. **Termékeim:** Lista a termékekről (név, ár, fix mértékegység, fotó, címkék pl. "Bio", "Szedd magad"). Egykattintásos "Aktív/Inaktív" kapcsoló. Nincs készletkezelés.  
2. **Helyszíneim / Elérhetőség:**  
   * Fix telephely megadása (GPS vagy cím alapján).  
   * Csatlakozás Admin által felvett piacokhoz.  
   * Kiszállítási zóna (Egyszerű sugaras megadás: pl. 20 km, vagy szöveges megadás).  
3. **Üzeneteim:** Belső üzenőfal a vevők e-mailjeinek/foglalásainak fogadására.  
4. **Profil Beállítások:** Adatvédelem kezelése (Mi legyen publikus, mihez kelljen regisztráció).

### **3.3. Keresés és Térkép (Vevői oldal)**

* Automatikus geolokáció (ha a mobil engedi), vagy irányítószám/város alapú keresés.  
* A PostGIS lekérdezéseket (távolság kiszámítása és rendezés) a frontendről egy Supabase RPC (tárolt eljárás) meghívásával kell végezni, nem a kliens oldalon kalkulálni.  
* Fix, egyszerű fő kategóriák szűrése (pl. Zöldség, Gyümölcs).

### **3.4. Kapcsolatfelvétel és Értesítések**

* A vevő belső üzenetet küldhet.  
* A rendszer kizárólag e-mail értesítést küld az érintetteknek ("Új üzeneted érkezett..."), a tartalom elolvasásához be kell lépni az appba.

### **3.5. Tartalom és Hirdetések (Bevételi forrás)**

* Egyszerű Blog modul (Admin felületről kezelhető) SEO és PR cikkek számára.  
* Reklámhelyek/bannerek kezelése a platformon.

### **3.6. Jövőbeli (Későbbi) Funkciók \- *Jelenleg NE kódoljuk\!***

* Digitális Permetezési és Gyógyszerezési Napló.  
* Kosár és Online fizetés.  
* Push értesítések mobilappba.

## **4\. Adatbázis Modell (ERD) \- Supabase RLS fókusszal**

\[auth.users\] (Supabase gyári tábla: id, email, created\_at)  
  |  
  \+---\> \[profiles\] (id UUID PK refs auth.users, role (buyer/producer/admin), is\_approved\_by\_admin)  
            |  
            \+---\> \[buyer\_profiles\] (id PK refs profiles, name, phone)  
            |  
            \+---\> \[producer\_profiles\] (id PK refs profiles, farm\_name, bio, phone, is\_phone\_public, subscription\_tier)  
                      |  
                      \+---\> \[products\] (id, producer\_id, name, description, price, unit, category\_id, is\_active, image\_url, tags)  
                      |  
                      \+---\> \[producer\_locations\] (id, producer\_id, location\_type, address, location (PostGIS Point), radius\_km, delivery\_text, schedule\_info)  
  |  
  \+---\> \[message\_threads\] (id, buyer\_id, producer\_id, created\_at)  
            |  
            \+---\> \[messages\] (id, thread\_id, sender\_id, content, created\_at, is\_read)

\[categories\] (id, name, icon\_name) // Admin kezeli  
\[markets\] (id, name, address, location (PostGIS Point), schedule) // Admin kezeli  
\[blog\_posts\] (id, title, content, is\_sponsored, created\_at)

## **5\. Szigorú Fejlesztési Irányelvek (AI / Vibe Coding számára)**

Ezek a szabályok **KÖTELEZŐEK** a Next.js kód generálásakor, hogy elkerüljük a technikai adósságot és a biztonsági réseket.

1. **Adatmutációk és Lekérdezések:**  
   * **Tilos** a /app/api mappában API végpontokat írni (kivéve webhooks).  
   * **Kötelező** a Next.js Server Actions használata minden adatbázis-módosításhoz (Insert/Update/Delete). Az action-öket egy dedikált src/app/actions mappában kell tárolni.  
2. **Űrlapok (Forms):**  
   * Soha ne használj sima HTML űrlapkezelést. Minden űrlapot a react-hook-form és a @hookform/resolvers/zod csomagokkal kell megvalósítani, szigorú Zod sémákkal validálva. A UI-hoz használd a shadcn/ui Form komponensét.  
3. **Profil Létrehozás (Auth Flow):**  
   * A frontend regisztrációs kódjában **NE** írj logikát a profiles vagy buyer\_profiles táblák feltöltésére. A Supabase-ben már be van állítva egy adatbázis-trigger, ami minden új auth.users regisztrációnál automatikusan létrehozza a kapcsolódó profilokat. Csak a standard supabase.auth.signUp() metódust hívd meg.  
4. **Kliens-Szerver Határ:**  
   * Használj "use client" direktívát, de csak a leaf-szintű komponenseknél (ahol React hookok, Leaflet térkép, vagy onClick eventek vannak). A page.tsx fájloknak Server Componentként kell futniuk.  
5. **Fájlfeltöltés (Storage):**  
   * A képek feltöltésekor a Supabase Storage SDK-t használd közvetlenül a kliensről vagy Server Action-ből. A hivatkozott bucket nevek pontosan így szerepeljenek a kódban: 'avatars' és 'product\_images'.  
6. **Reszponzivitás (Mobile-first):**  
   * A felületet úgy építsd fel, hogy mobilon tökéletesen használható legyen. A térképek és a táblázatok kezelésénél kiemelten figyelj a kis kijelzőkre (Tailwind md:, lg: breakpointok használata).