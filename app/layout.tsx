import { ScrollSpyProvider } from "@/contexts/ScrollSpyContext";
import TrailCursor from "@/components/TrailCursor";
import "@/assets/styles/globals.css";

export const metadata = {
  title: "M.H.Mostafa | Portfolio",
  description: "Here is a portfolio about me!",
};

const MainLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className="min-h-full flex flex-col bg-primary-bg text-primary-white"
        cz-shortcut-listen="true"
      >
        <TrailCursor />
        <ScrollSpyProvider>{children}</ScrollSpyProvider>
      </body>
    </html>
  );
};

export default MainLayout;
