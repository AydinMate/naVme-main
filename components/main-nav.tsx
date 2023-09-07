"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/app/${params.customerId}`,
      label: "Home",
      active: pathname === `/app/${params.customerId}`,
    },
    {
      href: `/app/${params.customerId}/settings`,
      label: "Settings",
      active: pathname.startsWith(`/app/${params.customerId}/settings`),
    },
    {
      href: `/app/${params.customerId}/support`,
      label: "Support",
      active: pathname.startsWith(`/app/${params.customerId}/support`),
    }
  ];
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colours hover:text-primary",
            route.active
              ? "text-primary"
              : "text-secondary-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
