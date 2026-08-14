"use client";

import { useEffect, useMemo, useRef } from "react";

type Node = {
  id: string;
  name: string;
  username: string | null;
  type: string;
  latitude: number;
  longitude: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  supplyRelation: "CURRENT" | "IN_NETWORK" | "OUT_OF_NETWORK" | null;
  alerts: string[];
};

type Transfer = {
  from: { latitude: number; longitude: number; name: string };
  to: { latitude: number; longitude: number; name: string };
};

type GoogleMapsRuntime = {
  maps: {
    Map: new (...args: unknown[]) => unknown;
    Marker: new (...args: unknown[]) => {
      addListener: (eventName: string, callback: () => void) => void;
    };
    InfoWindow: new (...args: unknown[]) => {
      open: (options: { map: unknown; anchor: unknown }) => void;
    };
    Polyline: new (...args: unknown[]) => unknown;
    SymbolPath: {
      CIRCLE: string | number;
    };
  };
};

function markerColor(node: Node) {
  if (node.supplyRelation === "CURRENT") return "#0284c7";
  if (node.supplyRelation === "IN_NETWORK") return "#16a34a";
  if (node.supplyRelation === "OUT_OF_NETWORK") return "#dc2626";
  const status = node.status;
  if (status === "CRITICAL") return "#dc2626";
  if (status === "WARNING") return "#eab308";
  return "#16a34a";
}

export function NetworkMap({
  nodes,
  transfers,
  apiKey,
}: {
  nodes: Node[];
  transfers: Transfer[];
  apiKey: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const center = useMemo(() => {
    if (nodes.length === 0) {
      return { lat: -33.49, lng: -70.62 };
    }

    const sum = nodes.reduce(
      (acc, node) => ({
        lat: acc.lat + node.latitude,
        lng: acc.lng + node.longitude,
      }),
      { lat: 0, lng: 0 },
    );

    return {
      lat: sum.lat / nodes.length,
      lng: sum.lng / nodes.length,
    };
  }, [nodes]);

  useEffect(() => {
    if (!mapRef.current || !apiKey) {
      return;
    }

    const scriptId = "medstock-google-maps";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderMap = () => {
      const googleMaps =
        (window as Window & { google?: GoogleMapsRuntime }).google;
      if (!googleMaps || !mapRef.current) {
        return;
      }

      mapRef.current.innerHTML = "";

      const map = new googleMaps.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      });

      nodes.forEach((node) => {
        const marker = new googleMaps.maps.Marker({
          position: { lat: node.latitude, lng: node.longitude },
          map,
          title: node.name,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            fillColor: markerColor(node),
            fillOpacity: 1,
            strokeColor: "#0f172a",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            scale: 8,
          },
        });

        const infoWindow = new googleMaps.maps.InfoWindow({
          content: `<div style=\"font-family:Arial,sans-serif;padding:4px 2px;\"><strong>${node.name}</strong><br/>${node.type}<br/>Usuario: ${node.username ?? "sin credencial"}<br/>Relacion: ${node.supplyRelation ?? "sin nodo activo"}<br/>Estado: ${node.status}<br/>Alertas: ${node.alerts.length > 0 ? node.alerts.join(", ") : "Sin alertas"}</div>`,
        });

        marker.addListener("click", () => infoWindow.open({ map, anchor: marker }));
      });

      transfers.forEach((transfer) => {
        new googleMaps.maps.Polyline({
          path: [
            { lat: transfer.from.latitude, lng: transfer.from.longitude },
            { lat: transfer.to.latitude, lng: transfer.to.longitude },
          ],
          geodesic: true,
          strokeColor: "#0ea5e9",
          strokeOpacity: 0.85,
          strokeWeight: 3,
          map,
        });
      });
    };

    if (existingScript) {
      existingScript.addEventListener("load", renderMap);
      renderMap();
      return () => existingScript.removeEventListener("load", renderMap);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderMap);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", renderMap);
    };
  }, [apiKey, center, nodes, transfers]);

  if (!apiKey) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Falta GOOGLE_MAPS_API_KEY o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu entorno.
      </div>
    );
  }

  return <div ref={mapRef} className="h-[520px] w-full rounded-3xl border border-cyan-100" />;
}
