import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

import fastify from "fastify";

import fastifyCors from "fastify-cors";
import fastifyRateLimit from "fastify-rate-limit";
import fastifySwagger from "fastify-swagger";

import WorkspaceEventsController from "./controller/events/workspace";
import WorkspaceRouteController from "./controller/route/workspace";
import TimerController from "./controller/route/timer";

const app = fastify({
  logger: {
    prettyPrint: true,
    level: "debug",
  },
});

// Declare types for socket.io and prisma decoration to fastify
declare module "fastify" {
  interface FastifyInstance {
    io: Server;
    prisma: PrismaClient;
  }
}

const registerPlugins = async () => {
  // Decorate fastify with socket.io
  app.decorate(
    "io",
    new Server(app.server, {
      cors: {
        // Note : Change CORS Setting on production
        origin: "*",
      },
    })
  );

  // Connect prisma to database before decorating fastify
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate("prisma", prisma);

  await app.register(fastifyCors, {
    // Note : Change CORS Setting on production
    origin: "*",
  });

  // Rate limit backend to prevent flooding
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "20s",
    allowList: ["127.0.0.0", "localhost"],
    keyGenerator: (req) =>
      req.headers["x-real-ip"]?.toString() ||
      req.headers["x-client-ip"]?.toString() ||
      req.ips?.toString() ||
      req.ip,
  });

  await app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: "/docs",
    swagger: {
      info: {
        title: "Timer Kelompok 2 API",
        version: "0.0.1",
      },
      tags: [
        { name: "Workspace", description: "Workspace APIs" },
        { name: "Timer", description: "Timer APIs" },
      ],
    },
  });

  // Prevent route guessing and preventing 404 flooding
  app.setNotFoundHandler(
    {
      preHandler: app.rateLimit({
        max: 5,
        timeWindow: 5000,
      }),
    },
    async (req, res) => {
      res.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "The resources you're trying to reach are not found",
      });
    }
  );

  // Before shutdown disconnect and clean all resources
  app.addHook("onClose", async () => {
    app.io.close();
    await app.prisma.$disconnect();
  });

  // Register Controller
  await app.register(WorkspaceEventsController);

  await app.register(WorkspaceRouteController, { prefix: "/workspace" });
  await app.register(TimerController, { prefix: "/timer" });
};

registerPlugins()
  .then(() => {
    app.listen(3001, "0.0.0.0");
  })
  .catch((err) => {
    console.error(err);
    console.trace(err);
  });
