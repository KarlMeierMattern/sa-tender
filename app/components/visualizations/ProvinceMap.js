"use client";

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ReactDOMServer from "react-dom/server";
import provinceGeoData from "../../lib/provinceGeoData.json";

const CustomTooltip = ({ province, value, isAwarded }) => (
  <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
    <p className="font-medium text-gray-900">{province}</p>
    {isAwarded ? (
      <p className="text-gray-600">R {(value || 0).toLocaleString()}</p>
    ) : (
      <p className="text-gray-600">{value || 0} tenders</p>
    )}
  </div>
);

export default function ProvinceMap({ tenders, isAwarded = false }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);

  const provinceData = React.useMemo(() => {
    if (isAwarded) {
      const values = {};
      let maxValue = 0;

      tenders.forEach((tender) => {
        if (!tender.province || !tender.successfulBidderAmount) return;
        const value = parseFloat(tender.successfulBidderAmount) || 0;
        values[tender.province] = (values[tender.province] || 0) + value;
        maxValue = Math.max(maxValue, values[tender.province]);
      });

      return { values, maxValue };
    } else {
      const counts = {};
      const total = tenders.length;

      tenders.forEach((tender) => {
        const province = tender.province || "Unknown";
        counts[province] = (counts[province] || 0) + 1;
      });

      return {
        values: counts,
        maxValue: Math.max(...Object.values(counts)),
      };
    }
  }, [tenders, isAwarded]);

  const getColor = (province) => {
    const value = provinceData.values[province];
    if (!value) return "rgba(129, 140, 248, 0.1)";
    const opacity = Math.min(0.2 + (value / provinceData.maxValue) * 0.8, 1);
    return `rgba(129, 140, 248, ${opacity})`;
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [25, -29],
      zoom: 4,
      minZoom: 1,
      maxZoom: 8,
      maxBounds: [
        [-20, -60],
        [70, 0],
      ],
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl());

    // Initialize popup but don't add to map yet
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.current.on("load", () => {
      // Add province boundaries source
      map.current.addSource("provinces", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: provinceGeoData.features.map((feature, index) => ({
            ...feature,
            id: index,
            properties: {
              ...feature.properties,
              value: provinceData.values[feature.properties.name] || 0,
            },
          })),
        },
      });

      // Add province fill layer
      map.current.addLayer({
        id: "province-fills",
        type: "fill",
        source: "provinces",
        layout: {},
        paint: {
          "fill-color": "rgba(0, 0, 0, 0)",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.15,
            0,
          ],
        },
      });
    });

    // Track hover state
    let hoveredStateId = null;

    // Add hover effect
    map.current.on("mousemove", "province-fills", (e) => {
      if (e.features.length > 0) {
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: "provinces", id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = e.features[0].id;
        map.current.setFeatureState(
          { source: "provinces", id: hoveredStateId },
          { hover: true }
        );

        const feature = e.features[0];
        const province = feature.properties.name;
        const value = provinceData.values[province];

        // Show popup
        popup.current
          .setLngLat(e.lngLat)
          .setHTML(
            ReactDOMServer.renderToString(
              <CustomTooltip
                province={province}
                value={value}
                isAwarded={isAwarded}
              />
            )
          )
          .addTo(map.current);
      }
    });

    // Remove hover state
    map.current.on("mouseleave", "province-fills", () => {
      if (hoveredStateId !== null) {
        map.current.setFeatureState(
          { source: "provinces", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = null;
      popup.current.remove();
    });

    return () => {
      map.current.remove();
      map.current = null;
    };
  }, [provinceData, isAwarded]);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">
        {isAwarded ? "Total Awarded Value by Province" : "Tenders by Province"}
      </h2>
      <div
        ref={mapContainer}
        className="h-[calc(100%-2rem)] relative rounded-lg overflow-hidden"
      />
    </div>
  );
}
