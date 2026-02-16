import { useEffect, useState } from 'react';
import { http } from '../api/http';
import { ChatWindow } from '../components/ChatWindow';
import { RoomList } from '../components/RoomList';
import { VideoPanel } from '../components/VideoPanel';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';

export const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [presenceMap, setPresenceMap] = useState({});
  const { startCall, endCall, shareScreen, localStreamRef, remoteStreamRef } = useWebRTC(activeRoom?._id);

  useEffect(() => {
    const loadRooms = async () => {
      const { data } = await http.get('/rooms');
      setRooms(data.rooms);
      setActiveRoom(data.rooms[0] || null);
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const onPresence = ({ userId, isOnline }) => {
      setPresenceMap((prev) => ({ ...prev, [userId]: isOnline }));
    };

    socket.on('presence:update', onPresence);
    return () => socket.off('presence:update', onPresence);
  }, [socket]);

  return (
    <main className="layout">
      <header>
        <h2>Hi, {user?.name}</h2>
        <p>Status: {presenceMap[user?._id] ?? user?.isOnline ? 'Online' : 'Offline'}</p>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="content">
        <RoomList rooms={rooms} activeRoomId={activeRoom?._id} onSelect={setActiveRoom} />
        {activeRoom ? <ChatWindow room={activeRoom} /> : <p>Select a room</p>}
        {activeRoom && (
          <VideoPanel
            localStreamRef={localStreamRef}
            remoteStreamRef={remoteStreamRef}
            onStart={startCall}
            onEnd={endCall}
            onShare={shareScreen}
          />
        )}
      </div>
    </main>
  );
};
