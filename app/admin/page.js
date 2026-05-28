"use client";
import { useEffect } from "react";

export default function Admin() {
  useEffect(() => {
    window.location.href = "/?page=admin";
  }, []);
  return (
    <div style={{ background: "#0B0E18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
      <p>Chargement...</p>
    </div>
  );
}