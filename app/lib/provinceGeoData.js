// GeoJSON data for South African provinces
export const provinceFeatures = {
  "Western Cape": {
    center: [-33.2278, 21.8569],
    bounds: [
      [-34.8351, 18.2899],
      [-31.6207, 24.2417],
    ],
  },
  "Eastern Cape": {
    center: [-32.2968, 26.4194],
    bounds: [
      [-33.9897, 24.0036],
      [-30.6044, 29.8555],
    ],
  },
  "Northern Cape": {
    center: [-29.0852, 21.8569],
    bounds: [
      [-32.9449, 16.47],
      [-25.2254, 25.5407],
    ],
  },
  "Free State": {
    center: [-28.4541, 26.7968],
    bounds: [
      [-30.6705, 24.3657],
      [-26.2377, 29.7859],
    ],
  },
  "KwaZulu-Natal": {
    center: [-28.5306, 30.8958],
    bounds: [
      [-30.9171, 28.8074],
      [-26.1441, 32.8935],
    ],
  },
  Gauteng: {
    center: [-26.2708, 28.1123],
    bounds: [
      [-26.9037, 27.304],
      [-25.638, 29.1076],
    ],
  },
  Mpumalanga: {
    center: [-25.5653, 30.5279],
    bounds: [
      [-27.0403, 28.9714],
      [-24.0903, 32.1347],
    ],
  },
  Limpopo: {
    center: [-23.4013, 29.4179],
    bounds: [
      [-25.4387, 26.4178],
      [-22.1259, 31.8859],
    ],
  },
  "North West": {
    center: [-26.6639, 25.2837],
    bounds: [
      [-28.1204, 22.6493],
      [-25.2074, 27.9183],
    ],
  },
};

// Helper function to get province color based on value
export function getProvinceColor(value, maxValue, baseColor = "#818CF8") {
  if (!value) return "#E5E7EB";
  const opacity = Math.min(0.2 + (value / maxValue) * 0.8, 1);
  return `${baseColor}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

// Helper function to get province center coordinates
export function getProvinceCenter(province) {
  return provinceFeatures[province]?.center || [-28.4793, 24.6727]; // South Africa center as fallback
}

// Helper function to get province bounds
export function getProvinceBounds(province) {
  return provinceFeatures[province]?.bounds;
}
