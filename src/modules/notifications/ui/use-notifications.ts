"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_FEED, type Feed, seeAll, seeOne } from "../domain/feed";
import { fetchFeed, fetchUnseen, writeAllSeen, writeSeen } from "./notifications-store";

export type Notifications = Feed & {
  // Whether the number is in hand. Zero and "not read yet" are two states and the bell says
  // different things about them, so the flag is what keeps a wait from reading as "none unseen"
  // (DESIGN.md, The Reserved Space Rule).
  counted: boolean;
  // Whether the list is in hand. The number arrives on its own, on the first paint of a signed-in
  // page; the list is only read when a panel opens, because on most pages it is never opened.
  listed: boolean;
  open: () => void;
  see: (id: string) => void;
  seeEverything: () => void;
};

// The bell's data, read in the browser (see `notifications-store`). It asks from the first render:
// there is one person per installed copy (ADR 0011), so there is no session to wait for and no
// state in which the request would be refused.
export function useNotifications(): Notifications {
  const [feed, setFeed] = useState<Feed>(EMPTY_FEED);
  const [counted, setCounted] = useState(false);
  const [listed, setListed] = useState(false);
  // Asked for, not arrived: a panel opened and closed twice must not read the list twice, and the
  // flag cannot be the state above, which is only true once the rows are there.
  const asked = useRef(false);

  useEffect(() => {
    let active = true;
    void fetchUnseen()
      .then((unseen) => {
        if (!active) return;
        setFeed((held) => ({ ...held, unseen }));
        setCounted(true);
      })
      // A number that could not be read stays unknown: a zero would say there is nothing to read.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const open = useCallback(() => {
    if (asked.current) return;
    asked.current = true;
    void fetchFeed()
      .then((items) => {
        setFeed((held) => ({ ...held, items }));
        setListed(true);
      })
      .catch(() => {
        asked.current = false;
      });
  }, []);

  // The number falls before the database answers, because the press it answers is a press on a row
  // the reader is looking at. A refusal is not guessed at: the number is read again, so what the
  // bell shows is what the database holds rather than what the panel hoped.
  const reread = useCallback(() => {
    void fetchUnseen()
      .then((unseen) => {
        setFeed((held) => ({ ...held, unseen }));
        setCounted(true);
      })
      .catch(() => undefined);
  }, []);

  const see = useCallback(
    (id: string) => {
      setFeed((held) => seeOne(held, id));
      void writeSeen(id).catch(reread);
    },
    [reread],
  );

  const seeEverything = useCallback(() => {
    setFeed((held) => seeAll(held));
    void writeAllSeen().catch(reread);
  }, [reread]);

  return { ...feed, counted, listed, open, see, seeEverything };
}
