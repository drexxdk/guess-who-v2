"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();

  // Remove /protected prefix and split into segments
  const pathSegments = (pathname || "")
    .replace(/^\/protected\/?/, "")
    .split("/")
    .filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = [{ label: "Home", href: "/protected" }];

  let currentPath = "/protected";
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    // Skip dynamic segments like [id] or [groupId]
    if (segment.startsWith("[") && segment.endsWith("]")) {
      continue;
    }

    currentPath += `/${segment}`;
    const label =
      segment === "groups"
        ? "Groups"
        : segment === "new"
          ? "New"
          : segment === "game"
            ? "Game"
            : segment === "host"
              ? "Host"
              : segment === "play"
                ? "Play"
                : segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  // Don't show breadcrumbs if we're only at /protected
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="mb-6">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-primary hover:underline">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
