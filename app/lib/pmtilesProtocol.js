import { addProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";

let ready = false;

export function ensurePmtilesProtocol() {
  if (ready || typeof window === "undefined") return;
  const protocol = new Protocol();
  addProtocol("pmtiles", protocol.tile);
  ready = true;
}
