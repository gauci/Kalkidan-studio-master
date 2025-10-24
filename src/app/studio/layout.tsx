import { ProtectedRoute } from "@/components/shared/protected-route";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin" strictMode={true}>
      {children}
    </ProtectedRoute>
  );
}