"use client";

import { useEffect } from "react";
import { hydrateFromServer } from "@/lib/remote-sync";

export function DataSync() {
  useEffect(() => {
    void hydrateFromServer();
  }, []);
  return null;
}
