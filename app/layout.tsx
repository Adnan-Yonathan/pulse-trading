import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Pulse Trades",
	description: "Daily trading performance leaderboard for Whop communities",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Only wrap with WhopApp if environment variables are available
	const hasWhopConfig = process.env.NEXT_PUBLIC_WHOP_APP_ID && process.env.WHOP_API_KEY;
	
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				{hasWhopConfig ? (
					<WhopApp>{children}</WhopApp>
				) : (
					<div className="min-h-screen bg-robinhood-black">
						{children}
					</div>
				)}
			</body>
		</html>
	);
}
