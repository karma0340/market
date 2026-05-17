"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Hide navbar and footer when in admin/broker dashboard
    const isUserDashboard = pathname.startsWith('/dashboard/user');
    
    if (!isUserDashboard) {
      document.body.setAttribute('data-dashboard', 'true');
    }
    
    return () => {
      document.body.removeAttribute('data-dashboard');
    };
  }, [pathname]);

  return <>{children}</>;
}
