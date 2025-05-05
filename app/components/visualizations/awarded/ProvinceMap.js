"use client";

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ReactDOMServer from "react-dom/server";
import provinceGeoData from "../provinceGeoData.json";

const CustomTooltip = ({ province, value, count, percent }) => (
  <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
    <p className="font-medium text-gray-900">{province}</p>
    <p className="text-gray-600">R {(value || 0).toLocaleString()}</p>
    <p className="text-gray-600">{percent?.toFixed(1)}% of total value</p>
    <p className="text-gray-600">{count || 0} tenders</p>
  </div>
);

export default function ProvinceMap({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);

  const provinceData = React.useMemo(() => {
    if (!data) return { values: {}, counts: {}, total: 0 };

    const values = {};
    const counts = {};
    let total = 0;

    data.forEach((item) => {
      const province = item.province;
      values[province] = item.totalValue;
      counts[province] = item.count;
      total += item.totalValue;
    });

    return { values, counts, total };
  }, [data]);

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
        const count = provinceData.counts[province] || 0;
        const percent = provinceData.total
          ? (value / provinceData.total) * 100
          : 0;

        // Show popup
        popup.current
          .setLngLat(e.lngLat)
          .setHTML(
            ReactDOMServer.renderToString(
              <CustomTooltip
                province={province}
                value={value}
                count={count}
                percent={percent}
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
  }, [provinceData]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Awarded Tenders by Province
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Tap a province to see the details
      </p>
      <div
        ref={mapContainer}
        className="h-[400px] relative rounded-lg overflow-hidden"
      />
    </div>
  );
}
