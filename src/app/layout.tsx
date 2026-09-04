import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Provider } from "@/components/ui/provider";

const robotoSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Challenge 4",
  description: "Tech Challenge 4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-br" className={`${robotoSans.variable}`}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
