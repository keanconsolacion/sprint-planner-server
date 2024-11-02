import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import uuid from "uuid4";
import { generateRoomObject, generateUser } from "./utils";
import { Room } from "./commons";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
});

const PORT = 3001;
const log = console.log;

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
	log("A user connected:", socket.id);

	socket.on("createRoom", (data, callback) => {
		const { nickname, pointValues, userId } = data;
		const roomId = uuid();
		socket.join(roomId);
		const room = generateRoomObject(roomId, pointValues);
		room.users[userId] = generateUser(userId, nickname, true);
		callback({ status: "ok", message: `Created room ${roomId}`, data: { room } });
		log(`User created room "${data?.roomName}" with room id "${roomId}"`);
	});

	socket.on("joinRoom", (roomId, callback) => {
		const room = io.sockets.adapter.rooms.get(roomId);
		if (room) {
			socket.join(roomId);
			callback({ status: "ok", message: `Joined room: ${roomId}` });
			log(`User ${socket.id} joined room "${roomId}"`);
		} else {
			callback({ status: "error", message: "Room not found" });
			log(`Room "${roomId}" not found`);
		}
	});

	socket.on("getRoomData", (roomId, callback) => {
		const room = io.sockets.adapter.rooms.get(roomId);
		const roomObj = rooms[roomId];
		if (room && roomObj) {
			callback({ status: "ok", message: `Got room data.` });
			log(`User ${socket.id} fetched room data with id "${roomId}"`);
		} else {
			callback({ status: "error", message: "Room or room data not found" });
			log(`Failed to fetch room data "${roomId}"`);
		}
	});

	socket.on("disconnect", () => {
		log("User disconnected:", socket.id);
	});
});

httpServer.listen(PORT, () => {
	log(`Server is running on http://localhost:${PORT}`);
});
