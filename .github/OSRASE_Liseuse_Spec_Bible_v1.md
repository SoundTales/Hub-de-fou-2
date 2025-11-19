# OSRASE · Liseuse — Spécification Fonctionnelle & UI (Bible)
**Version**: v1.0 · **Date**: 2025-10-19 (Europe/Paris)
**Auteur**: Jo × Assistant
**Portée**: Cette spécification prévaut sur le code existant. Elle est destinée à guider GPT‑5 / GPT‑5 Codex / Copilot pour modifier et créer l’implémentation.

---
ù
## 0) Principes directeurs
- **Palette stricte (4 couleurs uniquement)**: `#FEFFF4` (ivoire), `#424242` (gris foncé), `#FFFF80` (accent jaune), `#000000` (noir).
- **Thèmes**: *Jour* (fond `#FEFFF4`, texte chapitre `#424242`) · *Nuit* (fond `#424242`, texte chapitre `#FEFFF4`).
- **Typographies**:
  - **Titres & corps par défaut**: **Playfair Display** (400, 600, 700).
  - **Alternative via “Aa”**: **EB Garamond** (400, 600; fallback 700 si 600 indisponible).
  - **Numéros** (chapitres, compteurs, pastilles): **Libre Baskerville** (700).
- **Accessibilité & UX**:
  - Effets sobres, lisibles sur mobile et desktop.
  - Anneau de focus clavier (3 px) pour tous les boutons (B+C validé).
  - Rien ne doit chevaucher la zone de texte du chapitre.
  - Respect des *safe areas* (encoches, caméras dans l’écran).

---

## 1) Top‑bar & Contrôles de texte
### 1.1 Grande pilule segmentée (en haut à droite)
- **Segments** (de gauche à droite): **B** (gras), **A+** (taille +2 px), **Aa** (Playfair ↔ Garamond).
- **Forme & taille**: se caler aux maquettes (réf. ~44 px de hauteur mobile, ~52 px tablette/desktop; coins = rayon moitié).
- **Séparateurs**: 1 px avec opacité 30% (Jour: `#000000`·30%; Nuit: `#FEFFF4`·30%).
- **États**:
  - **Normal (Jour)**: fond `#424242`, texte `#FEFFF4`.
  - **Actif (Jour)**: fond `#FFFF80`, texte `#000000`.
  - **Normal (Nuit)**: fond `#FEFFF4`, texte `#424242`.
  - **Actif (Nuit)**: fond `#000000`, texte `#FEFFF4`.
  - **Tous segments actifs** ⇒ **toute la pilule en accent** + séparateurs visibles.
- **Feedback press**: micro‑scale **0.98** + transition de couleur (100 ms).
- **Focus clavier**: anneau 3 px (Jour `#FFFF80`, Nuit `#000000`).

### 1.2 Bouton “Lune” (toggle thème jour/nuit)
- **Position**: sous la pilule, **aligné sur le bord droit de la pilule** (même axe X).
- **Forme & taille**: comme les maquettes (réf. 44/52 px).
- **Icônes**: `/public/mode-jour.svg` (en jour) · `/public/mode-nuit.svg` (en nuit).
- **Couleurs**: Jour (fond `#424242`, icône `#FEFFF4`) · Nuit (fond `#FEFFF4`, icône `#424242`).
- **Persistant**: mémorisation globale (localStorage).
- **Thème initial**: suit le thème système (fallback jour).

### 1.3 Signet (bookmark)
- **Emplacement**: **à gauche de la grande pilule**, avec le **même espacement** que la pilule et le bouton lune.
- **Taille**: identique à la hauteur de la pilule.
- **Style**:
  - **Jour**: inactif = **contour `#424242`**, rempli **transparent**; actif = **contour + remplissage `#000000`**.
  - **Nuit**: inactif = **contour `#FEFFF4`**, rempli **transparent**; actif = **contour + remplissage `#FFFF80`**.
