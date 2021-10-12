import { Type, Static } from "@sinclair/typebox";
import { ErrorMessage } from "../common-routedef";

export const Timer = Type.Object({
  id: Type.String(),
  title: Type.String({ minLength: 5 }),
  status: Type.Union([
    Type.Literal("STARTED"),
    Type.Literal("PAUSED"),
    Type.Literal("STOPPED"),
    Type.Literal("RESET"),
  ]),
  elapsedTime: Type.Integer(),
  time: Type.Integer(),
});
export type Timer = Static<typeof Timer>;

/* GET /workspace/:id */
export const GetWorkspaceTimerParams = Type.Object({
  id: Type.String(),
});
export type GetWorkspaceTimerParams = Static<typeof GetWorkspaceTimerParams>;

export const GetWorkspaceTimerResponse = Type.Array(Timer);
export type GetWorkspaceTimerResponse = Static<
  typeof GetWorkspaceTimerResponse
>;

export const GetWorkspaceTimerError = ErrorMessage;
export type GetWorkspaceTimerError = ErrorMessage;

/* POST /workspace/:id */
export const NewTimerParams = Type.Object({
  id: Type.String(),
});
export type NewTimerParams = Static<typeof NewTimerParams>;

export const NewTimerBody = Type.Pick(Timer, ["title"]);
export type NewTimerBody = Static<typeof NewTimerBody>;

export const NewTimerResponse = Timer;
export type NewTimerResponse = Timer;

export const NewTimerError = ErrorMessage;
export type NewTimerError = ErrorMessage;

/* PUT /workspace/:workspace_id/:timer_id */
export const UpdateTimerParams = Type.Object({
  workspace_id: Type.String(),
  timer_id: Type.String(),
});
export type UpdateTimerParams = Static<typeof UpdateTimerParams>;

export const UpdateTimerBody = Type.Optional(Type.Pick(Timer, ["title"]));
export type UpdateTimerBody = Static<typeof UpdateTimerBody>;

export const UpdateTimerResponse = Timer;
export type UpdateTimerResponse = Timer;

export const UpdateTimerError = ErrorMessage;
export type UpdateTimerError = ErrorMessage;

/* DELETE /workspace/:workspace_id/:timer_id */
export const DeleteTimerParams = Type.Object({
  workspace_id: Type.String(),
  timer_id: Type.String(),
});
export type DeleteTimerParams = Static<typeof DeleteTimerParams>;

export const DeleteTimerError = ErrorMessage;
export type DeleteTimerError = ErrorMessage;
