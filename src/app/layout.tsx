import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

const robotoSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Challenge 3",
  description: "Tech Challenge 3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-br" className={`${robotoSans.variable}`} suppressHydrationWarning>
      <body>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
