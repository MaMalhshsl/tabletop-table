# Tabletop Table

Ein webbasiertes Tabletop-Spiel, entwickelt im Rahmen des Softwareprojekts an der Hochschule Hamm-Lippstadt.

Das Projekt basiert auf React und Vite und bildet ein digitales Spielfeld mit Hintergründen, Icons und interaktiven Komponenten ab.

## Technologien ##

- React
- Vite
- JavaScript (ES6+)
- CSS

## Technischer Fokus ##

Neben der UI-Architektur lag ein Schwerpunkt auf der Integration von 
Marker-basierter Objekterkennung (Aruco).

Ziel war es, ein hybrides Tabletop-System zu entwickeln, das visuelle Marker 
zur räumlichen Referenzierung nutzt.

## Projektstruktur ##

components/      → Wiederverwendbare UI-Komponenten  
hooks/           → Custom React Hooks  
utils/           → Hilfsfunktionen  
data/            → Spiel- oder Konfigurationsdaten  
public/          → Statische Assets (Bilder, Icons)  
App.jsx          → Hauptkomponente  
main.jsx         → Einstiegspunkt  
vite.config.js   → Vite-Konfiguration  

node_modules/ und dist/ sind bewusst nicht versioniert.

## Installation & Start ##

### 1. Repository klonen ###

git clone https://github.com/MaMalhshsl/tabletop-table.git

cd tabletop-table

### 2. Abhängigkeiten installieren ###

npm install

### 3. Entwicklungsserver starten ###

npm run dev

Das Projekt läuft anschließend standardmäßig unter:
http://localhost:5173

## Build für Produktion ##

npm run build
Der Build-Output wird im Ordner `dist/` erzeugt.

## Marker-Erkennung (Aruco) ##

Zur Positions- und Objekterkennung wird Aruco Marker Tracking verwendet.

Im Projekt wurde zunächst ohne Marker-Erkennung experimentiert. 
Da dies in der Praxis nicht stabil funktionierte, wurde testweise auf Aruco Image Marker umgestellt, um eine zuverlässige visuelle Referenz im Raum zu gewährleisten.

Die Marker dienen als Referenzpunkte für:
- Spielfeldpositionierung
- Objekt-Tracking
- Interaktionslogik

Dies erweitert das Projekt um einen experimentellen Computer-Vision-Aspekt.

## Kontext ##

Dieses Projekt wurde im Rahmen des Moduls *Softwareprojekt* an der HSHL Lippstadt entwickelt.  
Ziel war die Umsetzung einer interaktiven webbasierten Anwendung mit strukturierter Komponentenarchitektur.
