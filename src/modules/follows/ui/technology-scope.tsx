"use client";

import type { ReactNode } from "react";
import { UpgradeStartProvider } from "@/modules/releases/ui";
import { FollowsProvider, useFollows } from "./follows-provider";

// The Technology page is cached (ISR), so nothing personal arrives from the server: the follows are
// read here, in the browser, and the whole page is wrapped so the Follow in the header and the
// Upgrade Path lower down read the same ones.
//
// The wrapping never changes shape. It used to be the session that could arrive after the first
// paint, and a provider that appeared at that moment would have taken the whole page down and built
// it again, closing every open release note with it; there is no session to wait for since issue
// #210, and the shape stays single for the showcase, where the provider holds nothing (#215).
export function TechnologyScope({ technologyId, children }: { technologyId: string; children: ReactNode }) {
  return (
    <FollowsProvider>
      <DeclaredStart technologyId={technologyId}>{children}</DeclaredStart>
    </FollowsProvider>
  );
}

// The one place that turns a declaration into the Upgrade Path's default start: the path itself knows
// nothing about follows, it only reads a start somebody declared (`UpgradeStartProvider`).
function DeclaredStart({ technologyId, children }: { technologyId: string; children: ReactNode }) {
  return <UpgradeStartProvider start={useFollows().currentVersionOf(technologyId)}>{children}</UpgradeStartProvider>;
}
