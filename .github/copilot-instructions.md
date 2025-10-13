# Copilot Instructions — Hub-de-fou-2

Ce dépôt contient le hub de lecture OSRASE (React + Vite) et prépare la liseuse numérique. Ces consignes alignent Copilot avec les intentions produit et les contraintes mobiles/in‑app.

## But Du Projet
- Hub de lecture responsive et fluide, mobile‑first.
- Compatibilité navigateurs in‑app (Messenger/Instagram/Facebook, WebView Android/iOS).
- Intro “gate” avec audio sur geste, pseudo‑plein écran si l’API est bloquée, FAB centré, bannière “Ouvrir dans le navigateur”.
- Liseuse générique: chapitres, dialogues cliquables, transitions, découpage intelligent, paywall, connexion.

## Stack & Fichiers
- React 18 (hooks) + Vite 5.
- Entrées: `src/index.html`, `src/main.jsx` (si présent), `src/App.jsx`, `src/styles.css`.
- Polices: Playfair Display, Libre Baskerville.
- Pas de framework CSS; classes: `.hero__*`, `.card__*`, `.gate*`, `.fab`, `.iab-*`.

## Contraintes Navigateur (in‑app)
- Détection UA: `FBAN|FBAV|Instagram|Messenger|Line|; wv|FB_IAB`.
- Plein écran: tenter `requestFullscreen()` dans la chaîne du geste; fallback pseudo‑fullscreen (`html/body.pseudo-fullscreen` + `--inner-h = window.innerHeight`).
- Viewport: `100dvh` et `env(safe-area-inset-*)` pour notches/safe‑areas.
- Audio: jamais d’autoplay; déclencher via geste utilisateur; fallback `HTMLAudioElement` si besoin.

## Accessibilité & UI
- `aria-label`, `:focus-visible`, `prefers-reduced-motion` respectés.
- FAB: centré en bas sur mobile, largeur bornée (`calc(100vw - safe areas)`), `position: fixed !important`, z-index élevé.
- Bannière in‑app (`.iab-banner`): message d’aide + “Ouvrir dans le navigateur” (Intent Chrome Android sinon `_blank`) et “Copier le lien”.

## Reprise De Lecture (Policy)
- Si une progression existe: changer le CTA en “Reprendre le tale” et reprendre automatiquement au dernier point connu.
- Pas de prompt de confirmation; pour recommencer depuis le début, l’utilisateur passe par la “carte 1”.

## Paiement & Auth (Stripe Checkout)
- Client → `POST /api/purchase/create-checkout-session { chapterId }` → rediriger vers l’URL retournée.
- Serveur: crée une Checkout Session (`mode=payment`, `success_url`, `cancel_url`), stocke `chapterId` en `metadata`.
- Webhook `checkout.session.completed`: créer l’entitlement (chapitre débloqué) côté serveur.
- Retour client sur `success_url`: ne pas débloquer localement; poller `GET /api/me/entitlements` (ou `/purchase/status`) jusqu’à voir l’accès.
- In‑app: avant checkout, encourager l’ouverture dans le navigateur (bannière/intent), éviter les popups.

## Audio — Design
- Ambiance: boucles d’environ 20 s, enchaînées tout au long du chapitre.
- Trigger points: changement de “cue” selon l’avancement (progress %) ou ancres dans le texte, avec crossfade 150–300 ms.
- SFX: événements courts superposés déclenchés par le texte.
- Dialogues: clic sur réplique → lecture de la voix; ducking du fond (≈ −6 dB) pendant la voix, retour 300–600 ms.
- Moteur: Web Audio (`AudioContext`, `musicGain`, `sfxGain`, `voiceGain`, `masterGain`), limiter la polyphonie SFX; fallback multi‑`HTMLAudioElement` si nécessaire.

## Gestes & Navigation (sans scroll)
- Aucune page scrollable: navigation par swipe horizontal uniquement.
- Gestes:
  - Swipe droit → aller à la page suivante (afficher blocs suivants, effacer l’ancienne page).
  - Swipe gauche → revenir à la page précédente (ne pas relancer automatiquement les sons déjà joués).
  - Double‑tap hors zones “dialogue” → ouvrir/fermer l’overlay (dock + carrousel).
  - Tap sur un bloc “dialogue” → jouer la voix (peut se rejouer au tap même en arrière).
  - Appui long (~500 ms) sur un “dialogue” → action “Partager le son sur TikTok”.
- Anti‑retrigger: maintenir `firedTriggerIds` par chapitre; en arrière, ignorer triggers auto; en avant, déclencher une seule fois.

