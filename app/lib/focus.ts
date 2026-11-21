/**
 * Matching rules for the "follow a skill" feature: which tags on a project or a
 * role count as using a skill (or as being the same tag). Framework-free, like
 * the rest of `app/lib`, so it can be covered by plain tests.
 */

import { skillTags } from "./content";

/** A skill or tag label, compared without caring about case or stray spaces. */
export function norm(label: string): string {
  return label.trim().toLowerCase();
}

/** The tags that match a term: a skill chip's own list, or just the term when it is a tag. */
export function tagsFor(term: string): string[] {
  return (skillTags[term] ?? [term]).map(norm);
}

/** True when `tag` is one of the tags that match `term`. */
export function tagMatches(term: string, tag: string): boolean {
  return tagsFor(term).includes(norm(tag));
}

/** True when something carrying these tags uses `term`. */
export function usesTerm(term: string, tags: readonly string[]): boolean {
  return tags.some((tag) => tagMatches(term, tag));
}

/** True for a skill chip that can be followed, which means it has tags to match. */
export function canFollow(skill: string): boolean {
  return (skillTags[skill]?.length ?? 0) > 0;
}
