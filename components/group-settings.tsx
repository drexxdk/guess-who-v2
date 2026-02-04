"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GroupSettingsProps {
  groupId: string;
  initialGroup: {
    id: string;
    name: string;
    time_limit_seconds: number;
    options_count: number;
  };
}

export function GroupSettings({ groupId, initialGroup }: GroupSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(
    Number(initialGroup.time_limit_seconds) || 30,
  );
  const [optionsCount, setOptionsCount] = useState<number>(
    Number(initialGroup.options_count) || 4,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("groups")
        .update({
          time_limit_seconds: timeLimitSeconds,
          options_count: optionsCount,
        })
        .eq("id", groupId);

      if (updateError) throw updateError;

      setSuccess(true);
      setIsEditing(false);

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTimeLimitSeconds(initialGroup.time_limit_seconds);
    setOptionsCount(initialGroup.options_count);
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="time-limit">Time limit per question (seconds)</Label>
          <Input
            id="time-limit"
            type="number"
            min="5"
            max="120"
            value={String(timeLimitSeconds)}
            onChange={(e) =>
              setTimeLimitSeconds(parseInt(e.target.value) || 30)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="options-count">Options per question</Label>
          <Input
            id="options-count"
            type="number"
            min="2"
            max="4"
            value={String(optionsCount)}
            onChange={(e) => setOptionsCount(parseInt(e.target.value) || 4)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
            size="sm"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm">
        <span className="font-medium">Time limit:</span> {timeLimitSeconds}{" "}
        seconds
      </p>
      <p className="text-sm">
        <span className="font-medium">Options per question:</span>{" "}
        {optionsCount}
      </p>
      {success && (
        <p className="text-sm text-green-600">Settings saved successfully!</p>
      )}
      <Button
        onClick={() => setIsEditing(true)}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        Edit Settings
      </Button>
    </div>
  );
}
