"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCSidebarProps {
  items: TOCItem[];
}

export function TOCSidebar({ items }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* TOC Sidebar */}
      <aside
        className={cn(
          "fixed top-20 right-6 w-64 h-[calc(100vh-8rem)] overflow-y-auto z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
        )}
      >
        <nav className="p-4 rounded-xl border border-border bg-card shadow-lg">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
            Nesta página
          </h2>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
                    activeId === item.id
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
