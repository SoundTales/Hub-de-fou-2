import { useEffect, useState } from "react";

export default function HubSplashLogo({ baseUrl = "" }) {
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    let alive = true;
    const url = `${baseUrl}logo.svg`;
    (async () => {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error("logo fetch failed");
        const txt = await res.text();
        if (alive) setSvg(txt);
      } catch {
        if (alive) setSvg(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [baseUrl]);

  if (!svg) {
    return <img className="gate__logo" src={`${baseUrl}logo.svg`} alt="Logo" />;
  }
  return <div className="gate__logo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
