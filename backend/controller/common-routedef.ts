import { Static, Type } from "@sinclair/typebox";

export const ErrorMessage = Type.Object({
  code: Type.Number(),
  message: Type.String(),
});
export type ErrorMessage = Static<typeof ErrorMessage>;
