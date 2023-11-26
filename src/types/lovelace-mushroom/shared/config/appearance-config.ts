import {boolean, enums, Infer, object, optional} from "superstruct";
import {layoutStruct} from "./utils/layout";
import {ICON_TYPES, INFOS} from "./utils/info";

export const appearanceSharedConfigStruct = object({
  layout: optional(layoutStruct),
  fill_container: optional(boolean()),
  primary_info: optional(enums(INFOS)),
  secondary_info: optional(enums(INFOS)),
  icon_type: optional(enums(ICON_TYPES)),
});

export type AppearanceSharedConfig = Infer<typeof appearanceSharedConfigStruct>;
