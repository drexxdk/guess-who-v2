"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

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
    const { channelName, table, schema = "public", event = "*", filter, onEvent } = config;

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
      .on("postgres_changes", subscriptionConfig, (payload) => {
        onEvent(payload as RealtimePostgresChangesPayload<T>);
      })
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

      channel = channel.on("postgres_changes", subscriptionConfig, (payload) => {
        onEvent(payload as RealtimePostgresChangesPayload<T>);
      });
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
