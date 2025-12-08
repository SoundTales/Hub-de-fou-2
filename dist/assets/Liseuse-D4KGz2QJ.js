import{u as J,j as t,s as K}from"./index-DHEotZcm.js";import{h as Z,d as O,c as s,L as ee}from"./vendor-WYr585uA.js";import{c as g}from"./createLucideIcon-eAH5ksrC.js";import"./supabase-B76hXWPk.js";const te=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],F=g("arrow-left",te);const re=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"m21 3-7 7",key:"1l2asr"}],["path",{d:"m3 21 7-7",key:"tjx5ai"}],["path",{d:"M9 21H3v-6",key:"wtvkvv"}]],I=g("maximize-2",re);const ne=[["path",{d:"m14 10 7-7",key:"oa77jy"}],["path",{d:"M20 10h-6V4",key:"mjg0md"}],["path",{d:"m3 21 7-7",key:"tjx5ai"}],["path",{d:"M4 14h6v6",key:"rmj7iw"}]],$=g("minimize-2",ne);const se=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],oe=g("play",se);const ae=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ie=g("settings",ae),R=({onVisible:p,children:l})=>{const d=s.useRef(null),[a,h]=s.useState(!1);return s.useEffect(()=>{const c=new IntersectionObserver(([x])=>{x.isIntersecting&&!a&&(p(),h(!0))},{threshold:.5});return d.current&&c.observe(d.current),()=>c.disconnect()},[a,p]),t.jsx("div",{ref:d,children:l})};function me(){const{taleId:p,chapterId:l}=Z(),d=O(),[a,h]=s.useState(null),[c,x]=s.useState(!1),[b,w]=s.useState(!1),[z,A]=s.useState(null),[M,L]=s.useState(!0),[P,E]=s.useState(null),[T,N]=s.useState(!1),[C,U]=s.useState(!1),f=s.useRef(null),y=s.useRef(!1),{user:X}=J();s.useEffect(()=>{const e=()=>{U(!!document.fullscreenElement)};return document.addEventListener("fullscreenchange",e),()=>{document.removeEventListener("fullscreenchange",e)}},[]);const S=()=>{document.fullscreenElement&&document.exitFullscreen().catch(e=>console.error("Erreur sortie plein écran:",e)),d(-1)},v=()=>{document.fullscreenElement?document.exitFullscreen&&document.exitFullscreen():document.documentElement.requestFullscreen().catch(e=>{console.log(`Error attempting to enable fullscreen: ${e.message}`)})};s.useEffect(()=>{async function e(){try{const{data:r,error:o}=await K.from("chapters").select("*").eq("id",l).single();if(o||!r)throw console.error("DB Error:",o),new Error("Chapitre introuvable ou accès refusé.");if(r.is_premium&&!X)throw new Error("Connexion ou achat requis pour ce chapitre premium.");let n=r.content;if(!n&&r.content_url){const u=await fetch(r.content_url);if(!u.ok)throw new Error("Erreur lors du téléchargement du contenu.");n=await u.json()}if(!n)throw new Error("Contenu du chapitre vide ou manquant.");h({...n,cover_image:r.cover_image})}catch(r){console.error(r),A(r.message||"Une erreur est survenue.")}finally{L(!1)}}l&&e()},[l]);const j=(e,r)=>{if(!a?.meta?.basePaths)return r;const o=a.meta.basePaths;if(e==="voice")return o.voices+r;if(e==="music"){const n=a.audioRegistry?.tracks?.[r]||r;return o.music+n}if(e==="sfx"){const n=a.audioRegistry?.sfx?.[r]||r;return o.sfx+n}return r},D=()=>{console.log("Audio context unlocked"),document.fullscreenElement||v(),w(!0),setTimeout(()=>{x(!0),w(!1)},800)};s.useEffect(()=>{if(!c)return;const e=setTimeout(()=>{y.current||N(!0)},3e3);return()=>clearTimeout(e)},[c]);const B=(e,r,o)=>{console.log(`🗣️ VOIX [${r}]: ${o}`),y.current||(y.current=!0,N(!1)),f.current&&(f.current.pause(),f.current.currentTime=0);const n=new Audio(o);f.current=n,E(e),n.play().catch(u=>console.error("Erreur lecture audio:",u)),n.onended=()=>{E(null)}},H=e=>{const r=j("sfx",e);console.log(`💥 SFX: ${r}`)},q=(e,r)=>{const o=j("music",r);console.log(`🎵 MUSIC [${e}]: ${o}`)},Y=e=>{console.log(`💾 Checkpoint: ${e}`)};if(M)return t.jsx("div",{className:"liseuse-loading",children:"Chargement du récit..."});if(z)return t.jsxs("div",{className:"liseuse-error",children:[t.jsx("p",{children:z}),t.jsx(ee,{to:`/tale/${p}`,className:"back-link",children:"Retour au Tale"})]});if(!a)return null;let i=a.cover_image||a.meta?.coverImage;if(i&&!i.startsWith("http")&&!i.startsWith("blob")){const e="https://gmunwpptyhwiiffcbhcq.supabase.co",r=i.split("/").map(o=>encodeURIComponent(o)).join("/");i=`${e}/storage/v1/object/public/${r}`}i||(i="https://placehold.co/400x600/1f2023/FFF?text=No+Image");const V=a.blocks.findIndex(e=>e.type==="dialogue"),G=!c||b,Q=c||b;return t.jsxs(t.Fragment,{children:[G&&t.jsxs("div",{className:`start-screen ${b?"exiting":""}`,children:[t.jsxs("div",{className:"start-screen-header",children:[t.jsx("button",{onClick:S,className:"icon-btn",children:t.jsx(F,{size:24})}),t.jsx("button",{onClick:v,className:"icon-btn",children:C?t.jsx($,{size:24}):t.jsx(I,{size:24})})]}),t.jsx("h1",{className:"chapter-title stagger-item delay-1",children:a.meta.title}),t.jsx("div",{className:"cover-container stagger-item delay-2",children:t.jsx("img",{src:i,alt:"Cover",className:"cover-image",onError:e=>{e.target.onerror=null,e.target.src="https://placehold.co/400x600/1f2023/FFF?text=No+Image"}})}),t.jsxs("button",{className:"start-btn stagger-item delay-3",onClick:D,children:[t.jsx(oe,{size:20,fill:"currentColor",style:{marginRight:"10px"}}),"COMMENCER LA LECTURE"]}),t.jsx("style",{children:`
            .start-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: #fefff4; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; padding: 20px; padding-bottom: 8vh; transition: opacity 0.8s ease-in-out; }
            .start-screen.exiting { opacity: 0; pointer-events: none; }
            
            .start-screen-header { position: absolute; top: 0; left: 0; width: 100%; padding: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
            .icon-btn { background: transparent; border: none; color: #1f2023; cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .icon-btn:hover { background: rgba(0,0,0,0.05); color: black; }
            
            .cover-container { width: 100%; max-width: 380px; aspect-ratio: 2/3; margin-bottom: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; border-radius: 12px; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            .cover-image { width: 100%; height: 100%; object-fit: cover; }
            
            .chapter-title { color: #1f2023; text-align: center; margin-bottom: 2rem; font-size: 3.5rem; line-height: 1.1; font-family: 'Playfair Display', serif; font-weight: 700; letter-spacing: -0.02em; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            
            .start-btn { background: #1f2023; color: #fefff4; border: none; padding: 1.4rem 3rem; font-size: 1.1rem; font-weight: 600; border-radius: 50px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; align-items: center; transform: translateY(20px); opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            .start-btn:hover { transform: scale(1.05) translateY(0); box-shadow: 0 15px 30px rgba(0,0,0,0.15); background: #000; }

            .stagger-item.delay-1 { animation-delay: 0.1s; }
            .stagger-item.delay-2 { animation-delay: 0.3s; }
            .stagger-item.delay-3 { animation-delay: 0.5s; }

            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (max-width: 768px) {
              .start-screen { padding-bottom: 10vh; }
              .cover-container { max-width: 280px; margin-bottom: 2rem; }
              .start-btn { padding: 1.2rem 2.5rem; font-size: 1rem; }
              .chapter-title { font-size: 2.2rem; margin-bottom: 1.5rem; }
            }
          `})]}),Q&&t.jsxs("div",{className:"liseuse-container page page--zoom",children:[t.jsxs("header",{className:"liseuse-header",children:[t.jsxs("button",{onClick:S,className:"liseuse-nav-btn",children:[t.jsx(F,{size:20})," Quitter"]}),t.jsxs("div",{className:"liseuse-controls",children:[t.jsx("button",{onClick:v,className:"liseuse-icon-btn",children:C?t.jsx($,{size:20}):t.jsx(I,{size:20})}),t.jsx("button",{className:"liseuse-icon-btn",children:t.jsx(ie,{size:20})})]})]}),t.jsx("div",{className:"liseuse-content",children:a.blocks.map((e,r)=>{switch(e.type){case"text":return t.jsx("p",{className:"block-text",children:e.content},r);case"dialogue":const o=j("voice",e.voiceFile||e.audioSrc),n=P===r,W=r===V&&T,_="#feca57";return t.jsx("div",{className:`block-dialogue ${n?"dialogue--active":""} ${W?"dialogue--hint":""}`,style:{borderLeftColor:n?_:"#1f2023",backgroundColor:n?"rgba(0,0,0,0.05)":void 0,boxShadow:n?`inset 4px 0 0 0 ${_}, 0 4px 20px rgba(0,0,0,0.1)`:void 0,transform:n?"translateX(4px)":void 0},onClick:()=>B(r,"Dialogue",o),children:t.jsx("div",{className:"dialogue-content",children:e.turns?e.turns.map((k,m)=>t.jsx("p",{style:{marginBottom:m===e.turns.length-1?0:"0.8rem",margin:0},children:k.content},m)):Array.isArray(e.content)?e.content.map((k,m)=>t.jsx("p",{style:{marginBottom:m===e.content.length-1?0:"0.8rem",margin:0},children:k},m)):t.jsx("p",{style:{margin:0},children:e.content})})},r);case"sfx_cue":return t.jsx(R,{onVisible:()=>H(e.sfxId),children:t.jsx("div",{className:"debug-trigger",children:"⚡"})},r);case"music_cue":return t.jsx(R,{onVisible:()=>q(e.action,e.trackId),children:t.jsx("div",{className:"debug-trigger",children:"🎵"})},r);case"checkpoint":return Y(e.id),null;default:return null}})}),t.jsx("style",{children:`
            .liseuse-container { max-width: 800px; margin: 0 auto; padding: 80px 20px 150px 20px; color: #1f2023; min-height: 100vh; background-color: #fefff4; position: relative; }
            
            .liseuse-header {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              padding: 15px 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 100;
              background: linear-gradient(to bottom, rgba(254,255,244,0.95) 0%, rgba(254,255,244,0) 100%);
              pointer-events: none;
            }
            .liseuse-header > * { pointer-events: auto; }
            
            .liseuse-nav-btn {
              background: rgba(0,0,0,0.05);
              border: none;
              color: #1f2023;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.9rem;
              padding: 8px 16px;
              border-radius: 30px;
              transition: all 0.2s;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0,0,0,0.05);
            }
            .liseuse-nav-btn:hover { background: rgba(0,0,0,0.1); color: #000; }
            
            .liseuse-controls { display: flex; gap: 10px; }
            
            .liseuse-icon-btn {
              background: rgba(0,0,0,0.05);
              border: none;
              color: #1f2023;
              cursor: pointer;
              padding: 10px;
              border-radius: 50%;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0,0,0,0.05);
            }
            .liseuse-icon-btn:hover { background: rgba(0,0,0,0.1); color: #000; }

            .block-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #333; font-family: 'Georgia', serif; }
            
            .block-dialogue {
              background: rgba(0,0,0,0.03);
              border-left: 4px solid #1f2023;
              padding: 1.5rem; margin: 2rem 0; cursor: pointer; border-radius: 0 8px 8px 0;
              transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
              position: relative;
              height: auto;
            }
            .block-dialogue p {
              font-family: 'Georgia', serif;
              font-size: 1.1rem;
              line-height: 1.6;
              color: #1f2023;
              margin: 0;
            }
            .block-dialogue:hover { background: rgba(0,0,0,0.06); transform: translateX(2px); }
            
            .dialogue--hint {
              animation: hint-shake 3s infinite ease-in-out;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
            }

            @keyframes hint-shake {
              0%, 100% { transform: translateX(0); }
              5% { transform: translateX(6px); }
              10% { transform: translateX(0); }
              15% { transform: translateX(6px); }
              20% { transform: translateX(0); }
            }

            .char-name { font-weight: bold; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 5px;}
            
            .debug-trigger { font-size: 0.6rem; color: #333; text-align: center; padding: 2px; opacity: 0.2; }
            .liseuse-error { color: #ff6b6b; text-align: center; margin-top: 50px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
            .liseuse-loading { text-align: center; margin-top: 50px; color: #888; }
            .back-link { color: #1f2023; text-decoration: underline; }
          `})]})]})}export{me as default};
