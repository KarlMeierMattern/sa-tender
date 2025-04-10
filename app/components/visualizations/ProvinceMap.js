"use client";

import React from "react";
import { ResponsiveContainer } from "recharts";
import { getProvinceColor } from "../../lib/provinceGeoData";

// GeoJSON paths for SA provinces
const provincePaths = {
  "Western Cape":
    "M100,320 L70,330 L60,350 L80,370 L110,380 L140,370 L160,350 L130,330 L100,320",
  "Eastern Cape":
    "M160,350 L190,360 L230,370 L270,350 L290,320 L270,290 L230,280 L190,300 L160,350",
  "Northern Cape":
    "M60,180 L90,210 L130,230 L160,220 L190,240 L210,270 L190,300 L160,350 L130,330 L100,320 L70,330 L50,300 L40,250 L50,200 L60,180",
  "Free State":
    "M210,270 L240,260 L270,270 L290,260 L270,290 L230,280 L190,300 L210,270",
  "KwaZulu-Natal":
    "M290,260 L320,250 L340,270 L330,300 L290,320 L270,290 L290,260",
  Gauteng: "M240,220 L260,210 L280,220 L270,240 L250,250 L240,220",
  Mpumalanga: "M280,220 L300,200 L330,210 L320,250 L290,260 L280,220",
  Limpopo:
    "M240,160 L270,150 L310,160 L340,150 L330,180 L300,200 L270,190 L240,160",
  "North West":
    "M160,220 L190,200 L220,210 L210,240 L190,260 L160,250 L140,230 L160,220",
};

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
    return getProvinceColor(value, provinceData.maxValue);
  };

  const handleMouseMove = (e, province) => {
    const value = provinceData.values[province];
    if (!value) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({
      province,
      value,
      isAwarded,
    });
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
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
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <g transform="translate(20, 0) scale(1.1)">
              {Object.entries(provincePaths).map(([province, path]) => (
                <path
                  key={province}
                  d={path}
                  fill={getColor(province)}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  onMouseMove={(e) => handleMouseMove(e, province)}
                  onMouseLeave={handleMouseLeave}
                  className="transition-colors duration-200 hover:opacity-80"
                />
              ))}
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
            <CustomTooltip active={true} {...tooltipData} />
          </div>
        )}
      </div>
    </div>
  );
}
