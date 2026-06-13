"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.warn("KPM Sunny Daily OS offline mode could not start.", error);
      }
    };

    registerWorker();
  }, []);

  return null;
}
