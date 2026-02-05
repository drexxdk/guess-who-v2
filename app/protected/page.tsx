import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProtectedPageClient } from "@/components/protected-page-client";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's active game sessions
  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*, groups(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(3);

  const activeSessions = sessions || [];

  return <ProtectedPageClient activeSessions={activeSessions} />;
}
