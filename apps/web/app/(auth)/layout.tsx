export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