- **Fonction**: sauvegarde **snapshot** complet du chapitre au bloc courant: position de lecture, dialogues déjà cliqués, état audio (boucle en cours/position + triggers). Réouverture via signet → on restaure cet état.
ù
---
ù
## 2) Zone de lecture (chapitre)
### 2.1 Typo & mesure
- **Mobile (portrait)**: corps **18 px** (A+ ⇒ **20 px**), **line‑height 1.6**, 38–45ch perçus.
- **Desktop/Tab**: corps **20 px** (A+ ⇒ **22 px**), **line‑height 1.6**, **colonne max 64ch**.
- **Letter‑spacing**: corps **0**; titres Playfair léger **-0.005em** si besoin.
- **Gras (B)**: Playfair **600**; Garamond **600** (fallback 700); `font-synthesis: none`.

### 2.2 Entête chapitre
- **H1**: centré, **CAPITALES** (Playfair 700), (réf. ~28 px mobile / ~36 px desktop si besoin).
- **Compteur** (ex. “1/21”): centré sous le H1 (Baskerville), (réf. ~14/16 px).
- **Toujours visibles**, même quand l’UI est masquée (ils font partie du contenu).

### 2.3 Indicateurs de dialogue (gauche de la colonne)
- **États & couleurs**:
  - **Jour — non cliqué**: `#000000` (plein).
  - **Jour — cliqué**: `#424242` à **50%** d’opacité.
  - **Nuit — non cliqué**: `#FFFF80`.
  - **Nuit — cliqué**: `#FEFFF4` à **50%** d’opacité.
- **Lecture en cours** (dialogue): **accent** sur **texte/icône** avec fondu sur la durée:
  - **Jour**: `#000000` → retour vers l’état “cliqué” en fin de lecture.
  - **Nuit**: `#FFFF80` → retour vers l’état “cliqué”.
- **Tap** sur un dialogue en cours = **pause / reprise**.

### 2.4 Barre de progression (lecture globale)
- **Position**: **fine barre** sous la colonne de texte (juste au‑dessus du dock).
- **Visibilité**: **seulement quand l’UI est affichée**.
- **Style**: hauteur 2 px (mobile) / 3 px (desktop); **track** 20% d’opacité (Jour `#000000` / Nuit `#FEFFF4`), **remplissage** `#FFFF80`.
- **Non interactive**.
ù
---
ù
## 3) Navigation (dock flottant bas)
- **Dock**: **flottant** (pas de rail plein), rangée de **pilules** (labels/numéro), **Home** = icône SVG du dossier `public`.
- **Ordre (gauche → droite)**: **Précédent · Marque‑page · Home · Chapitrage · Suivant**.
- **Précédent/Suivant**: **boutons ronds** Ø **44 px** (mobile) / **52 px** (desktop) avec **chiffre arabe** (Baskerville) en **plein**.
- **Couleurs des pilules (texte/icone)**:
  - **Jour — normal**: **texte `#FEFFF4` / fond `#424242`**.
  - **Jour — actif**: **texte `#000000` / fond `#FFFF80`**.
  - **Nuit — normal**: **texte `#424242` / fond `#FEFFF4`**.
  - **Nuit — actif**: **texte `#FEFFF4` / fond `#000000`**.
- **États bords**: premier/dernier chapitre = **grisé** (opacité 40%, inactif).
  - **Exception**: au **dernier chapitre**, **Suivant** devient **cercle étoile** ⭐ (fond selon mapping; étoile `#FFFF80` si fond `#424242`, étoile `#000000` si fond `#FEFFF4`) menant à la **page de notation**.
- **Logos**: Home utilise `logo-clair.svg` (jour) / `logo-sombre.svg` (nuit).
ù
---
ù
## 4) Carrousels (Marque‑page & Chapitrage)
- **Ouverture**: via le bouton associé (dock). **Se ferment** en retap sur le bouton ou **tap sur fond** (hors zones). 
- **Recouvrement**: **au‑dessus** des potards; potards **masqués** quand un carrousel est ouvert.
- **Fonds**: **Jour** = `#424242` ; **Nuit** = `#FEFFF4`.
- **Cartes**:
  - **Format image**: **16:9**.
  - **Coins image & carte**: **16 px**.
  - **Pastille numéro**: en haut de l’image, centrée (style hub). 
    - **Jour**: pastille fond `#FEFFF4`, texte `#424242`, contour `#000000` (1 px, 30%).
    - **Nuit**: pastille fond `#424242`, texte `#FEFFF4`.
  - **Titre**: Playfair; **Jour** (fond carrousel `#424242`) = `#FEFFF4`; **Nuit** (fond `#FEFFF4`) = `#424242`.
