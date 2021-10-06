import { Static, Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import humanId from "human-id";

export const Workspace = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.String(),
  lastUsed: Type.Number(),
});
export type Workspace = Static<typeof Workspace>;

export const NewWorkspaceBody = Type.Omit(Workspace, ["id"]);
export type NewWorkspaceBody = Static<typeof NewWorkspaceBody>;

export const NewWorkspaceResponse = Workspace;
export type NewWorkspaceResponse = Static<typeof NewWorkspaceResponse>;

// Prefix "/workspace"
const WorkspaceRouteController: FastifyPluginAsync = async (app, opts) => {
  app.post<{ Body: NewWorkspaceBody; Reply: NewWorkspaceResponse }>(
    "/new",
    {
      // Limit new workspace for one user to be once every 5 minutes
      preHandler: app.rateLimit({
        max: 1,
        timeWindow: "5m",
      }),
      schema: {
        description: "Create a new workspace",
        body: NewWorkspaceBody,
        response: {
          200: NewWorkspaceResponse,
        },
      },
    },
    async (req, res) => {
      const new_workspace = await app.prisma.workspace.create({
        data: { ...req.body, id: humanId("-") },
      });

      res.send(new_workspace);
    }
  );

  return;
};

export default WorkspaceRouteController;
