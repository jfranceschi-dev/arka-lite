import { useEffect, useState } from "react";

// Enlaces a los contratos Swagger de cada API y a Grafana. En el contenedor,
// nginx publica /enlaces.json con los valores de sus variables de entorno;
// en desarrollo, o si no responde, se usan los puertos de Compose en el
// mismo equipo que abrió la UI.

export interface Enlaces {
  swaggerSolicitudes: string;
  swaggerNotificaciones: string;
  grafana: string;
}

export function enlacesPorDefecto(host = typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost"): Enlaces {
  return {
    swaggerSolicitudes: `http://${host}:8080/swagger-ui/index.html`,
    swaggerNotificaciones: `http://${host}:8081/swagger-ui/index.html`,
    grafana: `http://${host}:3000`,
  };
}

const esUrl = (v: unknown): v is string => typeof v === "string" && /^https?:\/\//.test(v);

export function useEnlaces(): Enlaces {
  const [enlaces, setEnlaces] = useState<Enlaces>(() => enlacesPorDefecto());
  useEffect(() => {
    let vivo = true;
    fetch("/enlaces.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((v: Partial<Enlaces> | null) => {
        if (!vivo || !v) return;
        const base = enlacesPorDefecto();
        setEnlaces({
          swaggerSolicitudes: esUrl(v.swaggerSolicitudes) ? v.swaggerSolicitudes : base.swaggerSolicitudes,
          swaggerNotificaciones: esUrl(v.swaggerNotificaciones) ? v.swaggerNotificaciones : base.swaggerNotificaciones,
          grafana: esUrl(v.grafana) ? v.grafana : base.grafana,
        });
      })
      .catch(() => undefined);
    return () => { vivo = false; };
  }, []);
  return enlaces;
}
