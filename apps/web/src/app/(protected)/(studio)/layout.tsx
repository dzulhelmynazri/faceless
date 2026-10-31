const StudioLayout = ({ children }: LayoutProps<"/">) => (
  <main className="mx-auto min-h-screen max-w-4xl bg-background p-4 md:p-6 lg:p-8">
    {children}
  </main>
);

export default StudioLayout;
