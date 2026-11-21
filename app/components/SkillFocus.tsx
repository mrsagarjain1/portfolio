"use client";

/**
 * "Follow a skill". Click a skill in About, or a tag on a project or a role, and
 * everything that uses it stays bright while the rest dims, and the matching tags
 * turn red. Click it again, press Escape or use the Clear button to put it back.
 * With a mouse, hovering a tag or skill shows the same thing until you move away.
 *
 * Only opacity and colour change, and only on the cards and tags involved.
 * Without a provider nothing is followed and everything shows normally, so each
 * piece also works on its own.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { tagMatches, usesTerm } from "../lib/focus";

interface FocusState {
  /** What is being shown right now: a hovered term, else the pinned one, else nothing. */
  term: string | null;
  /** The term that stays on after the pointer leaves, if any. */
  pinned: string | null;
  /** Show a term while the pointer is over it. Pass null when it leaves. */
  preview: (term: string | null) => void;
  /** Pin a term, or unpin it if it is already pinned. */
  toggle: (term: string) => void;
  clear: () => void;
}

const NO_FOCUS: FocusState = {
  term: null,
  pinned: null,
  preview: () => {},
  toggle: () => {},
  clear: () => {},
};

const FocusContext = createContext<FocusState>(NO_FOCUS);

function useFocus(): FocusState {
  return useContext(FocusContext);
}

/** A small note, pinned to the bottom of the screen, that says what is being followed. */
function FocusPill() {
  const { pinned, clear } = useFocus();

  useEffect(() => {
    if (!pinned) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") clear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned, clear]);

  if (!pinned) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[100] flex w-max max-w-[calc(100vw-7.5rem)] -translate-x-1/2 items-center gap-3 border border-[#222524] bg-key px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-key-ink shadow-[0_3px_#222524]"
    >
      <span>
        Showing where I used <span className="text-red">{pinned}</span>
      </span>
      <button
        type="button"
        onClick={clear}
        className="shrink-0 underline underline-offset-4 hover:text-red"
      >
        Clear
      </button>
    </div>
  );
}

export function SkillFocusProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  // Clicking the pinned term again lets go of it. The pointer is still over it, so
  // its hover preview is dropped too; otherwise the page would stay dimmed until the
  // pointer moved away. Moving off and back on previews it again.
  const toggle = useCallback(
    (term: string) => {
      if (pinned === term) {
        setPinned(null);
        setHovered(null);
      } else {
        setPinned(term);
      }
    },
    [pinned],
  );
  const clear = useCallback(() => {
    setPinned(null);
    setHovered(null);
  }, []);

  const value = useMemo<FocusState>(
    () => ({ term: hovered ?? pinned, pinned, preview: setHovered, toggle, clear }),
    [hovered, pinned, toggle, clear],
  );

  return (
    <FocusContext.Provider value={value}>
      {children}
      <FocusPill />
    </FocusContext.Provider>
  );
}

/** Pointer handlers shared by everything that can be followed. Touch has no hover, so only a mouse previews. */
function useFollow(term: string) {
  const { preview, toggle } = useFocus();
  return {
    onClick: () => toggle(term),
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") preview(term);
    },
    onPointerLeave: () => preview(null),
  };
}

interface FocusTargetProps {
  as?: "article" | "li" | "div";
  id?: string;
  className?: string;
  /** The tags this project or role carries. With none, it never dims, because it says nothing either way. */
  tags: readonly string[];
  children: ReactNode;
}

/** A project or a role. It dims while a term is shown that it does not use. */
export function FocusTarget({ as: Element = "div", tags, className = "", children, ...rest }: FocusTargetProps) {
  const { term } = useFocus();
  const dim = term !== null && tags.length > 0 && !usesTerm(term, tags);

  return (
    <Element
      {...rest}
      data-dim={dim ? "true" : undefined}
      className={`${className} transition-opacity duration-200 ${dim ? "opacity-30" : ""}`}
    >
      {children}
    </Element>
  );
}

interface FocusTagProps {
  tag: string;
  className?: string;
  /** Classes added while the tag matches what is shown, to set the colour for the section's background. */
  litClassName?: string;
}

/** A tag on a project or role. Click to follow it, or hover to preview. */
export function FocusTag({ tag, className = "", litClassName = "text-red" }: FocusTagProps) {
  const { term, pinned } = useFocus();
  const follow = useFollow(tag);
  const lit = term !== null && tagMatches(term, tag);

  return (
    <button
      type="button"
      aria-pressed={pinned === tag}
      title={`Show everything that uses ${tag}`}
      className={`${className} cursor-pointer underline-offset-4 transition-colors hover:underline ${
        lit ? `${litClassName} underline` : ""
      }`}
      {...follow}
    >
      {tag}
    </button>
  );
}

/** A skill in About that can be followed. */
export function SkillChip({ skill, className = "" }: { skill: string; className?: string }) {
  const { term, pinned } = useFocus();
  const follow = useFollow(skill);
  const on = term === skill;

  return (
    <button
      type="button"
      aria-pressed={pinned === skill}
      title={`Show where I used ${skill}`}
      className={`${className} cursor-pointer transition-colors hover:bg-text hover:text-paper ${
        on ? "bg-text text-paper" : ""
      }`}
      {...follow}
    >
      {skill}
    </button>
  );
}
