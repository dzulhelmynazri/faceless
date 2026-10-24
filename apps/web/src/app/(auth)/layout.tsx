const AuthLayout = ({ children }: LayoutProps<"/">) => (
  <div className="flex min-h-svh items-center justify-center p-4">
    {children}
  </div>
);

export default AuthLayout;
