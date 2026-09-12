import "@/assets/styles/globals.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <title>M.H.Mostafa | Portfolio</title>
      </head>
      <body
        className="min-h-full flex flex-col bg-[#0E100F]"
        cz-shortcut-listen="true"
      >
        {children}
      </body>
    </html>
  );
}
