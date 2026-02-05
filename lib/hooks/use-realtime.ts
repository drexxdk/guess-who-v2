"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

// Re-export the payload type for consumers
export type { RealtimePostgresChangesPayload };

// Helper to safely extract typed data from payload.new
export function getPayloadNew<T extends Record<string, unknown>>(
  payload: RealtimePostgresChangesPayload<T>,
): T | undefined {
  const data = payload.new;
  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return data as T;
  }
  return undefined;
}

// Helper to safely extract typed data from payload.old
export function getPayloadOld<T extends Record<string, unknown>>(
  payload: RealtimePostgresChangesPayload<T>,
): Partial<T> | undefined {
  const data = payload.old;
  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return data as Partial<T>;
  }
  return undefined;
}

interface SubscriptionConfig<T extends Record<string, unknown>> {
  channelName: string;
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  config: SubscriptionConfig<T> | null,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!config) return;

    const supabase = createClient();
    const {
      channelName,
      table,
      schema = "public",
      event = "*",
      filter,
      onEvent,
    } = config;

    const channel = supabase.channel(channelName);

    const subscriptionConfig: {
      event: PostgresChangeEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      subscriptionConfig.filter = filter;
    }

    channel
      .on(
        "postgres_changes",
        subscriptionConfig,
        onEvent as (
          payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
        ) => void,
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [config]);

  return channelRef.current;
}

// Helper for multiple subscriptions on same channel
interface MultiSubscriptionConfig<T extends Record<string, unknown>> {
  channelName: string;
  subscriptions: Array<{
    table: string;
    schema?: string;
    event?: PostgresChangeEvent;
    filter?: string;
    onEvent: (payload: RealtimePostgresChangesPayload<T>) => void;
  }>;
}

export function useMultiRealtimeSubscription<T extends Record<string, unknown>>(
  config: MultiSubscriptionConfig<T> | null,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!config) return;

    const supabase = createClient();
    const { channelName, subscriptions } = config;

    let channel = supabase.channel(channelName);

    for (const sub of subscriptions) {
      const { table, schema = "public", event = "*", filter, onEvent } = sub;

      const subscriptionConfig: {
        event: PostgresChangeEvent;
        schema: string;
        table: string;
        filter?: string;
      } = {
        event,
        schema,
        table,
      };

      if (filter) {
        subscriptionConfig.filter = filter;
      }

      channel = channel.on(
        "postgres_changes",
        subscriptionConfig,
        onEvent as (
          payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
        ) => void,
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [config]);

  return channelRef.current;
}
