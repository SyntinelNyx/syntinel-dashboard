"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ThemeToggle = () => {
  const { setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-[300px] w-full max-w-3xl gap-4">
      <Card
        className="flex h-48 w-96 transform cursor-pointer flex-col overflow-hidden shadow-xl transition-transform duration-200 hover:scale-105"
        onClick={() => setTheme("system")}
      >
        <CardHeader className="p-4">
          <h3 className="text-center">System</h3>
        </CardHeader>
        <CardContent className="relative flex-grow p-0">
          <Image
            src={
              systemTheme === "dark"
                ? "/dark-mode-skeleton.png"
                : "/light-mode-skeleton.png"
            }
            alt={`System ${systemTheme} mode`}
            layout="fill"
          />
        </CardContent>
      </Card>
      <Card
        className="flex h-48 w-96 transform cursor-pointer flex-col overflow-hidden shadow-xl transition-transform duration-200 hover:scale-105"
        onClick={() => setTheme("light")}
      >
        <CardHeader className="p-4">
          <h3 className="text-center">Light</h3>
        </CardHeader>
        <CardContent className="relative flex-grow p-0">
          <Image
            src="/light-mode-skeleton.png"
            alt="Light mode"
            layout="fill"
          />
        </CardContent>
      </Card>
      <Card
        className="flex h-48 w-96 transform cursor-pointer flex-col overflow-hidden shadow-xl transition-transform duration-200 hover:scale-105"
        onClick={() => setTheme("dark")}
      >
        <CardHeader className="p-4">
          <h3 className="text-center">Dark</h3>
        </CardHeader>
        <CardContent className="relative flex-grow p-0">
          <Image src="/dark-mode-skeleton.png" alt="Dark mode" layout="fill" />
        </CardContent>
      </Card>
    </div>
  );
};
