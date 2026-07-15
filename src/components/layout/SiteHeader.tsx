"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const NO_HEADER_PREFIXES = ["/auth/"];

export default function SiteHeader() {
  const pathname = usePathname();

  if (pathname && NO_HEADER_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return <Header />;
}
