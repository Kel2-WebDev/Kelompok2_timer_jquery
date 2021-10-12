import { Type, Static } from "@sinclair/typebox";
import { ErrorMessage } from "../common-routedef";

/**
 * Prefix /workspace
 */

export const Workspace = Type.Object({
  id: Type.String(),
  title: Type.String({ minLength: 5, maxLength: 15 }),
  description: Type.String({ minLength: 5, maxLength: 50 }),
  lastUsed: Type.Integer(),
});
export type Workspace = Static<typeof Workspace>;

/* GET /:id */
export const GetWorkspaceParams = Type.Object({
  id: Type.String(),
});
export type GetWorkspaceParams = Static<typeof GetWorkspaceParams>;

export const GetWorkspaceResponse = Workspace;
export type GetWorkspaceResponse = Static<typeof GetWorkspaceResponse>;

export const GetWorkspaceError = ErrorMessage;
export type GetWorkspaceError = ErrorMessage;

/* POST / */
export const NewWorkspaceBody = Type.Omit(Workspace, ["id", "lastUsed"]);
export type NewWorkspaceBody = Static<typeof NewWorkspaceBody>;

export const NewWorkspaceResponse = Workspace;
export type NewWorkspaceResponse = Workspace;

/* PUT /:id */
export const UpdateWorkspaceParams = Type.Object({
  id: Type.String(),
});
export type UpdateWorkspaceParams = Static<typeof UpdateWorkspaceParams>;

export const UpdateWorkspaceBody = Type.Optional(
  Type.Omit(Workspace, ["id", "lastUsed"])
);
export type UpdateWorkspaceBody = Static<typeof UpdateWorkspaceBody>;

export const UpdateWorkspaceResponse = Workspace;
export type UpdateWorkspaceResponse = Workspace;

export const UpdateWorkspaceError = ErrorMessage;
export type UpdateWorkspaceError = ErrorMessage;
