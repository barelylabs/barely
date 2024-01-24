import type { EffectCallback } from "react";
import { useEffect } from "react";

export function useEffectOnce(effect: EffectCallback) {
  useEffect(effect, []);
}
