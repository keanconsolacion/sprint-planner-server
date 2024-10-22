import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import uuid from "uuid4";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
});

const PORT = 3001;
const log = console.log;

const rooms: Record<string, any> = {};

io.on("connection", (socket) => {
	log("A user connected:", socket.id);

	socket.on("createRoom", (data, callback) => {
		const roomId = uuid();
		socket
			.join(roomId)
			?.then(() => {
				rooms[roomId] = {};
				callback({ status: "ok", message: `Created room ${roomId}`, roomId });
				log(`User created room "${data?.roomName}" with room id "${roomId}"`);
			})
			.catch(() => {
				callback({ status: "error", message: `Create room failed.` });
				log(`Failed to create room "${roomId}"`);
			});
	});

	socket.on("joinRoom", (roomId, callback) => {
		const room = io.sockets.adapter.rooms.get(roomId);
		if (room) {
			socket
				.join(roomId)
				?.then(() => {
					callback({ status: "ok", message: `Joined room: ${roomId}` });
					log(`User ${socket.id} joined room "${roomId}"`);
				})
				.catch(() => {
					callback({ status: "error", message: `Failed to join room ${roomId}` });
					log(`User ${socket.id} failed to join room "${roomId}"`);
				});
		} else {
			callback({ status: "error", message: "Room not found" });
			log(`Room "${roomId}" not found`);
		}
	});

	socket.on("disconnect", () => {
		log("User disconnected:", socket.id);
	});
});

httpServer.listen(PORT, () => {
	log(`Server is running on http://localhost:${PORT}`);
});
