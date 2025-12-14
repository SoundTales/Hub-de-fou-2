const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./TaleLanding-DD333zlr.js","./index-DHGFovfL.js","./vendor-WYr585uA.js","./supabase-B76hXWPk.js","./index-aRZGG4qF.css"])))=>i.map(i=>d[i]);
import{_ as w,j as e,s as d,C as N,I as k,a as T}from"./index-DHGFovfL.js";import{c as t,L as S}from"./vendor-WYr585uA.js";import"./supabase-B76hXWPk.js";const E=()=>w(()=>import("./TaleLanding-DD333zlr.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url),I=()=>{try{const{useToast:l}=require("../contexts/ToastContext");return l()}catch{return{error:()=>{},success:()=>{},info:()=>{}}}};function A(){const{error:l,success:C}=I(),[p,b]=t.useState([]),[u,j]=t.useState(!0),[m,x]=t.useState(null),[c,h]=t.useState(""),[a,o]=t.useState("idle"),[g,v]=t.useState(!0),[f,y]=t.useState(!1);t.useEffect(()=>{E();async function s(){try{x(null);const{data:r,error:i}=await d.from("tales").select("*").eq("status","published").order("created_at",{ascending:!1});if(i)throw i;b(r||[])}catch(r){console.error("Error fetching tales:",r),x("Impossible de charger les Tales pour le moment. Merci de réessayer ultérieurement.")}finally{j(!1)}}s()},[]);const _=async s=>{if(s.preventDefault(),!!c){o("loading");try{const{error:r}=await d.from("newsletter_subscribers").insert([{email:c,preference_audio:g,preference_visual:f}]);if(r)if(r.code==="23505")o("already_subscribed");else throw r;else o("success"),h("")}catch(r){console.error("Error subscribing:",r),o("error")}}};return e.jsxs("div",{className:"page pre-hub-page page--fade",children:[e.jsxs("div",{className:"page-section",children:[e.jsxs("div",{className:"page-section-header",children:[e.jsx("p",{className:"accueil__eyebrow",children:"Le Catalogue"}),e.jsx("h2",{children:"Toutes nos histoires"})]}),m&&e.jsx("div",{role:"alert",style:{background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.5)",color:"#fecaca",padding:"12px 16px",borderRadius:"10px",margin:"12px 0 18px"},children:m}),u?e.jsx("div",{style:{minHeight:"400px",opacity:0}}):e.jsxs("div",{className:"tales-grid",children:[p.map(s=>{const r=s.cover_image||s.cover_url,i=r&&!r.startsWith("http")?`https://gmunwpptyhwiiffcbhcq.supabase.co/storage/v1/object/public/${r.split("/").map(n=>encodeURIComponent(n)).join("/")}`:r;return e.jsx(S,{to:`/tale/${s.slug}`,state:{tale:s},className:"tale-card-link",onMouseEnter:()=>{d.from("tales").select("*").eq("slug",s.slug).single().then(()=>console.log("Tale data preloaded"))},children:e.jsx("div",{className:"tale-card",children:e.jsx("div",{className:"tale-card__image",children:e.jsx("img",{src:i,alt:s.title,loading:"eager",onError:n=>{n.target.src="https://placehold.co/600x900/1a1a1a/ffffff?text=No+Cover"}})})})},s.id)}),p.length===0&&e.jsx("div",{style:{gridColumn:"1/-1",textAlign:"center",padding:"40px",background:"rgba(255,255,255,0.05)",borderRadius:"12px"},children:e.jsx("p",{children:"Aucune histoire publiée pour le moment."})})]})]}),!u&&e.jsx("section",{className:"contact-section","aria-label":"Rester connecté·e aux prochains Tales",style:{marginTop:"60px"},children:e.jsxs("article",{className:"contact-card",children:[e.jsxs("div",{className:"contact-header",children:[e.jsx("p",{className:"accueil__eyebrow",children:"Lecteurs & auditeurs"}),e.jsx("h3",{children:"Être prévenu du prochain Tale"}),e.jsx("p",{children:"Laissez votre adresse et nous vous avertirons quand le prochain Tale sera prêt dans la Liseuse, avec éventuellement un accès en avant-première et quelques coulisses."})]}),e.jsxs("form",{className:"modern-form",onSubmit:_,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Adresse e-mail"}),e.jsx("div",{style:{display:"flex",gap:"10px"},children:e.jsx("input",{type:"email",className:"form-input",name:"newsletter-email",required:!0,placeholder:"vous@email.com",value:c,onChange:s=>h(s.target.value),disabled:a==="loading"||a==="success"})})]}),a==="success"&&e.jsxs("div",{style:{color:"#4ade80",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(N,{size:18})," Inscription confirmée ! Merci."]}),a==="already_subscribed"&&e.jsxs("div",{style:{color:"#fbbf24",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(k,{size:18})," Vous êtes déjà inscrit."]}),a==="error"&&e.jsxs("div",{style:{color:"#f87171",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(T,{size:18})," Une erreur est survenue. Réessayez plus tard."]}),e.jsxs("fieldset",{className:"checkbox-group",style:{marginTop:"1rem"},children:[e.jsx("legend",{children:"Preferences de contenus"}),e.jsxs("div",{className:"checkbox-item",children:[e.jsx("input",{type:"checkbox",id:"newsletter-audio",name:"newsletter-audio",checked:g,onChange:s=>v(s.target.checked)}),e.jsx("label",{htmlFor:"newsletter-audio",children:"Ecoutes audio & lectures"})]}),e.jsxs("div",{className:"checkbox-item",children:[e.jsx("input",{type:"checkbox",id:"newsletter-visuel",name:"newsletter-visuel",checked:f,onChange:s=>y(s.target.checked)}),e.jsx("label",{htmlFor:"newsletter-visuel",children:"Illustrations & making-of"})]})]}),e.jsx("button",{type:"submit",className:"form-submit form-submit--ghost",disabled:a==="loading"||a==="success",children:a==="loading"?"Inscription...":"Me prévenir pour le prochain Tale"})]})]})}),e.jsx("style",{children:`
        .pre-hub-page {
          padding-top: 100px;
        }

        .tales-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 40px; 
          justify-items: center;
          animation: fadeInSmooth 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .tale-card-link { text-decoration: none; color: inherit; display: block; width: 100%; max-width: 340px; }
        .tale-card { display: flex; flex-direction: column; gap: 16px; align-items: center; transition: transform 0.3s ease; }
        .tale-card:hover { transform: translateY(-8px); }
        
        .tale-card__image { 
          width: 100%; 
          aspect-ratio: 0.625; /* Ratio 1:1.6 comme sur la page de présentation */
          border-radius: 24px; 
          overflow: hidden; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .tale-card:hover .tale-card__image {
          border-color: #ffff80;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .tale-card__image img { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 768px) {
          .pre-hub-page {
            padding-top: 80px;
          }
          .page-section {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .tales-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .tale-card-link {
            max-width: none;
          }
          .tale-card__image {
            border-radius: 16px;
          }
        }
      `})]})}export{A as default};
