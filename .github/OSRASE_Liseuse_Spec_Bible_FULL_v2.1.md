# OSRASE · Liseuse — Spécification Fonctionnelle & UI (Bible)
**Version**: v2.1 (FULL) · **Date**: 2025-10-27 · **Zone**: Europe/Paris  
**Auteur**: Jo × Assistant  · **Stack**: Vite + React (Web, non-native)

> Cette Bible prévaut sur tout code existant. Elle consolide l’ensemble des décisions validées.
> Palette restreinte, UX gestes, audio, paywall 9,99 €, passe 60 min (minutes affichées), auth avant paiement, rating/partage, sécurité, desktop/mobile.

---

## 0) Principes & Contraintes
- **Plateforme**: Web (navigateur), non app native.  
- **Framework**: Vite + React.  
- **Performances**: chargements progressifs (pages/sons), pré-chargement raisonné, animations < 260 ms.  
- **Accessibilité**: focus visible, ARIA, contrastes AA, safe-area (notches).  
- **Aucune copie de texte** dans la liseuse (sélection désactivée).  
- **JSON Chapitre**: segmenté (pages, dialogues, triggers audio), jamais tout d’un bloc.

---

## 1) Thèmes, Couleurs, Typo
### 1.1 Palette (jour & nuit)
- Couleurs autorisées: `#FEFFF4` · `#424242` · `#FFFF80` · `#000000`
- Jour: fond `#FEFFF4`, texte chap. `#424242`
- Nuit: fond `#424242`, texte chap. `#FEFFF4`

### 1.2 États UI (exemples clés)
- Boutons navigation & overlay  
  - Jour: normal `#424242`, **actif** `#FFFF80`  
  - Nuit: normal `#FEFFF4`, **actif** `#000000`
- Indicateur de dialogue (icône + barre verticale)  
  - Jour: **non cliqué** `#000000`; **cliqué** `#424242` @ 50%  
  - Nuit: **non cliqué** `#FFFF80`; **cliqué** `#FEFFF4` @ 50%

### 1.3 Typographies
- Corps prioritaire: **Playfair Display**  
- Alternance via “Aa”: **Garamond** ↔ **Playfair** (toggle)  
- Numéros/pastilles: **Baskerville** (préload + swap)  
- Graisse “B”: bascule bold du corps (toggle)

---

## 2) Layout & Marges
- Objectif: sensation livre papier, texte **justifié**, **centré** dans une **zone dédiée**.  
- Aucune UI ne doit **chevaucher** la zone de texte.  
- Marges: maximiser l’aire de lecture tout en laissant **respirer** les boutons; bords & UI à **égale distance** de la zone de texte.  
- Safe-area mobile (notch/caméra): interdiction d’afficher du contenu masqué.

---

## 3) Navigation & Gestes
### 3.1 Appels overlay
- **Swipe ↑**: affiche l’overlay  
- **Swipe ↓**: masque l’overlay  
- Overlay laisse la lecture visible; pas de recouvrement du corps.

### 3.2 Pages (comme un livre)
- **Swipe →**: page **précédente** · **Swipe ←**: page **suivante**  
- Seuils **tolérants**, animation **progressive** liée au geste; rollback fluide si annulation.  
- Animation page: **fondu par masque latéral** (gauche/droite) sans translation.

### 3.3 Desktop (souris & clavier)
- **Clic droit**: page suivante · **Clic gauche**: page précédente (*si overlay ouvert: clic agit d’abord sur l’UI*)  
- **Molette haut**: ouvrir overlay · **Molette bas**: fermer overlay  
- **Espace**: lecture/pause dialogues + **enchaînement automatique** du bloc.

---

## 4) Overlay & Dock
### 4.1 Apparition/Disparition
- Effet: **fondu masqué vertical** (bottom→top à l’ouverture; top→bottom à la fermeture).  
- Placement constant (pas de slide de position).  
- Durées: ouverture **~220 ms**, fermeture **~180 ms**.

### 4.2 Dock de navigation (flottant, pilule avec séparateurs)
- De gauche à droite: **Chapitre précédent** (cercle numéroté **arabes** / ★ si page notation), **Marque-page** (carrousel), **Chapitrage** (carrousel), **Home** (logo clair/sombre), **Chapitre suivant** (cercle / ★).  
- États: actifs selon palette §1.2.  
- Tailles: conformes POCs (base tablette verticale) avec adaptations responsive.

### 4.3 Boutons texte & mode (top)
- À gauche: **Fullscreen**, **Aa**, **B**, **A+**.  
- À droite: potards déplacés (cf. §5).  
- Bouton Jour/Nuit: pilule; icône (`mode-jour.svg` / `mode-nuit.svg`) **sous la pilule**, bord droit aligné.

