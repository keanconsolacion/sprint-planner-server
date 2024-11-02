export type ServerCallback<T> = {
	status: "ok" | "error";
	message: string;
	data: T;
};

export type GenericMapping = Record<string, unknown>;

export enum RoomStatus {
	STARTED = "STARTED",
	STANDBY = "STANDBY",
}

export type Room = {
	id: string;
	status: RoomStatus.STANDBY;
	pointValues: string[];
	users: Record<string, User>;
	createdAt: string;
};

export type User = {
	id: string;
	name: string;
	isHost: boolean;
	data: GenericMapping;
};

export type CreateRoomResponseObject = {
	room: Room;
};

export enum PointValuesType {
	SCRUM = "SCRUM",
	FIBB = "FIBB",
	CUSTOM = "CUSTOM",
}

export const DefaultPointValues: Record<PointValuesType, number[]> = {
	[PointValuesType.FIBB]: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100],
	[PointValuesType.SCRUM]: [],
	[PointValuesType.CUSTOM]: [],
};
