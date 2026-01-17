"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface MonthContextType {
  month: string;
  setMonth: (month: string) => void;
  formatMonth: (month: string) => string;
}

const MonthContext = createContext<MonthContextType | null>(null);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState("");

  useEffect(() => {
    setMonth(new Date().toISOString().slice(0, 7));
  }, []);

  const formatMonth = (m: string) => {
    const [year, monthNum] = m.split("-");
    const months = [
      "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
  };

  return (
    <MonthContext.Provider value={{ month, setMonth, formatMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error("useMonth must be used within MonthProvider");
  }
  return context;
}
