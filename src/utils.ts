import { Room, UpdateRoomType, User, VotingState } from "./commons";

export const generateRoomObject = (roomId: string, roomName: string, pointValues: string[]): Room => ({
	id: roomId,
	roomName,
	votingState: VotingState.INITIAL,
	pointValues,
	users: {},
	createdOn: new Date().toISOString(),
});

export const generateUser = (id: string, name: string, isHost: boolean, avatarSrc: string): User => ({
	id,
	name,
	isHost,
	avatarSrc,
	data: {},
	createdOn: new Date().toISOString(),
});

export const updateRoomState = (room: Room, updateType: UpdateRoomType): Room => {
	return {
		...room,
		users:
			updateType === UpdateRoomType.START_VOTING
				? Object.keys(room.users).reduce((acc, key) => {
						acc[key] = { ...room.users[key], data: {} };
						return acc;
				  }, {} as Record<string, User>)
				: room.users,
		votingState: updateType === UpdateRoomType.START_VOTING ? VotingState.STARTED : VotingState.ENDED,
		updatedOn: new Date().toISOString(),
	};
};

export const appendUserToRoom = (room: Room, user: User): Room => {
	return {
		...room,
		users: { ...room.users, [user.id]: user },
	};
};

export const removeUserFromRoom = (room: Room, userId: string): Room => {
	const { [userId]: user, ...users } = room.users;
	return {
		...room,
		users,
	};
};
