import { FastifyPluginAsync } from "fastify";
import humanId from "human-id";
import {
  GetWorkspaceError,
  GetWorkspaceParams,
  GetWorkspaceResponse,
  NewWorkspaceBody,
  NewWorkspaceResponse,
  UpdateWorkspaceBody,
  UpdateWorkspaceError,
  UpdateWorkspaceParams,
  UpdateWorkspaceResponse,
} from "./workspace-routedef";

// Prefix "/workspace"
const WorkspaceRouteController: FastifyPluginAsync = async (app, opts) => {
  app.get<{
    Params: GetWorkspaceParams;
    Reply: GetWorkspaceResponse | GetWorkspaceError;
  }>(
    "/:id",
    {
      schema: {
        description: "Get workspace by id",
        tags: ["Workspace"],
        params: GetWorkspaceParams,
        response: {
          200: GetWorkspaceResponse,
          404: GetWorkspaceError,
        },
      },
    },
    async (req, res) => {
      const workspace = await app.prisma.workspace.findUnique({
        where: { id: req.params.id },
      });

      if (workspace) return res.code(200).send(workspace);

      return res.code(404).send({ code: 404, message: "Workspace not found" });
    }
  );

  app.post<{ Body: NewWorkspaceBody; Reply: NewWorkspaceResponse }>(
    "/",
    {
      // Limit new workspace for one user to be once every 5 minutes
      preHandler: app.rateLimit({
        max: 1,
        timeWindow: "5m",
      }),
      schema: {
        description: "Create a new workspace",
        tags: ["Workspace"],
        body: NewWorkspaceBody,
        response: {
          201: NewWorkspaceResponse,
        },
      },
    },
    async (req, res) => {
      const new_workspace_id = humanId("-");
      const new_workspace = await app.prisma.workspace.create({
        data: {
          ...req.body,
          id: new_workspace_id,
          lastUsed: Date.now(),
          timers: {
            create: {
              id: new_workspace_id + ":" + humanId("-"),
              elapsedTime: 0,
              status: "RESET",
              time: Date.now(),
              title: req.body.title + " Default Clock",
            },
          },
        },
      });

      return res.code(201).send(new_workspace);
    }
  );

  app.put<{
    Params: UpdateWorkspaceParams;
    Body: UpdateWorkspaceBody;
    Reply: UpdateWorkspaceResponse | UpdateWorkspaceError;
  }>(
    "/:id",
    {
      schema: {
        description: "Update an existing workspace by id",
        tags: ["Workspace"],
        params: UpdateWorkspaceParams,
        body: UpdateWorkspaceBody,
        response: {
          200: UpdateWorkspaceResponse,
          404: UpdateWorkspaceError,
        },
      },
    },
    async (req, res) => {
      const workspace = await app.prisma.workspace.findUnique({
        where: { id: req.params.id },
      });

      if (!workspace)
        return res
          .code(404)
          .send({ code: 404, message: "Workspace not found" });

      const updated_workspace = await app.prisma.workspace.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
        },
      });

      app.io
        .in(req.params.id)
        .emit("workspace:update:" + req.params.id, workspace);

      return res.code(200).send(updated_workspace);
    }
  );

  return;
};

export default WorkspaceRouteController;
