import { Metadata } from "next";
import { ComoFuncionaClient } from "./client";

export const metadata: Metadata = {
  title: "Como Funciona | RitualFin",
  description: "Entenda a lógica do RitualFin, as regras de categorização e o impacto em todas as telas.",
};

export default function ComoFuncionaPage() {
  return <ComoFuncionaClient />;
}
