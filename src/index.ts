import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import uuid from "uuid4";
import { appendUserToRoom, generateRoomObject, generateUser, removeUserFromRoom, updateRoomState } from "./utils";
import { Room, ServerCallbackProps, UpdateRoomEvent, UpdateRoomType } from "./commons";
import { instrument } from "@socket.io/admin-ui";
import { isEmpty } from "lodash-es";
const { log } = console;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		credentials: true,
	},
});

instrument(io, {
	auth: false,
});

const PORT = 3000;

const socketIdToUserData: Record<string, { roomId: string; userId: string; nickname: string }> = {};
const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
	log("A user connected:", socket.id);
	log("Rooms: ", io.sockets.adapter.rooms);

	socket.on(
		"createRoom",
		(
			data: { nickname: string; pointValues: string[]; userId: string; roomName: string; avatarSrc: string },
			callback: (props: ServerCallbackProps<{ room: Room }>) => void
		) => {
			const { nickname, pointValues, userId, roomName, avatarSrc } = data;
			const roomId = uuid();

			socket.join(roomId);

			const room = generateRoomObject(roomId, roomName, pointValues);
			room.users[userId] = generateUser(userId, nickname, true, avatarSrc);

			rooms[roomId] = room;

			callback({
				status: "ok",
				message: `User "${nickname}" has created the room.`,
				data: { room },
				eventType: UpdateRoomEvent.USER_CREATED_ROOM,
			});
			log(`User ${userId} created room "${data?.roomName}" with room id "${roomId}"`);
			socketIdToUserData[socket.id] = { userId, roomId, nickname };
		}
	);

	socket.on(
		"joinRoom",
		(
			roomId: string,
			userId: string,
			nickname: string,
			avatarSrc,
			callback: (props: ServerCallbackProps<Room>) => void
		) => {
			const room = io.sockets.adapter.rooms.get(roomId);
			const roomData = rooms[roomId];

			if (!room) {
				callback?.({ status: "error", message: `Socket room not found: ${roomId}` });
				log(`Error: User ${userId} failed to update room ${roomId}. Socket room not found.`);
				return;
			}

			if (!roomData) {
				callback?.({ status: "error", message: `Room data not found: ${roomId}` });
				log(`Room data of "${roomId}" not found`);
				return;
			}

			socket.join(roomId);
			rooms[roomId] = appendUserToRoom(rooms[roomId], generateUser(userId, nickname, false, avatarSrc));
			io.to(roomId).emit("updateRoom", {
				status: "ok",
				message: `User "${nickname}" has joined the room.`,
				data: rooms[roomId],
				eventType: UpdateRoomEvent.USER_JOINED_ROOM,
			});
			callback({
				status: "ok",
				message: `User "${nickname}" has joined the room.`,
				data: rooms[roomId],
				eventType: UpdateRoomEvent.USER_JOINED_ROOM,
			});
			log(`User ${userId} joined room "${roomId}"`);
			socketIdToUserData[socket.id] = { userId, roomId, nickname };
		}
	);

	socket.on(
		"updateRoom",
		(
			roomId: string,
			userId: string,
			updateType: UpdateRoomType,
			callback?: (props: ServerCallbackProps<Room>) => void
		) => {
			const room = io.sockets.adapter.rooms.get(roomId);
			const roomData = rooms[roomId];

			if (!room) {
				callback?.({ status: "error", message: `Socket room not found: ${roomId}` });
				log(`Error: User ${userId} failed to update room ${roomId}. Socket room not found.`);
				return;
			}

			if (!roomData) {
				callback?.({ status: "error", message: `Room data not found: ${roomId}` });
				log(`Error: User ${userId} failed to update room ${roomId}. Room data not found.`);
				return;
			}

			if (updateType === UpdateRoomType.START_VOTING && roomData.votingState === "STARTED") {
				callback?.({ status: "error", message: `Room already in voting state: ${roomId}` });
				log(`Error: User ${userId} failed to update room ${roomId}. Room already in voting state.`);
				return;
			}

			if (updateType === UpdateRoomType.END_VOTING && roomData.votingState === "ENDED") {
				callback?.({ status: "error", message: `Room already ended voting: ${roomId}` });
				log(`Error: User ${userId} failed to update room ${roomId}. Room already ended voting.`);
				return;
			}

			rooms[roomId] = updateRoomState(rooms[roomId], updateType);
			io.to(roomId).emit("updateRoom", {
				status: "ok",
				message: `${socketIdToUserData[socket.id].nickname} ${
					updateType === UpdateRoomType.START_VOTING ? "initiated" : "ended"
				} voting.`,
				data: rooms[roomId],
				eventType:
					updateType === UpdateRoomType.START_VOTING ? UpdateRoomEvent.VOTING_STARTED : UpdateRoomEvent.VOTING_ENDED,
			});
			callback?.({ status: "ok", message: `Updated room: ${roomId}`, data: rooms[roomId] });
			log(`User ${userId} updated room "${roomId}"`);
		}
	);

	socket.on("vote", (roomId: string, userId: string, point: string, callback) => {
		const room = io.sockets.adapter.rooms.get(roomId);
		const roomObj = rooms[roomId];

		if (!room) {
			callback?.({ status: "error", message: `Socket room not found: ${roomId}` });
			log(`Error: User ${userId} failed to vote in room ${roomId}. Socket room not found.`);
			return;
		}

		if (!roomObj) {
			callback?.({ status: "error", message: `Room data not found: ${roomId}` });
			log(`Error: User ${userId} failed to vote in room ${roomId}. Room data not found.`);
			return;
		}

		if (roomObj.votingState !== "STARTED") {
			callback?.({ status: "error", message: `Room not in voting state: ${roomId}` });
			log(`Error: User ${userId} failed to vote in room ${roomId}. Room not in voting state.`);
			return;
		}

		if (!rooms[roomId].users[userId]) {
			callback?.({ status: "error", message: `User not found in room: ${roomId}` });
			log(`Error: User ${userId} failed to vote in room ${roomId}. User not found in room.`);
			return;
		}

		rooms[roomId].users[userId].data = { point, votedOn: new Date().toISOString() };

		if (Object.values(rooms[roomId].users).every(({ data }) => !isEmpty(data))) {
			rooms[roomId] = updateRoomState(rooms[roomId], UpdateRoomType.END_VOTING);
			io.to(roomId).emit("updateRoom", {
				status: "ok",
				message: `Voting completed. All users have voted.`,
				data: rooms[roomId],
				eventType: UpdateRoomEvent.VOTING_ENDED,
			});
			return;
		}

		const voteCount = Object.values(rooms[roomId].users).filter(({ data }) => !isEmpty(data)).length;

		io.to(roomId).emit("updateRoom", {
			status: "ok",
			message: `${socketIdToUserData[socket.id].nickname} voted. (${voteCount}/${
				Object.keys(rooms[roomId].users).length
			})`,
			data: rooms[roomId],
			eventType: UpdateRoomEvent.USER_VOTED,
		});
		callback?.({
			status: "ok",
			message: `${socketIdToUserData[socket.id].nickname} voted. (${voteCount}/${
				Object.keys(rooms[roomId].users).length
			})`,
			data: rooms[roomId],
			eventType: UpdateRoomEvent.USER_VOTED,
		});
		log(`User ${userId} voted in room "${roomId}"`);
	});

	socket.on("disconnect", () => {
		const { roomId, userId, nickname } = socketIdToUserData[socket.id] ?? {};
		if (roomId && userId && nickname) {
			rooms[roomId] = removeUserFromRoom(rooms[roomId], userId);
			io.emit("updateRoom", {
				status: "ok",
				message: `User "${nickname}" left the room.`,
				data: rooms[roomId],
				eventType: UpdateRoomEvent.USER_LEFT_ROOM,
			});
			log(`User ${userId} left room "${roomId}"`);
		}
		log("A user disconnected:", socket.id);
	});
});

httpServer.listen(PORT, () => {
	log(`Server is running on http://localhost:${PORT}`);
});
