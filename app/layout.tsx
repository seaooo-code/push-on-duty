import "./globals.css";
import Header from "@/app/components/header";
import { Providers } from "@/app/providers";
import type React from "react";
import { Suspense } from "react";

export const metadata = {
	title: "值班推送",
	description: "通过飞书机器人定时推送值班信息",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="zh-CN">
			<head>
				<link rel="icon" href="/logo.png" type="image/png" />
			</head>
			<body>
				<Providers>
					<div className="h-screen w-screen flex flex-col">
						<Header />
						<div className="flex-1 h-0 flex flex-col items-center p-4 overflow-hidden">
							<Suspense>{children}</Suspense>
						</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}
