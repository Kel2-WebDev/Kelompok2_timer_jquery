import { FastifyPluginAsync } from "fastify";
import humanId from "human-id";
import {
  DeleteTimerError,
  DeleteTimerParams,
  GetWorkspaceTimerError,
  GetWorkspaceTimerParams,
  GetWorkspaceTimerResponse,
  NewTimerBody,
  NewTimerError,
  NewTimerParams,
  NewTimerResponse,
} from "./timer-routedef";

// Prefix "/timer"
const TimerController: FastifyPluginAsync = async (app, opts) => {
  app.get<{
    Params: GetWorkspaceTimerParams;
    Reply: GetWorkspaceTimerResponse | GetWorkspaceTimerError;
  }>(
    "/:id",
    {
      schema: {
        description: "Get Workspace Timers using Workspace id",
        tags: ["Timer"],
        params: GetWorkspaceTimerParams,
        response: {
          200: GetWorkspaceTimerResponse,
          404: GetWorkspaceTimerError,
        },
      },
    },
    async (req, res) => {
      const workspace = await app.prisma.workspace.findUnique({
        where: { id: req.params.id },
        include: { timers: true },
      });

      if (!workspace)
        return res
          .code(404)
          .send({ code: 404, message: "Workspace not found" });

      return res.code(200).send(workspace.timers);
    }
  );

  app.post<{
    Params: NewTimerResponse;
    Body: NewTimerBody;
    Reply: NewTimerResponse | NewTimerError;
  }>(
    "/workspace/:id",
    {
      schema: {
        description: "Create a new Timer in a workspace",
        tags: ["Timer"],
        params: NewTimerParams,
        body: NewTimerBody,
        response: {
          201: NewTimerResponse,
          403: NewTimerError,
        },
      },
    },
    async (req, res) => {
      const workspace = await app.prisma.workspace.findUnique({
        where: { id: req.params.id },
        include: { timers: true },
      });

      if (!workspace || workspace.timers.length > 20)
        return res
          .code(403)
          .send({ code: 403, message: "You have created too many Timers" });

      const new_timer = {
        ...req.body,
        id: req.params.id + ":" + humanId("-"),
        elapsedTime: 0,
        time: Date.now(),
      };

      await app.prisma.workspace.update({
        where: { id: req.params.id },
        data: {
          timers: {
            create: { ...new_timer, status: "RESET" },
          },
        },
      });

      app.io
        .in(req.params.id)
        .emit("timer:new", { ...new_timer, status: "RESET" });

      return res.code(200).send({ ...new_timer, status: "RESET" });
    }
  );

  app.delete<{
    Params: DeleteTimerParams;
    Reply: undefined | DeleteTimerError;
  }>(
    "/workspace/:workspace_id/:timer_id",
    {
      schema: {
        description: "Remove a timer on a workspace",
        tags: ["Timer"],
        params: DeleteTimerParams,
        response: {
          204: {},
          404: DeleteTimerError,
        },
      },
    },
    async (req, res) => {
      const timer = await app.prisma.timer.findFirst({
        where: {
          id: req.params.timer_id,
          workspaceId: req.params.workspace_id,
        },
      });

      if (!timer)
        return res
          .code(404)
          .send({ code: 404, message: "There no such timer with that id" });

      await app.prisma.timer.delete({
        where: {
          id: req.params.workspace_id,
        },
      });

      app.io
        .in(req.params.workspace_id)
        .emit("timer:delete", req.params.timer_id);

      return res.code(204).send();
    }
  );
  return;
};

export default TimerController;
