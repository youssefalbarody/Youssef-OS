export function createProjectSlug(name) {
  const slug = name
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}
