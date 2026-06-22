import { useEffect, useRef, useState } from "react";
import type { useBackground } from "../state/useBackground";
import { BackgroundPicker } from "./BackgroundPicker";

interface AppMenuProps {
  background: ReturnType<typeof useBackground>;
}

export function AppMenu({ background }: AppMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="app-menu" ref={ref}>
      <button
        type="button"
        className="app-menu-trigger"
        aria-label="App menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
      {open && (
        <div className="app-menu-panel">
          <BackgroundPicker background={background} />
        </div>
      )}
    </div>
  );
}
