"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // delay to simulate load
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    loading && (
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-400 dark:to-emerald-300 animate-pulse z-50"></div>
    )
  );
}
