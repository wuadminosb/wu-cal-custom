# Room type icons

Neutrale, lokale SVG-Platzhalter für Räume, für die kein verifiziertes raumspezifisches Foto verfügbar ist.

## Dateien

- `seminarraum.svg` – neutrales Symbolbild für Seminarräume.
- `hoersaal.svg` – neutrales Symbolbild für Hörsäle.
- `besprechungsraum.svg` – neutrales Symbolbild für Besprechungsräume.

## Resolver-Regel

Die Summary soll Bilder in dieser Reihenfolge auflösen:

1. Bild aus dem aktuellen Momentus-DOM
2. exakte, verifizierte Raum-ID-Zuordnung
3. neutrales Raumtyp-SVG aus diesem Verzeichnis
4. neutraler CSS-Placeholder

Ein Raumtyp-SVG darf niemals als Foto des konkreten Raums bezeichnet werden.
