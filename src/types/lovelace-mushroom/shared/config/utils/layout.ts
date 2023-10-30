import {literal, union} from "superstruct";

export const layoutStruct = union([literal("horizontal"), literal("vertical"), literal("default")]);
