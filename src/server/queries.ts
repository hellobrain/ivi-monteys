/**
 * Cached read layer for the public site (Next.js Cache Components).
 * Every function tags its entry with CONTENT_TAG; CMS writes call
 * updateTag(CONTENT_TAG) so readers see published changes immediately.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db/client";
import * as repo from "@/server/repo/public";

export const CONTENT_TAG = "content";

function mark(tag: string, life: "hours" | "minutes" = "hours") {
  cacheTag(CONTENT_TAG, tag);
  if (life === "minutes") cacheLife("minutes");
  else cacheLife("hours");
}

export async function getHomeData() {
  "use cache";
  mark("home");
  return repo.getHomeData(getDb());
}

export async function listAnimals(filters: repo.AnimalFilters) {
  "use cache";
  mark("animals");
  return repo.listAnimals(getDb(), filters);
}

export async function getAnimalFilterOptions() {
  "use cache";
  mark("animals");
  return repo.getAnimalFilterOptions(getDb());
}

export async function getAnimal(slug: string) {
  "use cache";
  mark(`animal:${slug}`);
  return repo.getAnimal(getDb(), slug);
}

export async function getLegend(slug: string) {
  "use cache";
  mark(`legend:${slug}`);
  return repo.getLegend(getDb(), slug);
}

export async function listSymbols() {
  "use cache";
  mark("symbols");
  return repo.listSymbols(getDb());
}

export async function getSymbol(slug: string) {
  "use cache";
  mark(`symbol:${slug}`);
  return repo.getSymbol(getDb(), slug);
}

export async function listBlocks() {
  "use cache";
  mark("curriculum");
  return repo.listBlocks(getDb());
}

export async function getBlock(slug: string) {
  "use cache";
  mark("curriculum");
  return repo.getBlock(getDb(), slug);
}

export async function getLesson(blockSlug: string, lessonSlug: string) {
  "use cache";
  mark("curriculum");
  return repo.getLesson(getDb(), blockSlug, lessonSlug);
}

export async function listManuscripts() {
  "use cache";
  mark("atlas");
  return repo.listManuscripts(getDb());
}

export async function getManuscript(slug: string) {
  "use cache";
  mark("atlas");
  return repo.getManuscript(getDb(), slug);
}

export async function listArtworks() {
  "use cache";
  mark("atlas");
  return repo.listArtworks(getDb());
}

export async function getArtwork(slug: string) {
  "use cache";
  mark("atlas");
  return repo.getArtwork(getDb(), slug);
}

export async function getComparison(slug: string) {
  "use cache";
  mark("atlas");
  return repo.getComparison(getDb(), slug);
}

export async function listComparisons() {
  "use cache";
  mark("atlas");
  return repo.listComparisons(getDb());
}

export async function getTimeline() {
  "use cache";
  mark("atlas");
  return repo.getTimeline(getDb());
}

export async function getPlaces() {
  "use cache";
  mark("atlas");
  return repo.getPlaces(getDb());
}

export async function listPrimarySources() {
  "use cache";
  mark("library");
  return repo.listPrimarySources(getDb());
}

export async function listBibliography() {
  "use cache";
  mark("library");
  return repo.listBibliography(getDb());
}

export async function listGlossary() {
  "use cache";
  mark("library");
  return repo.listGlossary(getDb());
}

export async function listPublicImages() {
  "use cache";
  mark("library");
  return repo.listPublicImages(getDb());
}

export async function searchAll(q: string) {
  "use cache";
  mark("search", "minutes");
  return repo.searchAll(getDb(), q);
}
