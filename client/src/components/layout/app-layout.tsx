import { Sidebar } from "./sidebar";
import { useHelpOverlay } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsOverlay } from "@/components/keyboard-shortcuts-overlay";
import { AIAssistantButton } from "@/components/ai-assistant-button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, setIsOpen } = useHelpOverlay();

  return (
    <>
      <KeyboardShortcutsOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <AIAssistantButton />
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export { AppLayout };
