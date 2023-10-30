export const INFOS = ["name", "state", "last-changed", "last-updated", "none"] as const;
export type Info = (typeof INFOS)[number];
