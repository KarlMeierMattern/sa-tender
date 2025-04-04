import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import topoJson from "./public/topojson-file.json";

const MapChart = () => {
  return (
    <ComposableMap>
      <Geographies geography={topoJson}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
    </ComposableMap>
  );
};

export default MapChart;