### Détails techniques des gestes
- Seuils recommandés: distance horizontale ≥ 40 px et |dx| > |dy| pour valider un swipe; vitesse minimale ~0.3 px/ms.
- Double‑tap: 2 taps < 300 ms, déplacement < 16 px; ignorer si la cible est un bloc “dialogue”.
- Appui long: 500–600 ms; annuler si mouvement > 8 px ou si le doigt quitte le bloc.
- `touch-action: none` global dans la zone de lecture; exceptions: `touch-action: pan-y` sur la jauge volume.

## Jauge Musique (rail 🎵)
- Barre verticale à droite contrôlant uniquement le volume d’ambiance (musicGain).
- SFX et voix ne sont pas affectés par cette jauge.

### Règles lors des changements de page
- En avant (swipe droit): évaluer les triggers “enter” de la nouvelle page, lancer/crossfader la musique si nouveau cue, jouer SFX planifiés.
- En arrière (swipe gauche): ne pas relancer SFX/cues déjà tirés; conserver le cue courant (la boucle en cours continue). Ne pas interrompre une voix en cours; elle se termine naturellement.

## Overlay / Dock & Carrousels
- Ouverture/fermeture: double‑tap hors dialogues; auto‑hide après quelques secondes d’inactivité.
- Boutons: Accueil (retour hub), Marque‑page (carrousel signets), Chapitrage (carrousel chapitres).
- Étiquettes gauche/droite en bas: numéros du chapitre précédent/suivant; tap = changement de chapitre.

### Carrousels
- Marque‑page: n’affiche que les chapitres marqués par l’utilisateur (ordre chrono de lecture ou d’ajout, à confirmer).
- Chapitrage: tous les chapitres dans l’ordre, avec badge d’avancement et indicateur « payé/verrouillé ».
- Cartes: vignette, titre, courte description (2 lignes max), badge numéro.

## Typographie & Plein écran (contrôles en‑tête)
- “B”: toggle gras léger du texte (un palier).
- “A+”: un seul incrément de taille; un second clic revient à l’état initial.
- “Aa”: bascule Playfair Display ↔ Garamond.
- Plein écran: bouton toggle (on/off) avec fallback pseudo‑fullscreen en in‑app.

## Dialogues (style, états, partage)
- Style visuel: icône bulle + barre verticale gauche + « Nom : » en gras puis texte.
- États: `nonLu` et `lu` (changement de style); persister par `chapterId: Set<dialogId>`.
- Tap: lecture de la voix (avec ducking musique) et marquage en `lu`.
- Appui long: ouvre un bouton « Utiliser le son sur TikTok ».
  - Préparer un mapping `dialogId -> tiktokSoundId` fourni par le contenu; ouvrir l’URL ou deep‑link TikTok (si dispo) dans un nouvel onglet / via intent Android.
  - Si indisponible, afficher un toast explicite.

## Thèmes (jour/nuit) & Tokens
- Variables CSS recommandées: `--bg`, `--ink`, `--ink-muted`, `--accent`, `--surface`, `--rail-bg`, `--rail-thumb`.
- Mode jour: fond clair (teinte papier), texte foncé; Mode nuit: fond sombre, texte clair, rail adapté.
- Respect des safe‑areas (`env(safe-area-inset-*)`) pour header/dock.

## États & Machine (résumé)
- Reader: `idle -> ready -> page_enter -> page_play -> overlay_open? -> page_leave -> ...`
- Événements: `SWIPE_NEXT`, `SWIPE_PREV`, `DIALOG_TAP`, `DIALOG_LONGPRESS`, `DOUBLE_TAP`, `AUDIO_CUE_CHANGE`, `AUDIO_VOICE_END`.
- Garde: en arrière, ne pas relancer `AUDIO_CUE_CHANGE` ni SFX déjà tirés.

## Persistance & Reprise
- Progression: `{ chapterId, pageIndex, updatedAt }` (localStorage + serveur quand dispo).
- Préférences: `{ theme, font: 'playfair'|'garamond', sizeStep: 0|1, weightBoost: boolean, musicVolume: 0..1 }`.
- `readDialogIds` et `firedTriggerIds` par chapitre en local; purge au changement de livre.

## Accessibilité
- Touch targets min 44 px; `aria-pressed` pour toggles; `aria-valuenow` sur jauge.
- Respect `prefers-reduced-motion`: désactiver transitions lourdes et crossfades très longs (>150 ms) si activé.

