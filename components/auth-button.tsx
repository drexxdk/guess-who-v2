import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Suspense } from "react";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return (
    <Suspense>
      {user ? (
        <div className="flex items-center gap-4">
          {/* user */}
          <span className="hidden md:inline">Hey, {user.email}!</span>
          <LogoutButton />
        </div>
      ) : (
        <div className="flex gap-2">
          <Button asChild variant={"outline"}>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      )}
    </Suspense>
  );
}