### 4.4 Signet (bookmark) — icône autonome
- Sauvegarde **unique**: page, dialogues cliqués, position audio (boucle), triggers, mode.  
- Placement: **à gauche de la pilule** texte, même espacement que pilule ↔ bouton jour/nuit; pas lié au `<h1>`.  
- États visuels:  
  - Jour: inactif **contour `#424242`** + remplissage **transparent**; actif **contour+remplissage `#000000`**  
  - Nuit: inactif **contour `#FEFFF4`** + transparent; actif **contour+remplissage `#FFFF80`**
- Feedback: **pop** + remplissage + **flash miroir**; toast “Signet enregistré”.  
- Désactivation: supprime l’ancien snapshot; réactivation = nouveau.

---

## 5) Volume (potards)
- Emplacement: **entre** la fin de la zone texte et le **dock**; **cachés** quand un carrousel est ouvert.  
- Deux potards: **Ambiance/Thème** (gauche) · **Dialogues** (droite).  
- Diamètre: **identique** aux cercles chapitres.  
- Libellés: icône au-dessus, **%** en dessous.  
- Gestes: drag vertical (depuis valeur courante), **précision 1%**, de 0→100% en **un swipe**.  
- Tap: **mute/unmute** (0% ↔ valeur précédente). Defaults: Ambiance **50%**, Dialogues **60%**.  
- Live: le volume n’interrompt jamais un audio.

---

## 6) Chapitres, Pages & Progression
- JSON chapitres: **découpé par pages**; **pas d’images** dans le texte.  
- **A+ / B / Aa**: ne débordent jamais la zone de texte ni sous l’overlay.  
- **Césure**: **désactivée** (pas de mots coupés).  
- **Barre de progression**: **barre seule**, pages dans le chapitre (emplacement POCs).  
- Fin de chapitre (non dernier): swipe vers suivant = **enchaîne le chapitre suivant** en douceur.  
- Transition inter-chapitre: cf. §8.

---

## 7) Carrousels (Signets & Chapitrage)
- Affichage: **2 cartes** (mobile/tablette vertical), **3 cartes** (desktop/horizontal).  
- Ratio **16:9**, coins **16 px**, design du hub (pastille numéro, titre, image).  
- Fons carrousel: Jour `#424242`, Nuit `#FEFFF4`. Pastilles conformes thème.  
- Ouverture: via bouton; tap hors cartes **ferme**; switch contenu sans fermer.  
- Flèches contextuelles avec **fade**; scroll **par “page”** (2 ou 3 cartes).

---

## 8) Interstitiel Chapitre (intro)
- Déclenchement: **première ouverture** du chapitre dans la **session** (depuis hub ou chapitre suivant non visité).  
- Thème: couleurs selon **jour/nuit**.  
- Ordre: fond uni → **image** (milieu haut) → **titre + pastille** (milieu bas).  
- Durée: **3 s**. **Tap pour passer** après **1 s** (si préchargé).  
- **Reprendre** (progression existante) : **pas** d’interstitiel.

---

## 9) Dialogues (audio & UI)
- Tap sur bloc **dialogue** → joue le son; fin automatique.  
- **Bloc de dialogues consécutifs**: **enchaînement auto** sans geste.  
- **Pause/Reprise**: **tap** sur le dialogue en cours.  
- **Accent visuel**: au tap, **accent** (Jour `#FFFF80` / Nuit `#000000`) puis **fondu** vers couleur de base **jusqu’à la fin**.  
- **Indicateur** (icône+barre gauche): états §1.2; en **erreur réseau**: reste *non cliqué*; en **fichier manquant**: marqué *cliqué* + toast.

---

## 10) Audio Ambiance (boucles) & Triggers
- Entrée chapitre: **boucle** qui tourne jusqu’à trigger.  
- À l’arrivée page: **attendre fin** de boucle puis **enchaîner la suivante** (linéaire, **préchargée**).  
- Transitions:  
  - Navigation normale: **0 ms**, **sans cross-fade**.  
  - Sauts rapides (plusieurs triggers): **cross-fade moyen** vers la cible (idem en arrière).

---

## 11) Haptique (mobiles)
- **Opt-in** proposé **une seule fois** (premier clic Lire, premier clic chapitre ou play Quickbar).  
- **Préférence persistée**; réversible via **Préférences**.  
- Cas: ouverture chapitre (tap subtil), confirmation signet, achat validé (tap paiement), arrivée page de notation, *(signature plus tard)*.

---

