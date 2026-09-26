"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { FOLLOWS_KEY, fetchFollows, writeFollow } from "./follows-store";

const DeveloperContext = createContext<string | null>(null);

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
      <DeveloperContext.Provider value={developerId}>{children}</DeveloperContext.Provider>
    </QueryClientProvider>
  );
}

export type Follows = {
  count: number;
  isFollowing: (technologyId: string) => boolean;
  toggle: (technologyId: string) => void;
  isPending: (technologyId: string) => boolean;
};

export function useFollows(): Follows {
  const developerId = useContext(DeveloperContext);
  const client = useQueryClient();
  const { data: follows = [] } = useQuery({ queryKey: FOLLOWS_KEY, queryFn: fetchFollows });

  const mutation = useMutation({
    mutationFn: ({ technologyId, follow }: { technologyId: string; follow: boolean }) => {
      if (!developerId) throw new Error("No Developer in context: wrap the page in a FollowsProvider.");
      return writeFollow(developerId, technologyId, follow);
    },
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

  const following = new Set(follows);
  return {
    count: following.size,
    isFollowing: (technologyId) => following.has(technologyId),
    toggle: (technologyId) => mutation.mutate({ technologyId, follow: !following.has(technologyId) }),
    isPending: (technologyId) => mutation.isPending && mutation.variables?.technologyId === technologyId,
  };
}
