"use client";

import type { ReactNode } from "react";
import { useSession } from "@/modules/auth/ui";
import { UpgradeStartProvider } from "@/modules/releases/ui";
import { FollowsProvider, useFollows } from "./follows-provider";

// The Technology page is cached (ISR), so nothing personal arrives from the server: who is looking is
// read here, and the whole page is wrapped so the Follow in the header and the Upgrade Path lower down
// read the same follows.
//
// The wrapping never changes shape, only whom it is for: the session arrives after the first paint,
// and a provider that appeared at that moment would take the whole page down and build it again,
// closing every open release note with it. A Visitor gets the same shape with nobody in it.
export function TechnologyScope({ technologyId, children }: { technologyId: string; children: ReactNode }) {
  const session = useSession();

  return (
    <FollowsProvider developerId={session.state === "developer" ? session.developerId : null}>
      <DeclaredStart technologyId={technologyId}>{children}</DeclaredStart>
    </FollowsProvider>
  );
}

// The one place that turns a declaration into the Upgrade Path's default start: the path itself knows
// nothing about follows, it only reads a start somebody declared (`UpgradeStartProvider`).
function DeclaredStart({ technologyId, children }: { technologyId: string; children: ReactNode }) {
  return <UpgradeStartProvider start={useFollows().currentVersionOf(technologyId)}>{children}</UpgradeStartProvider>;
}
