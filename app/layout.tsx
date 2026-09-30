import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "重症护理 · 工作体验与需求问卷",
  description: "从一线护理工作出发，了解真实负担与优先改善方向。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className="antialiased">{children}</body></html>;
}
