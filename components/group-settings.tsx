"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Group } from "@/lib/schemas";

interface GroupSettingsProps {
  groupId: string;
  initialGroup: Pick<
    Group,
    "id" | "name" | "time_limit_seconds" | "options_count"
  >;
  peopleCount?: number;
  onUpdate?: (
    updatedGroup: Pick<Group, "name" | "time_limit_seconds" | "options_count">,
  ) => void;
  isEditing?: boolean;
  onEditChange?: (isEditing: boolean) => void;
}

export function GroupSettings({
  groupId,
  initialGroup,
  peopleCount = 4,
  onUpdate,
  isEditing: externalIsEditing = false,
  onEditChange,
}: GroupSettingsProps) {
  const [isEditing, setIsEditing] = useState(externalIsEditing);
  const [groupName, setGroupName] = useState<string>(initialGroup.name);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(
    Number(initialGroup.time_limit_seconds) || 30,
  );
  const [optionsCount, setOptionsCount] = useState<number>(
    Number(initialGroup.options_count) || 4,
  );
  const [totalQuestions, setTotalQuestions] = useState<number>(
    Math.min(peopleCount, 10),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync external isEditing prop with local state
  useEffect(() => {
    setIsEditing(externalIsEditing);
  }, [externalIsEditing]);

  // Adjust totalQuestions if peopleCount changes and becomes smaller
  useEffect(() => {
    const maxQuestions = Math.min(peopleCount, 10);
    setTotalQuestions((prev) => Math.min(prev, maxQuestions));
  }, [peopleCount]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("groups")
        .update({
          name: groupName,
          time_limit_seconds: timeLimitSeconds,
          options_count: optionsCount,
        })
        .eq("id", groupId);

      if (updateError) throw updateError;

      setSuccess(true);
      setIsEditing(false);

      // Call the onUpdate callback to sync parent component
      if (onUpdate) {
        onUpdate({
          name: groupName,
          time_limit_seconds: timeLimitSeconds,
          options_count: optionsCount,
        });
      }

      // Notify parent that edit mode is closed
      if (onEditChange) {
        onEditChange(false);
      }

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setGroupName(initialGroup.name);
    setTimeLimitSeconds(initialGroup.time_limit_seconds ?? 30);
    setOptionsCount(initialGroup.options_count ?? 4);
    setIsEditing(false);
    setError(null);
    if (onEditChange) {
      onEditChange(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="group-name">Group name</Label>
          <input
            id="group-name"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm mt-1"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label htmlFor="time-limit">Default time limit per question</Label>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
              {timeLimitSeconds}s
            </span>
          </div>
          <input
            id="time-limit"
            type="range"
            min="5"
            max="120"
            step="1"
            value={timeLimitSeconds}
            onChange={(e) =>
              setTimeLimitSeconds(parseInt(e.target.value) || 30)
            }
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label htmlFor="options-count">Default options per question</Label>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
              {optionsCount}
            </span>
          </div>
          <input
            id="options-count"
            type="range"
            min="2"
            max={Math.min(peopleCount, 10)}
            step="1"
            value={optionsCount}
            onChange={(e) => setOptionsCount(parseInt(e.target.value) || 4)}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label htmlFor="total-questions">Default amount of questions</Label>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
              {totalQuestions}
            </span>
          </div>
          <input
            id="total-questions"
            type="range"
            min="1"
            max={peopleCount}
            step="1"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 1)}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Default time limit per question
        </span>
        <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
          {timeLimitSeconds}s
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Default options per question
        </span>
        <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
          {optionsCount}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Default amount of questions</span>
        <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
          {totalQuestions}
        </span>
      </div>
      {success && (
        <p className="text-sm text-green-600">Settings saved successfully!</p>
      )}
    </div>
  );
}
