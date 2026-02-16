const userSockets = new Map();

export const addSocket = (userId, socketId) => {
  const set = userSockets.get(userId) || new Set();
  set.add(socketId);
  userSockets.set(userId, set);
};

export const removeSocket = (userId, socketId) => {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
};

export const isOnline = (userId) => userSockets.has(userId);
