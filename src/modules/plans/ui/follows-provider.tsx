"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { type FollowRejection, rejectionOf } from "../domain/follow-rejection";
import { FOLLOWS_KEY, fetchFollows, writeFollow } from "./follows-store";

export type Follows = {
  count: number;
  atLimit: boolean;
  isFollowing: (technologyId: string) => boolean;
  toggle: (technologyId: string) => void;
  isPending: (technologyId: string) => boolean;
  rejectionOn: (technologyId: string) => FollowRejection | null;
};

const FollowsContext = createContext<Follows | null>(null);

// TanStack Query holds the follows for the whole visit (DECISIONI.md: only here and on the
// Dashboard). On `/technologies` the server already knows them, so the cache starts full and the
// page makes no request; the public Technology page (issue #19) will let the query fetch instead.
export function FollowsProvider({
  developerId,
  follows,
  children,
}: {
  developerId: string;
  follows?: readonly string[];
  children: React.ReactNode;
}) {
  const [client] = useState(() => {
    const created = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: false } },
    });
    if (follows) created.setQueryData(FOLLOWS_KEY, [...follows]);
    return created;
  });

  return (
    <QueryClientProvider client={client}>
      <FollowsScope developerId={developerId}>{children}</FollowsScope>
    </QueryClientProvider>
  );
}

// One mutation for the whole page, not one per row: the row that pressed and the row that shows the
// refusal are two components, and a mutation of its own for each would keep the refusal to itself.
function FollowsScope({ developerId, children }: { developerId: string; children: React.ReactNode }) {
  const client = useQueryClient();
  const { data: follows = [] } = useQuery({ queryKey: FOLLOWS_KEY, queryFn: fetchFollows });

  const mutation = useMutation({
    mutationFn: ({ technologyId, follow }: { technologyId: string; follow: boolean }) =>
      writeFollow(developerId, technologyId, follow),
    // The row answers before the database does; a refusal puts the follows back as they were.
    onMutate: async ({ technologyId, follow }) => {
      await client.cancelQueries({ queryKey: FOLLOWS_KEY });
      const previous = client.getQueryData<string[]>(FOLLOWS_KEY) ?? [];
      const next = follow ? [...previous, technologyId] : previous.filter((id) => id !== technologyId);
      client.setQueryData(FOLLOWS_KEY, next);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(FOLLOWS_KEY, context.previous);
    },
  });

  // One refusal at a time is all a page can hold: the next press starts a mutation and clears it.
  const rejection = rejectionOf(mutation.error);
  const rejected = rejection ? mutation.variables?.technologyId : undefined;
  const following = new Set(follows);

  const value: Follows = {
    count: following.size,
    atLimit: following.size >= FREE_FOLLOW_LIMIT,
    isFollowing: (technologyId) => following.has(technologyId),
    toggle: (technologyId) => mutation.mutate({ technologyId, follow: !following.has(technologyId) }),
    isPending: (technologyId) => mutation.isPending && mutation.variables?.technologyId === technologyId,
    rejectionOn: (technologyId) => (technologyId === rejected ? rejection : null),
  };

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}

export function useFollows(): Follows {
  const follows = useContext(FollowsContext);
  if (!follows) throw new Error("No follows in context: wrap the page in a FollowsProvider.");
  return follows;
}
