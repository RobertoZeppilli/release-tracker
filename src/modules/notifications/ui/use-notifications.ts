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

// The bell's data, read in the browser (see `notifications-store`). Nothing is asked for while
// `developerId` is null, which is both a visitor and the instant before the browser knows which of
// the two it is talking to: a visitor has no Notifications and the request would be refused anyway.
export function useNotifications(developerId: string | null): Notifications {
  const [feed, setFeed] = useState<Feed>(EMPTY_FEED);
  const [counted, setCounted] = useState(false);
  const [listed, setListed] = useState(false);
  // Asked for, not arrived: a panel opened and closed twice must not read the list twice, and the
  // flag cannot be the state above, which is only true once the rows are there.
  const asked = useRef(false);

  // ⚠️ Nothing here resets what a previous Developer's session had read, and nothing has to: the
  // bell is rendered under `key={developerId}`, so another Developer is another instance of this
  // hook rather than this one asked to forget. A reset written as `setState` in the effect below is
  // also what the React Compiler lint refuses, and rightly: it is a cascading render for a state
  // that a key expresses without one.
  useEffect(() => {
    if (developerId === null) return;
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
  }, [developerId]);

  const open = useCallback(() => {
    if (developerId === null || asked.current) return;
    asked.current = true;
    void fetchFeed()
      .then((items) => {
        setFeed((held) => ({ ...held, items }));
        setListed(true);
      })
      .catch(() => {
        asked.current = false;
      });
  }, [developerId]);

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
