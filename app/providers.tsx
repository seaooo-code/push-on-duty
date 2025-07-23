"use client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import type React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<HeroUIProvider>
			<ToastProvider placement="top-right" />
			{children}
		</HeroUIProvider>
	);
}
