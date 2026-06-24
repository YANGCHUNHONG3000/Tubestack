"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/splash-screen";
import { ConfirmProvider } from "@/components/confirm-modal";
import { PomodoroProvider } from "@/components/widgets/pomodoro-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <PomodoroProvider>
          <SplashScreen />
          {children}
          <Toaster position="bottom-right" />
        </PomodoroProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
