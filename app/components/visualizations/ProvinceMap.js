"use client";

import React from "react";
import { ResponsiveContainer } from "recharts";
import provinceGeoData from "../../lib/provinceGeoData.json";

const CustomTooltip = ({ active, province, value, isAwarded }) => {
  if (!active || !province) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
      <p className="font-medium text-gray-900">{province}</p>
      {isAwarded ? (
        <p className="text-gray-600">R {value.toLocaleString()}</p>
      ) : (
        <p className="text-gray-600">{value} tenders</p>
      )}
    </div>
  );
};

export default function ProvinceMap({ tenders, isAwarded = false }) {
  const [tooltipData, setTooltipData] = React.useState(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

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
    if (!value) return "transparent";
    const opacity = Math.min(0.2 + (value / provinceData.maxValue) * 0.8, 1);
    return `rgba(129, 140, 248, ${opacity})`;
  };

  const handleMouseMove = (e, province) => {
    const value = provinceData.values[province];
    if (!value) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({
      province,
      value,
      isAwarded,
      active: true,
    });
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  // Convert GeoJSON coordinates to SVG path
  const geoJSONToSVGPath = (coordinates) => {
    return (
      coordinates[0]
        .map((coord, i) => {
          // Scale and translate coordinates to fit our viewBox
          const x = (coord[0] - 16) * 40; // Scale longitude
          const y = (coord[1] + 35) * -40; // Scale latitude (and flip y-axis)
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ") + "Z"
    );
  };

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">
        {isAwarded
          ? "Total Awarded Value by Province"
          : "Tenders by Province (Map)"}
      </h2>
      <div className="h-[calc(100%-2rem)] relative">
        <ResponsiveContainer width="100%" height="100%">
          <svg viewBox="0 0 800 800" className="w-full h-full">
            <g transform="translate(100, 700) scale(1)">
              {provinceGeoData.features.map((feature) => {
                const province = feature.properties.name;
                const path = geoJSONToSVGPath(feature.geometry.coordinates);
                return (
                  <path
                    key={province}
                    d={path}
                    fill={getColor(province)}
                    stroke="#818cf8"
                    strokeWidth="2"
                    onMouseMove={(e) => handleMouseMove(e, province)}
                    onMouseLeave={handleMouseLeave}
                    className="transition-colors duration-200 hover:opacity-80"
                  />
                );
              })}
            </g>
          </svg>
        </ResponsiveContainer>
        {tooltipData && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 70,
            }}
          >
            <CustomTooltip {...tooltipData} />
          </div>
        )}
      </div>
    </div>
  );
}
