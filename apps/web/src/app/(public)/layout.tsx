import Header from "@/components/header";

const PublicLayout = ({ children }: LayoutProps<"/">) => (
  <div className="grid h-svh grid-rows-[auto_1fr]">
    <Header />
    {children}
  </div>
);

export default PublicLayout;