- **Nombre visible**: **2 cartes** en portrait; **3 cartes** en paysage/desktop (cartes **pleines**).
- **Gouttière**: **16 px** (portrait), **20 px** (paysage/desktop).
- **Scroll**: **drag + scroll‑snap**, pas de “peek”.
- **Flèches**: oui; **masquées au début/fin** (fade rapide). Clic = **saut** de 2/3 cartes selon viewport.
ù
---
ù
## 5) Potards volume (entre fin du texte et dock)
- **Position**: rangée **au-dessus** du dock (UI affichée), **masqués** si carrousel ouvert.
- **Deux potards**: **Ambiance** (gauche) · **Dialogues** (droite).
- **Taille**: Ø **44 px** (mobile) / **52 px** (desktop) — même que les cercles chapitre.
- **Style**: **anneau + arc de remplissage** (jauge circulaire).
  - **Jour**: track `#000000` 30%, arc `#FFFF80`, % `#000000`.
  - **Nuit**: track `#FEFFF4` 30%, arc `#FFFF80`, % `#FEFFF4`.
- **% affiché**: **sous** le cercle (centré).
- **Gestes**: glisser **vertical** sur le potard uniquement modifie le volume (pas d’UI).
  - Point de départ = **valeur courante**; précision **1%**; 0–100% réalisable sur un seul swipe.
  - **Tap** icône = **mute/unmute** (0% ↔ dernière valeur).
- **Defaults (1re visite)**: Ambiance **50%**, Dialogues **60%**. **Persistant** global.
ù
---
ù
## 6) Gestes & Animations
### 6.1 Apparition/disparition UI (swipe vertical)
- **Ouverture**: **vague de fondu par masque du bas vers le haut**, éléments d’une même rangée **en même temps**.
- **Fermeture**: **vague inverse** (haut → bas).
- **Temps & easing**: **220 ms (ease‑out)** à l’ouverture · **160 ms (ease‑in)** à la fermeture.
- **Auto‑hide**: **jamais**.

### 6.2 Navigation chapitre (swipe horizontal)
- **Sens**: **droite ⇒ précédent**, **gauche ⇒ suivant** (logique “livre”).
- **Détection “soft”**:
  - Lock direction: **10 px**; horizontal si `|dx| ≥ 1.1×|dy|`.
  - Déclenchement: **|dx| ≥ 48 px** (mobile) · **60 px** (tab/desktop) **ou** **|vx| ≥ 500 px/s**.
  - Validation: passer si **≥ 28%** de largeur **ou** **vx ≥ 650 px/s**, sinon **snap back**.
- **Animation**: **suivie au doigt** (fade **gauche↔droite** sans déplacement visuel).
- **Audio**: validation ⇒ préparation audio; adjacence ⇒ **0 ms**; non‑adjacente ⇒ **crossfade 200 ms equal‑power**.

### 6.3 Dialogues (tap & long‑press)
- **Tap**: lecture du dialogue; re‑tap = **pause/reprise** si lecture en cours.
- **Lecture**: texte/icône en **accent** (Jour `#000000`, Nuit `#FFFF80`) puis **fondu** vers “cliqué”.
- **Long‑press (≥450 ms)**: bulle **Partager**: **Ouvrir dans TikTok** (si `tiktokUrl`) + **Télécharger .mp3**; sinon TikTok **grisé**.

### 6.4 Intro chapitre (écran 3 s, skippable ≥ 1 s si préchargé)
- **Ordre**: **fond uni** → **image** → **titre + pastille** → **fade‑out** global.
- **Durées**: 200 / +150→500 / +150→450 / **pause 1200** / 350 ms (ease‑out/ease‑in).
- **Thème**: couleurs selon **thème courant**.
ù
---
ù
## 7) Audio (Ambiance/Thème & Dialogues)
- **Ambiance/Thème**: **boucles** par **page**; précharge suivante; **0 ms** gapless adjacente; **200 ms equal‑power** si non‑adjacente.
- **Dialogues**: one‑shot; indépendants; état visuel géré (cf. 2.3).
ù
---
ù
## 8) Carrousels — Données & Chargement
- **Images**: dynamiques (comme le hub): image, numéro, titre.
- **Chapitrage**: tous les chapitres; **Marque‑page**: chapitres signetés (avec progression).
- **Commutation**: cliquer Marque‑page quand Chapitrage est ouvert **remplace le contenu** (ne ferme pas).
ù
---
ù
## 9) Persistance (global)
- Thème, Aa, B, A+, volumes, états UI, signets (snapshots), progression chapitre (compteur + page), dialogues cliqués, état audio (boucle), préférences de gestes.
- **Stockage**: localStorage (namespace `st:*`).
ù
---

