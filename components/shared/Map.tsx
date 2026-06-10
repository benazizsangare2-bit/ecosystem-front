"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";

export interface MapPoint {
  lat: number;
  lng: number;
  title?: string;
  id?: number;
}

interface MapProps {
  points?: MapPoint[];
  selected?: MapPoint | null;
  onClick?: (lat: number, lng: number) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function Map({
  points,
  selected,
  onClick,
  className,
  center,
  zoom,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    const el = mapRef.current;
    let cancelled = false;
    let markers: L.Marker[] = [];

    async function initMap() {
      if (cancelled) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const ecoIcon = L.divIcon({
        html: `<div style="background:#2d5a27;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const selectedIcon = L.divIcon({
        html: `<div style="background:#4a7c3f;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const map = L.map(el, {
        center: center || [-4.321, 15.312],
        zoom: zoom || 12,
        zoomControl: true,
        attributionControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        maxZoom: 19,
      }).addTo(map);

      if (onClick) {
        map.on("click", (e: L.LeafletMouseEvent) => {
          onClick(e.latlng.lat, e.latlng.lng);
        });
      }

      points?.forEach((p) => {
        const marker = L.marker([p.lat, p.lng], { icon: ecoIcon })
          .addTo(map)
          .bindPopup(p.title || "");
        markers.push(marker);
      });

      if (selected) {
        const marker = L.marker([selected.lat, selected.lng], {
          icon: selectedIcon,
        })
          .addTo(map)
          .bindPopup(selected.title || "Selected location");
        markers.push(marker);
        map.setView([selected.lat, selected.lng], map.getZoom() || 14);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, points, selected, center, zoom, onClick]);

  if (!mounted) {
    return (
      <div
        className={
          className ||
          "h-64 w-full rounded-2xl overflow-hidden bg-muted animate-pulse"
        }
      />
    );
  }

  return (
    <div
      ref={mapRef}
      className={className || "h-64 w-full rounded-2xl overflow-hidden"}
    />
  );
}
