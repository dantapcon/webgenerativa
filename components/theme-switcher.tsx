"use client";

import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
    // Forzar siempre el tema claro
    setTheme('light');
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  // Solo mostrar el icono de sol (tema claro) sin dropdown
  return (
    <Button variant="ghost" size={"sm"} disabled>
      <Sun
        key="light"
        size={ICON_SIZE}
        className={"text-muted-foreground"}
      />
    </Button>
  );
};

export { ThemeSwitcher };