## 10) Mappings couleur récap
- **Boutons Jour (normal/actif)**: `#424242` / `#FFFF80` (texte `#FEFFF4` / `#000000`).
- **Boutons Nuit (normal/actif)**: `#FEFFF4` / `#000000` (texte `#424242` / `#FEFFF4`).
- **Carrousel**: Jour fond `#424242` ; Nuit fond `#FEFFF4`.
- **Indicateur de dialogue** & **Potards**: voir sections dédiées.

---

## 11) Intégration & Fichiers cibles (repo actuel)
- **styles.css** — tokens & règles (thèmes, pilules, dock, carrousels, potards, animations).
- **ReaderShell.jsx** — états thème, UI show/hide, top‑bar, lune, signet, dock.
- **PageViewport.jsx** — dialogues (états/lecture), swipe horizontal, progression, intro 3s.
- **Quickbar.jsx** — cohérence hub.
- **Gate.jsx** / composants carrousel — gabarits, flèches, scroll‑snap, fonds.
- **AudioEngine.js** — boucles gapless, précharge, crossfade 200 ms, dialogues one‑shot.

---

## 12) Tokens CSS (exemple)
```css
:root {
  --st-bg-day:#FEFFF4; --st-bg-night:#424242;
  --st-ink-day:#424242; --st-ink-night:#FEFFF4;
  --st-accent:#FFFF80; --st-black:#000000;
  --st-radius-16:16px; --st-h1-ls:-0.005em; --st-lh:1.6;
}
.reader[data-theme="day"]{background:var(--st-bg-day);color:var(--st-ink-day);} 
.reader[data-theme="night"]{background:var(--st-bg-night);color:var(--st-ink-night);} 
.reader[data-ui="shown"] .ui{opacity:1} 
.reader[data-ui="hidden"] .ui{opacity:0} 
```

---

## 13) Gestuelle — Seuils (mémo)
```
Lock direction: 10 px; horizontal si |dx| >= 1.1*|dy|.
Swipe horizontal: déclenchement 48 px (mobile) / 60 px (tab/desktop) ou vx >= 500 px/s;
validation à 28% largeur ou vx >= 650 px/s; suivi au doigt; annulation = snap back.
Swipe vertical UI: vague masque (bas→haut à l’ouverture, haut→bas à la fermeture),
220 ms ease-out / 160 ms ease-in; jamais auto-hide.
Potards: glissé vertical seul; zone tolérance 8 px; lock 12 px; 0–100% sur un swipe.
```

---

## 14) Écran d’intro (3 s)
- Fond 200 ms (ease-out) → Image +150 ms (fade-in 500 ms) → Titre+pastille +150 ms (fade-in 450 ms) → Pause 1200 ms → Fade-out 350 ms (ease-in).
- Skippable par **tap** **après 1 s**, **si** préchargement terminé (chapitre + liseuse).
- Thème selon préférence/système.

---

## 15) Partage TikTok & MP3 (long‑press)
- Données par dialogue: `tiktokUrl` (prioritaire) **OU** `tiktokSoundId` (fallback); sinon bouton TikTok **grisé**.
- Action: ouvrir l’URL du **son** TikTok (universal link vers l’app si installée) + **Télécharger .mp3**.

---

## 16) Prochaines étapes
- Page **notation** (post-dernier chapitre, bouton Suivant ⭐).
- Pages **paiement**, **hub** (aligner styles, réutiliser carrousels).
- Ajuster **safe‑areas** après tests devices.
- Exporter **design tokens** en JSON pour outillage GPT‑5/Codex/Copilot.
