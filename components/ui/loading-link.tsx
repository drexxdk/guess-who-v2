"use client";

import Link from "next/link";
import { useLoading } from "@/lib/loading-context";
import { ComponentProps } from "react";

type LoadingLinkProps = ComponentProps<typeof Link>;

export function LoadingLink({ onClick, ...props }: LoadingLinkProps) {
  const { setLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setLoading(true);
    onClick?.(e);
  };

  return <Link {...props} onClick={handleClick} />;
}
