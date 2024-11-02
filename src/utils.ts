import { PointValuesType, Room, RoomStatus, User } from "./commons";

export const generateRoomObject = (roomId: string, pointValues: string[]): Room => ({
	id: roomId,
	status: RoomStatus.STANDBY,
	pointValues,
	users: {},
	createdAt: new Date().toISOString(),
});

export const generateUser = (id: string, name: string, isHost: boolean): User => ({
	id,
	name,
	isHost,
	data: {},
});
