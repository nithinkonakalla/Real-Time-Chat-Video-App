import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import { useSocket } from '../context/SocketContext';

export const ChatWindow = ({ room }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    if (!room) return;
    const load = async () => {
      const { data } = await http.get(`/messages/${room._id}`);
      setMessages(data.messages);
    };
    load();
  }, [room]);

  useEffect(() => {
    if (!socket || !room) return undefined;

    socket.emit('room:join', room._id);

    const onNewMessage = (msg) => {
      if (msg.room === room._id) setMessages((prev) => [...prev, msg]);
    };

    const onTypingStart = ({ roomId, userId }) => {
      if (roomId !== room._id) return;
      setTypingUsers((prev) => new Set(prev).add(userId));
    };

    const onTypingStop = ({ roomId, userId }) => {
      if (roomId !== room._id) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, room]);

  const typingText = useMemo(() => {
    if (!typingUsers.size) return '';
    return `${typingUsers.size} user(s) typing...`;
  }, [typingUsers]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket?.emit('message:send', { roomId: room._id, content: text });
    socket?.emit('typing:stop', { roomId: room._id });
    setText('');
  };

  const onFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post('/messages/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    socket?.emit('message:send', {
      roomId: room._id,
      content: `${data.fileName}`,
      type: 'file',
      fileUrl: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${data.fileUrl}`,
      fileName: data.fileName
    });
  };

  return (
    <section className="chat-window">
      <h3>{room?.name}</h3>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <strong>{msg.sender?.name || 'System'}: </strong>
            {msg.type === 'file' ? (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                {msg.fileName || msg.content}
              </a>
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>
      <small>{typingText}</small>
      <div className="composer">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket?.emit('typing:start', { roomId: room._id });
          }}
          onBlur={() => socket?.emit('typing:stop', { roomId: room._id })}
          placeholder="Type a message"
        />
        <input type="file" onChange={onFile} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </section>
  );
};
