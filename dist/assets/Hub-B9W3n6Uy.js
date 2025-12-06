const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./TaleLanding-CI9Ps3FR.js","./index-B1Ac0ab4.js","./vendor-WYr585uA.js","./supabase-B76hXWPk.js","./index-B55DfvSM.css"])))=>i.map(i=>d[i]);
import{_ as v,j as e,s as n}from"./index-B1Ac0ab4.js";import{c as t,L as _}from"./vendor-WYr585uA.js";import{c as d}from"./createLucideIcon-eAH5ksrC.js";import"./supabase-B76hXWPk.js";const w=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],k=d("check",w);const N=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],T=d("circle-alert",N);const S=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],E=d("info",S),I=()=>v(()=>import("./TaleLanding-CI9Ps3FR.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url);function R(){const[p,g]=t.useState([]),[u,f]=t.useState(!0),[l,m]=t.useState(""),[r,i]=t.useState("idle"),[h,b]=t.useState(!0),[x,y]=t.useState(!1);t.useEffect(()=>{I();async function s(){try{const{data:a,error:c}=await n.from("tales").select("*").eq("status","published").order("created_at",{ascending:!1});if(c)throw c;g(a||[])}catch(a){console.error("Error fetching tales:",a)}finally{f(!1)}}s()},[]);const j=async s=>{if(s.preventDefault(),!!l){i("loading");try{const{error:a}=await n.from("newsletter_subscribers").insert([{email:l,preference_audio:h,preference_visual:x}]);if(a)if(a.code==="23505")i("already_subscribed");else throw a;else i("success"),m("")}catch(a){console.error("Error subscribing:",a),i("error")}}};return e.jsxs("div",{className:"page pre-hub-page page--fade",children:[e.jsxs("div",{className:"page-section",children:[e.jsxs("div",{className:"page-section-header",children:[e.jsx("p",{className:"accueil__eyebrow",children:"Le Catalogue"}),e.jsx("h2",{children:"Toutes nos histoires"})]}),u?e.jsx("div",{style:{minHeight:"400px",opacity:0}}):e.jsxs("div",{className:"tales-grid",children:[p.map(s=>{const a=s.cover_image||s.cover_url,c=a&&!a.startsWith("http")?`https://gmunwpptyhwiiffcbhcq.supabase.co/storage/v1/object/public/${a.split("/").map(o=>encodeURIComponent(o)).join("/")}`:a;return e.jsx(_,{to:`/tale/${s.slug}`,state:{tale:s},className:"tale-card-link",onMouseEnter:()=>{n.from("tales").select("*").eq("slug",s.slug).single().then(()=>console.log("Tale data preloaded"))},children:e.jsx("div",{className:"tale-card",children:e.jsx("div",{className:"tale-card__image",children:e.jsx("img",{src:c,alt:s.title,loading:"eager",onError:o=>{o.target.src="https://placehold.co/600x900/1a1a1a/ffffff?text=No+Cover"}})})})},s.id)}),p.length===0&&e.jsx("div",{style:{gridColumn:"1/-1",textAlign:"center",padding:"40px",background:"rgba(255,255,255,0.05)",borderRadius:"12px"},children:e.jsx("p",{children:"Aucune histoire publiée pour le moment."})})]})]}),!u&&e.jsx("section",{className:"contact-section","aria-label":"Rester connecté·e aux prochains Tales",style:{marginTop:"60px"},children:e.jsxs("article",{className:"contact-card",children:[e.jsxs("div",{className:"contact-header",children:[e.jsx("p",{className:"accueil__eyebrow",children:"Lecteurs & auditeurs"}),e.jsx("h3",{children:"Être prévenu du prochain Tale"}),e.jsx("p",{children:"Laissez votre adresse et nous vous avertirons quand le prochain Tale sera prêt dans la Liseuse, avec éventuellement un accès en avant-première et quelques coulisses."})]}),e.jsxs("form",{className:"modern-form",onSubmit:j,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Adresse e-mail"}),e.jsx("div",{style:{display:"flex",gap:"10px"},children:e.jsx("input",{type:"email",className:"form-input",name:"newsletter-email",required:!0,placeholder:"vous@email.com",value:l,onChange:s=>m(s.target.value),disabled:r==="loading"||r==="success"})})]}),r==="success"&&e.jsxs("div",{style:{color:"#4ade80",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(k,{size:18})," Inscription confirmée ! Merci."]}),r==="already_subscribed"&&e.jsxs("div",{style:{color:"#fbbf24",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(E,{size:18})," Vous êtes déjà inscrit."]}),r==="error"&&e.jsxs("div",{style:{color:"#f87171",marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(T,{size:18})," Une erreur est survenue. Réessayez plus tard."]}),e.jsxs("fieldset",{className:"checkbox-group",style:{marginTop:"1rem"},children:[e.jsx("legend",{children:"Preferences de contenus"}),e.jsxs("div",{className:"checkbox-item",children:[e.jsx("input",{type:"checkbox",id:"newsletter-audio",name:"newsletter-audio",checked:h,onChange:s=>b(s.target.checked)}),e.jsx("label",{htmlFor:"newsletter-audio",children:"Ecoutes audio & lectures"})]}),e.jsxs("div",{className:"checkbox-item",children:[e.jsx("input",{type:"checkbox",id:"newsletter-visuel",name:"newsletter-visuel",checked:x,onChange:s=>y(s.target.checked)}),e.jsx("label",{htmlFor:"newsletter-visuel",children:"Illustrations & making-of"})]})]}),e.jsx("button",{type:"submit",className:"form-submit form-submit--ghost",disabled:r==="loading"||r==="success",children:r==="loading"?"Inscription...":"Me prévenir pour le prochain Tale"})]})]})}),e.jsx("style",{children:`
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
      `})]})}export{R as default};
