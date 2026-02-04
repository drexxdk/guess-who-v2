"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    time_limit_seconds: 15,
    options_count: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error: insertError } = await supabase.from("groups").insert({
        name: formData.name,
        creator_id: user.id,
        time_limit_seconds: formData.time_limit_seconds,
        options_count: formData.options_count,
      });

      if (insertError) throw insertError;

      router.push("/protected/groups");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Group</CardTitle>
        <CardDescription>
          Set up a new group of people for your Guess Who game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Friends, Family, Coworkers"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_limit">
              Time Limit (seconds per question)
            </Label>
            <Input
              id="time_limit"
              type="number"
              min="5"
              max="60"
              value={formData.time_limit_seconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_seconds: parseInt(e.target.value),
                })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              How long players have to answer each question
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="options_count">Number of Options</Label>
            <Input
              id="options_count"
              type="number"
              min="2"
              max="10"
              value={formData.options_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options_count: parseInt(e.target.value),
                })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              How many choices to show per question (2-10)
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
