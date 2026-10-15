"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import {
  type CurrentVersion,
  type Decline,
  declineOf,
  type Follow,
} from "../domain/current-version";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { type FollowRejection, rejectionOf } from "../domain/follow-rejection";
import { FOLLOWS_KEY, fetchFollows, writeCurrentVersion, writeFollow, writeFollows } from "./follows-store";

export type Follows = {
  // Whether the follows are in hand. A page that lets the query fetch them has none for a moment,
  // and `isFollowing` answers false for every Technology until it does: that is not knowing, and a
  // control that reads it must say so rather than state the wrong half (DESIGN.md, The Reserved
  // Space Rule). Nobody signed in has nothing to know, so there the answer is in hand at once.
  known: boolean;
  count: number;
  atLimit: boolean;
  isFollowing: (technologyId: string) => boolean;
  toggle: (technologyId: string) => void;
  isPending: (technologyId: string) => boolean;
  // The tick of the last press on this Technology, and null when the last press was elsewhere: the
  // Toggle that moved a row needs to know the press was its own to take the focus back (issue #64).
  pressedAt: (technologyId: string) => number | null;
  rejectionOn: (technologyId: string) => FollowRejection | null;
  // Following a group is one write, so it answers as one: a refusal belongs to the group and not
  // to any row in it (issue #126, DESIGN.md, Selection Bar).
  followMany: (technologyIds: string[]) => void;
  followingMany: boolean;
  groupRejection: FollowRejection | null;
  // The Version in use, declared on the follow: absent until the Developer declares one.
  currentVersionOf: (technologyId: string) => CurrentVersion | null;
  declare: (technologyId: string, version: string | null) => void;
  isDeclaring: (technologyId: string) => boolean;
  declineOn: (technologyId: string) => Decline | null;
};

const FollowsContext = createContext<Follows | null>(null);

// TanStack Query holds the follows for the whole visit (DECISIONI.md: only here and on the
// Dashboard). On `/technologies` the server already knows them, so the cache starts full and the
// page makes no request; the public Technology page (issue #19) lets the query fetch instead.
//
// `developerId` is null while nobody is signed in, or before the browser knows who is: the provider
// is still there, with no follows and nothing to write. A page that wraps itself in it can then do so
// once and for good, instead of growing the provider around its content the moment the session
// arrives, which would take the content down and build it again.
export function FollowsProvider({
  developerId,
  follows,
  children,
}: {
  developerId: string | null;
  follows?: readonly Follow[];
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
function FollowsScope({ developerId, children }: { developerId: string | null; children: React.ReactNode }) {
  const client = useQueryClient();
  // A tick and not a flag, because pressing the same row twice has to count twice: the row goes
  // back where it came from, and the focus is lost again on the way.
  const [press, setPress] = useState<{ technologyId: string; tick: number } | null>(null);
  const { data: follows = [], isSuccess } = useQuery({
    queryKey: FOLLOWS_KEY,
    queryFn: fetchFollows,
    enabled: developerId !== null,
  });

  const mutation = useMutation({
    mutationFn: ({ technologyId, follow }: { technologyId: string; follow: boolean }) =>
      writeFollow(developerId ?? "", technologyId, follow),
    // The row answers before the database does; a refusal puts the follows back as they were.
    onMutate: async ({ technologyId, follow }) => {
      await client.cancelQueries({ queryKey: FOLLOWS_KEY });
      const previous = client.getQueryData<Follow[]>(FOLLOWS_KEY) ?? [];
      const next = follow
        ? [...previous, { technologyId, currentVersion: null }]
        : previous.filter((row) => row.technologyId !== technologyId);
      client.setQueryData(FOLLOWS_KEY, next);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(FOLLOWS_KEY, context.previous);
    },
  });

  // The group goes in one statement, so the optimistic answer is one too: every selected row is
  // added at once and a refusal puts all of them back. Nothing is followed halfway on either side
  // of the wire, which is what the database already guarantees (see `writeFollows`).
  const group = useMutation({
    mutationFn: (technologyIds: string[]) => writeFollows(developerId ?? "", technologyIds),
    onMutate: async (technologyIds) => {
      await client.cancelQueries({ queryKey: FOLLOWS_KEY });
      const previous = client.getQueryData<Follow[]>(FOLLOWS_KEY) ?? [];
      const held = new Set(previous.map((row) => row.technologyId));
      const added = technologyIds
        .filter((technologyId) => !held.has(technologyId))
        .map((technologyId) => ({ technologyId, currentVersion: null }));
      client.setQueryData(FOLLOWS_KEY, [...previous, ...added]);
      return { previous };
    },
    // The group is put back, and then the follows are read again: a group is refused exactly when
    // the page and the database disagree about how full the Plan is, so what the page believed is
    // the one figure it must not go on to quote (DESIGN.md, Selection Bar).
    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(FOLLOWS_KEY, context.previous);
      void client.invalidateQueries({ queryKey: FOLLOWS_KEY });
    },
  });

  // The declaration is written on its own, without an optimistic answer: the day it stands from is
  // the database's to write (see `writeCurrentVersion`), so the row is worth waiting for.
  const declaration = useMutation({
    mutationFn: ({ technologyId, version }: { technologyId: string; version: string | null }) =>
      writeCurrentVersion(technologyId, version),
    onSuccess: (currentVersion, { technologyId }) => {
      client.setQueryData<Follow[]>(FOLLOWS_KEY, (previous) =>
        (previous ?? []).map((row) => (row.technologyId === technologyId ? { ...row, currentVersion } : row)),
      );
    },
  });

  // One refusal at a time is all a page can hold: the next press starts a mutation and clears it.
  const rejection = rejectionOf(mutation.error);
  const rejected = rejection ? mutation.variables?.technologyId : undefined;
  const decline = declineOf(declaration.error);
  const declined = decline ? declaration.variables?.technologyId : undefined;
  const following = new Map(follows.map((row) => [row.technologyId, row]));

  const value: Follows = {
    known: developerId === null || isSuccess,
    count: following.size,
    atLimit: following.size >= FREE_FOLLOW_LIMIT,
    isFollowing: (technologyId) => following.has(technologyId),
    // Nothing is written for somebody the browser has not identified: no control that could ask for
    // it is on the page, and a write would be refused anyway.
    toggle: (technologyId) => {
      if (!developerId) return;
      setPress((previous) => ({ technologyId, tick: (previous?.tick ?? 0) + 1 }));
      mutation.mutate({ technologyId, follow: !following.has(technologyId) });
    },
    isPending: (technologyId) => mutation.isPending && mutation.variables?.technologyId === technologyId,
    pressedAt: (technologyId) => (press?.technologyId === technologyId ? press.tick : null),
    rejectionOn: (technologyId) => (technologyId === rejected ? rejection : null),
    followMany: (technologyIds) => {
      if (developerId && technologyIds.length > 0) group.mutate(technologyIds);
    },
    followingMany: group.isPending,
    groupRejection: rejectionOf(group.error),
    currentVersionOf: (technologyId) => following.get(technologyId)?.currentVersion ?? null,
    declare: (technologyId, version) => {
      if (developerId) declaration.mutate({ technologyId, version });
    },
    isDeclaring: (technologyId) => declaration.isPending && declaration.variables?.technologyId === technologyId,
    declineOn: (technologyId) => (technologyId === declined ? decline : null),
  };

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}

export function useFollows(): Follows {
  const follows = useContext(FollowsContext);
  if (!follows) throw new Error("No follows in context: wrap the page in a FollowsProvider.");
  return follows;
}
