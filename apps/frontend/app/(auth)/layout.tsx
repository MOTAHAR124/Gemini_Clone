export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-fuchsia-500 to-blue-700 p-3 sm:p-4">
      {children}
    </main>
  );
}
