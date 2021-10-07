import { FastifyPluginAsync } from "fastify";

declare module "socket.io" {
  interface Socket {
    key: string;
  }
}

const WorkspaceEventsController: FastifyPluginAsync = async (app, opts) => {
  app.io
    .use((socket, next) => {
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

              return next();
            } else {
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
      socket.on("start", async (data) => {
        if (typeof data === "string") {
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
                set: Date.now(),
              },
              elapsedTime:
                old_data.status !== "PAUSED" ? { set: 0 } : undefined,
            },
          });

          app.io.to(socket.key).emit("timer:update:" + data, update_response);
          return;
        }
      });

      socket.on("pause", async (data) => {
        if (typeof data === "string") {
          const old_data = await app.prisma.timer.findUnique({
            where: {
              id: data,
            },
          });

          if (!old_data || old_data.status !== "STARTED") return;

          const res = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "PAUSED",
              elapsedTime: {
                set: Date.now() - old_data.time,
              },
            },
          });

          app.io.to(socket.key).emit("timer:update:" + data, res);
        }
      });

      socket.on("stop", async (data) => {
        if (typeof data === "string") {
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

          const res = await app.prisma.timer.update({
            where: {
              id: data,
            },
            data: {
              status: "STOPPED",
              elapsedTime: {
                set: Date.now() - old_data.time,
              },
            },
          });

          app.io.to(socket.key).emit("timer:update:" + data, res);
        }
      });

      socket.on("reset", async (data) => {
        if (typeof data === "string") {
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
              time: { set: Date.now() },
            },
          });

          app.io.to(socket.key).emit("timer:update:" + data, res);
        }
      });
    });

  return;
};

export default WorkspaceEventsController;