## 12) Tutoriels UX (première session)
- **Gestes**: “Swipe ↑ — Overlay”, “Swipe ↓ — Fermer”.  
- **Dialogue**: “Appuie pour écouter • Appui long: partager sur TikTok”.  
- **Desktop**: tooltips (clic gauche/droit, molette, Espace).

---

## 13) Paywall (MVP)
- **Modèle unique**: **Achat 9,99 €** (accès à vie). **Pas de promo**.  
- **CTA principal**: **Débloquer la suite — 9,99 €**.  
- **Sous-texte**: **“Accède à tout le tale, jusqu’à la révélation.”**  
- **CTA secondaire**: **Payer avec PayPal**.  
- **Option**: **Partager et avancer** (si éligible) — “**Obtiens 60 min d’accès intégral.**”

### 13.1 Passe 60 min (essai)
- Temps **réel serveur**: **60 minutes**.  
- **Affichage**: **minutes uniquement** (pilule top-center; MAJ toutes **60 s**).  
- **Non anxiogène**: pas de secondes, pas de rouge; toast T–5 “Plus que 5 min”.  
- **Expiration**: **finir la page** (et réplique) puis paywall à l’avance suivante.  
- **Bandeau** au paywall: “**Ton passe de 60 min est terminé.**”  
- **Unique**: **1× par utilisateur × Tale**; après usage → **cacher** le bouton “Partager et avancer”.

---

## 14) Auth & Compte (obligatoire avant paiement)
- Avant tout paiement/passe: **connexion/création requise**.  
- Méthodes: **Magic link** (défaut), **Google**, **Apple**, **Facebook**, **e-mail+mot de passe**.  
- UI: **modal** auth; reprise automatique du flow après succès.  
- RGPD: CGU/Privacy visibles; cookies session en “nécessaire”.  
- Données: **users**, **identities**, **sessions**, **purchases**, **entitlements**, **share_pass**.

---

## 15) Notation (/100) & Affiche partage
- Déclenchée à la fin du dernier chapitre.  
- **Slider** /100 (A validé). Stockage note → moyenne /100.  
- **Génération d’une image** (1 visuel à la fois) parmi **2 modèles** (jour/nuit selon thème); **télécharger/partager**.  
- **Hub**: afficher le **dernier visuel** noté dans le **hero** (entre badges et *Lire le tale*).

---

## 16) Sécurité & Anti-extraction
- **Textes**: API **page-par-page**, tokens courts.  
- **Audio**: URLs **signées**, range, pas de liens permanents.  
- **Triggers**: côté serveur.  
- **Rate-limit** & **throttling**; obfuscation légère JSON.  
- Politiques d’erreurs conformes §9.

---

## 17) États d’erreur & Toasters
- Paiement interrompu · Connexion interrompue · Passe déjà utilisé · Fichier audio manquant · Réseau indisponible.  
- **Toasts** 2–3 s, ton neutre; modales seulement pour auth/paiement.

---

## 18) Accessibilité & Desktop
- Focus visible, rôles ARIA, annonces des changements.  
- Clavier: Espace (play/pause + auto-chaîne), Tab ordre logique, Échap ferme overlays.  
- Souris: mapping §3.3; clic dialogue prioritaire si overlay ouvert.

---

## 19) Assets & Nommage
- Logos: `public/logo-clair.svg` (jour), `public/logo-sombre.svg` (nuit).  
- Mode: `public/mode-jour.svg`, `public/mode-nuit.svg`.  
- Cartes: 16:9, radius 16 px, pastilles **Baskerville**.  
- Couleurs: uniquement la palette §1.1.

---

## 20) Analytics (MVP)
- `paywall_view`, `paywall_cta_click:{stripe|paypal|share}`  
- `purchase_success|fail`  
- `share_pass_start|expire|to_purchase`  
- `dialogue_play|pause`, `bookmark_toggle`, `overlay_open|close`  
- `rating_submit`, `share_image_download`

---

## 21) Roadmap (archivage, non exposé MVP)
- Premium / Mode Bonne nuit, Abonnements, Sélect, Séries Tales, motif haptique signature.

---

## 22) Règles CSS/Render
- `hyphens: none; word-break: normal; overflow-wrap: anywhere;`  
- Respecter `prefers-reduced-motion`.  
- Safe-area insets; aucune UI sur la zone de texte.

---

## 23) Glossaire
- **Interstitiel**: écran d’intro chapitre (fond+image+titre) 3 s.  
- **Bloc dialogue**: répliques consécutives auto-enchaînées.  
- **Passe 60 min**: accès temps réel serveur, minutes affichées, grâce fin de page.

---

**Fin — v2.1** · Cette Bible remplace toutes versions précédentes.
