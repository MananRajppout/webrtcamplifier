import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GlobalContextProvider } from "@/context/GlobalContext";
import { DashboardContextProvider } from "@/context/DashboardContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Amplify Research",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <GlobalContextProvider>
          <DashboardContextProvider>
            {children}

          </DashboardContextProvider>
        </GlobalContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
