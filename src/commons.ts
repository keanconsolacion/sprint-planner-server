export type ServerCallbackProps<T> = {
	status: "ok" | "error";
	message: string;
	eventType?: UpdateRoomEvent;
	data?: T;
};

export type GenericMapping = Record<string, unknown>;

export type Room = {
	id: string;
	roomName: string;
	votingState: VotingState;
	pointValues: string[];
	users: Record<string, User>;
	createdOn: string;
	updatedOn?: string;
};

export type User = {
	id: string;
	name: string;
	isHost: boolean;
	data: GenericMapping;
	avatarSrc: string;
	createdOn: string;
};

export type CreateRoomResponseObject = {
	room: Room;
};

export enum PointValuesType {
	SCRUM = "SCRUM",
	FIBB = "FIBB",
	INCREMENTAL = "INCREMENTAL",
	HALF_INCREMENTAL = "HALF_INCREMENTAL",
}

export const PointValues: Record<PointValuesType, string[]> = {
	[PointValuesType.FIBB]: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "100"],
	[PointValuesType.SCRUM]: ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "70", "100"],
	[PointValuesType.INCREMENTAL]: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
	[PointValuesType.HALF_INCREMENTAL]: ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5"],
};

export enum VotingState {
	INITIAL = "INITIAL", // Initial phase of room.
	STARTED = "STARTED", // User voting phase.
	ENDED = "ENDED", // Voting ended, users can see result.
}

export enum UpdateRoomType {
	START_VOTING = 'START_VOTING',
	END_VOTING = 'END_VOTING',
}

export enum UpdateRoomEvent {
	VOTING_STARTED = "VOTING_STARTED",
	VOTING_ENDED = "VOTING_ENDED",
	USER_VOTED = "USER_VOTED",
	USER_CREATED_ROOM = "USER_CREATED_ROOM",
	USER_JOINED_ROOM = "USER_JOINED_ROOM",
	USER_LEFT_ROOM = "USER_LEFT_ROOM",
}
