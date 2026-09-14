"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

function motionKey(pathname: string) {
  if (/^\/learn\/.+/.test(pathname)) return "/learn-reader";
  return pathname;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={motionKey(pathname)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="h-full md:origin-top"
    >
      {children}
    </motion.div>
  );
}
