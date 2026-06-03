import React from 'react';

interface ProtectedRouteProps {
  user: any;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedRoute({ user, fallback, children }: ProtectedRouteProps) {
  if (!user) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
