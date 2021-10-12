import { FastifyPluginAsync } from "fastify";

declare module "socket.io" {
  interface Socket {
    key: string;
  }
}

const WorkspaceEventsController: FastifyPluginAsync = async (app, opts) => {
  app.io
    .use((socket, next) => {
      app.log.debug(`Someone connecting...`);

      const {
        handshake: { auth },
      } = socket;

      if (auth.key && typeof auth.key === "string") {
        app.prisma.workspace
          .count({
            where: { id: auth.key },
          })
          .then((val) => {
            if (val > 0) {
              socket.join(auth.key);
              socket.key = auth.key;

              app.log.debug(`Someone from workspace ${auth.key} has joined!`);
              return next();
            } else {
              app.log.debug(
                `Someone trying to join ${auth.key} which does not exist`
              );
              return next(new Error("Room not found"));
            }
          })
          .catch((err) => {
            app.log.error(err);
            return next(new Error("Server error"));
          });
      }
    })
    .on("connection", (socket) => {
      app.log.debug(`Connected!`);

      socket.on("start", async (data) => {
        if (typeof data === "string") {
          app.log.debug(`Timer ${data} is starting`);

          const old_data = await app.prisma.timer.findUnique({
            where: {
              id: data,
            },
          });

          if (!old_data || old_data.status === "STARTED") return;

          const update_response = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "STARTED",
              time: {
                set: Math.round(Date.now() / 1000),
              },
              elapsedTime:
                old_data.status !== "PAUSED" ? { set: 0 } : undefined,
            },
          });

          app.log.debug(`Start of ${data} done, new state`);
          app.log.debug(JSON.stringify(update_response, null, 4));

          app.io.to(socket.key).emit("timer:update", update_response);
          return;
        }
      });

      socket.on("pause", async (data) => {
        if (typeof data === "string") {
          app.log.debug(`Timer ${data} is pausing`);

          const old_data = await app.prisma.timer.findUnique({
            where: {
              id: data,
            },
          });

          if (!old_data || old_data.status !== "STARTED") return;

          const new_elapsed_time =
            Math.round(Date.now() / 1000) - old_data.time;

          const res = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "PAUSED",
              elapsedTime: {
                set:
                  old_data.elapsedTime > new_elapsed_time
                    ? old_data.elapsedTime
                    : new_elapsed_time,
              },
            },
          });

          app.log.debug(`Pause of ${data} done, new state`);
          app.log.debug(JSON.stringify(res, null, 4));

          app.io.to(socket.key).emit("timer:update", res);
        }
      });

      socket.on("stop", async (data) => {
        if (typeof data === "string") {
          app.log.debug(`Timer ${data} is stopping`);

          const old_data = await app.prisma.timer.findUnique({
            where: {
              id: data,
            },
          });

          if (
            !old_data ||
            old_data.status === "STOPPED" ||
            old_data.status === "RESET"
          )
            return;

          const new_elapsed_time =
            Math.round(Date.now() / 1000) - old_data.time;

          const res = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "STOPPED",
              elapsedTime: {
                set:
                  old_data.elapsedTime > new_elapsed_time
                    ? old_data.elapsedTime
                    : new_elapsed_time,
              },
            },
          });

          app.log.debug(`Stop of ${data} done, new state`);
          app.log.debug(JSON.stringify(res, null, 4));

          app.io.to(socket.key).emit("timer:update", res);
        }
      });

      socket.on("reset", async (data) => {
        if (typeof data === "string") {
          app.log.debug(`Timer ${data} is reseting`);

          const old_data = await app.prisma.timer.findUnique({
            where: {
              id: data,
            },
          });

          if (!old_data || old_data.status === "RESET") return;

          const res = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "RESET",
              elapsedTime: { set: 0 },
              time: { set: Math.round(Date.now() / 1000) },
            },
          });

          app.log.debug(`Stop of ${data} done, new state`);
          app.log.debug(JSON.stringify(res, null, 4));

          app.io.to(socket.key).emit("timer:update", res);
        }
      });
    });

  return;
};

export default WorkspaceEventsController;
