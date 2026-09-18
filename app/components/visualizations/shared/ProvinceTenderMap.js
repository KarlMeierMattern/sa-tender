"use client";

import React, { useRef, useEffect, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ensurePmtilesProtocol } from "@/app/lib/pmtilesProtocol";
import {
  MAP_ATTRIBUTION,
  MAP_CENTER,
  MAP_MIN_ZOOM,
  MAP_ZOOM,
  PROVINCE_SOURCE_LAYER,
  PROVINCE_TILES_URL,
  SA_BOUNDS,
  normalizeProvinceName,
  pmtilesUrl,
} from "@/app/lib/provinceMapConfig";

const EMPTY_FILTER = ["==", ["get", "name"], ""];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTooltipHtml(province, rows) {
  const rowHtml = rows
    .map((row) => `<div class="province-tooltip-row">${escapeHtml(row)}</div>`)
    .join("");

  return `<div class="province-tooltip"><div class="province-tooltip-title">${escapeHtml(province)}</div>${rowHtml}</div>`;
}

function countTooltipHtml(province, count, percent) {
  return buildTooltipHtml(province, [
    `${count || 0} tenders`,
    `${percent?.toFixed(1)}% of total`,
  ]);
}

function valueTooltipHtml(province, value, count, percent) {
  const avg = count > 0 ? (value / count / 1_000_000).toFixed(1) : "0.0";
  return buildTooltipHtml(province, [
    `R ${(value / 1_000_000_000).toFixed(1)}bn (${percent?.toFixed(1)}% of total)`,
    `${count || 0} tenders`,
    `R ${avg}m average`,
  ]);
}

function buildLookup(data, mode) {
  const lookup = {};
  let total = 0;

  for (const item of data || []) {
    const province = normalizeProvinceName(item.province);
    if (!province) continue;

    if (mode === "count") {
      const count = item.count || 0;
      lookup[province] = { count, value: count };
      total += count;
    } else {
      const value = parseFloat(item.totalValue) || 0;
      const count = item.count || 0;
      lookup[province] = { count, value };
      total += value;
    }
  }

  for (const entry of Object.values(lookup)) {
    entry.percent = total > 0 ? (entry.value / total) * 100 : 0;
  }

  const max = Math.max(1, ...Object.values(lookup).map((e) => e.value));
  return { lookup, total, max };
}

function fillColorForRatio(ratio) {
  const t = Math.min(1, Math.max(0, ratio));
  const r = Math.round(226 + (99 - 226) * t);
  const g = Math.round(232 + (102 - 232) * t);
  const b = Math.round(240 + (241 - 240) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function buildFillColorExpression(lookup, max) {
  const match = ["match", ["get", "name"]];
  for (const [province, entry] of Object.entries(lookup)) {
    match.push(province, fillColorForRatio(entry.value / max));
  }
  match.push("#e2e8f0");
  return match;
}

export default function ProvinceTenderMap({
  title,
  subtitle,
  data,
  mode = "count",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const lookupRef = useRef({ lookup: {}, total: 0, max: 1 });

  const stats = useMemo(() => buildLookup(data, mode), [data, mode]);
  lookupRef.current = stats;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    ensurePmtilesProtocol();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "bg",
            type: "background",
            paint: { "background-color": "#f8fafc" },
          },
        ],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: 8,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      maxWidth: "220px",
      className: "province-tender-popup",
    });

    map.on("load", () => {
      map.addSource("provinces", {
        type: "vector",
        url: pmtilesUrl(PROVINCE_TILES_URL),
      });

      const { lookup, max } = lookupRef.current;

      map.addLayer({
        id: "province-fill",
        type: "fill",
        source: "provinces",
        "source-layer": PROVINCE_SOURCE_LAYER,
        paint: {
          "fill-color": buildFillColorExpression(lookup, max),
          "fill-opacity": 0.92,
        },
      });

      map.addLayer({
        id: "province-line",
        type: "line",
        source: "provinces",
        "source-layer": PROVINCE_SOURCE_LAYER,
        paint: {
          "line-color": "#64748b",
          "line-opacity": 0.45,
          "line-width": 0.8,
        },
      });

      map.addLayer({
        id: "province-hover-line",
        type: "line",
        source: "provinces",
        "source-layer": PROVINCE_SOURCE_LAYER,
        filter: EMPTY_FILTER,
        paint: {
          "line-color": "#4338ca",
          "line-opacity": 0.95,
          "line-width": 2.5,
        },
      });

      const clearHover = () => {
        if (map.getLayer("province-hover-line")) {
          map.setFilter("province-hover-line", EMPTY_FILTER);
        }
        popupRef.current?.remove();
      };

      const showPopup = (provinceName, lngLat) => {
        const entry = lookupRef.current.lookup[provinceName] || {
          count: 0,
          value: 0,
          percent: 0,
        };

        const html =
          mode === "count"
            ? countTooltipHtml(provinceName, entry.count, entry.percent)
            : valueTooltipHtml(
                provinceName,
                entry.value,
                entry.count,
                entry.percent
              );

        popupRef.current?.setLngLat(lngLat).setHTML(html).addTo(map);
      };

      map.resize();
      map.fitBounds(SA_BOUNDS, {
        padding: { top: 8, bottom: 32, left: 12, right: 12 },
        duration: 0,
        maxZoom: MAP_ZOOM,
      });
      if (map.getZoom() < MAP_MIN_ZOOM) {
        map.jumpTo({ center: MAP_CENTER, zoom: MAP_ZOOM });
      }

      const onMove = (e) => {
        const feature = map.queryRenderedFeatures(e.point, {
          layers: ["province-fill"],
        })[0];

        if (!feature?.properties?.name) {
          clearHover();
          map.getCanvas().style.cursor = "";
          return;
        }

        map.getCanvas().style.cursor = "pointer";
        map.setFilter("province-hover-line", [
          "==",
          ["get", "name"],
          feature.properties.name,
        ]);
        showPopup(feature.properties.name, e.lngLat);
      };

      map.on("mousemove", onMove);
      map.on("click", onMove);
      map.on("mouseleave", "province-fill", () => {
        clearHover();
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("province-fill")) return;

    map.setPaintProperty(
      "province-fill",
      "fill-color",
      buildFillColorExpression(stats.lookup, stats.max)
    );
  }, [stats]);

  return (
    <div className="w-full">
      <h3 className="mb-2 text-center text-lg font-semibold">{title}</h3>
      <p className="mb-2 text-center text-sm text-muted-foreground">
        {subtitle}
      </p>
      <div
        ref={containerRef}
        className="relative h-[300px] overflow-hidden rounded-lg md:h-[380px] lg:h-[400px]"
      />
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        {MAP_ATTRIBUTION}
      </p>
    </div>
  );
}