## Analytics (facultatif mais utile)
- `reader_open`, `page_change`, `dialog_play`, `dialog_share_tiktok`, `overlay_open`, `typography_change`, `theme_change`, `music_volume_change`, `chapter_change`.

## Performances
- Pré‑rendu de la page suivante/précédente (shadow DOM/hidden container) pour transition instantanée.
- Préchargement audio: première boucle + SFX proches; lazy pour le reste.
- Throttle des gestures et du rail (rafraîchir le volume à 60fps max via `requestAnimationFrame`).

## Package De Contenu (réutilisable)
- Chapter Package:
  - `chapter.json` (métadonnées: id, title, paid, assets, options),
  - `content.md` ou `content.txt` (texte principal),
  - `timeline.json` facultatif (triggers: cues, sfx, ancres de dialogues).
- Parsing hybride: Markdown/texte brut + heuristiques (paragraphes, titres, `Nom : …`).
- Annotations optionnelles (tolérance d’erreurs):
  - `<!-- dialog speaker="Zadig" src="assets/voice/z_01.mp3" -->`,
  - `<!-- sfx id="door" src="assets/sfx/door.mp3" at="para:12" -->`,
  - `<!-- cue id="tension" at="progress:0.5" src="assets/music/tension.mp3" loop="true" -->`.
- Si rien n’est annoté: rendu texte propre, sans audio/effets, sans casser la lecture.

## Liseuse — Tâches Clés
- Parser → AST simple; Chunker par mesure offscreen (100dvh utiles) et césures aux phrases/paragraphes.
- Rendu + transitions fluides (fade/slide) entre chunks.
- Préférences (thème/typo) + progression persistées; reprise auto (voir policy).

## Style & Conventions
- Composants fonctionnels + hooks; CSS avec `clamp()`, `dvh`, Flex/Grid; pas de frameworks CSS.
- Listeners `{ passive: true }`, `IntersectionObserver` pour visibilité.
- Changements minimaux et cohérents avec les classes existantes.

## Commandes
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Références rapides
- UI: `src/App.jsx`, styles `src/styles.css`.
- HTML: `src/index.html` (viewport `viewport-fit=cover`, `interactive-widget=overlays-content`).

— Maintenir ce fichier à jour quand la structure/les workflows évoluent.

## Hub — Cartes, Paywall, Transition vers la liseuse
- Les cartes du hub mènent au chapitre associé au numéro qu’elles portent.
- Si le chapitre est payant et non possédé: déclencher le flux Stripe Checkout décrit plus haut (bannière in‑app si nécessaire). Après webhook + entitlement, autoriser l’accès.
- Si le chapitre est gratuit (ou possédé): lancer une transition fluide vers la liseuse:
  - Afficher l’image de la carte + le nom du chapitre en “splash” court le temps de précharger le premier écran (texte + première boucle audio et SFX proches).
  - Puis transition fluide vers le début de la liseuse (fade/slide).

## Liseuse — Tuto premier lancement
- Lors du tout premier lancement de la liseuse (quel que soit le point d’entrée: bouton, carte, etc.), afficher un tuto court en overlay semi‑transparent avec flèches et textes explicatifs:
  - Gestes: swipe droite/gauche, double‑tap overlay, tap/long‑press dialogues.
  - Contrôles: jauge musique 🎵, boutons typographiques, plein écran, dock.
  - Durée très courte; dismiss par tap n’importe où ou bouton “Compris”.
- Persister un flag local (ex: `readerTutorialSeen=true`) pour ne plus le montrer ensuite.

## Séparation Hub/Liseuse (protéger la page d’accueil)
- Isolation:
  - Le hub (accueil) reste indépendant des comportements de la liseuse (gestes, touch‑action, listeners, styles). 
  - Le corps du document expose un attribut de mode: `document.body.dataset.mode = 'hub' | 'reader'` pour scoper les styles/gestes.
  - Les styles et listeners de la liseuse ne s’activent que lorsque `mode='reader'`.
- Routage recommandé:
  - Pour accéder à la liseuse, utiliser le chemin de route `/#/reader/:chapterId` (ou `/reader/:chapterId` selon la configuration du routeur).
  - Le hub reste sur la route par défaut.
- CSS/JS:
  - Préfixer les classes/portées de la liseuse (`.reader-…`) et n’appliquer les règles globales (ex: `touch-action: none`) que dans le conteneur lecteur.
  - Ne pas modifier la structure globale du hub; toute surcouche (gate, overlay, tutoriel) propre au lecteur doit être montée/démontée dans son conteneur.
