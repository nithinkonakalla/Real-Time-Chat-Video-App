export const RoomList = ({ rooms, activeRoomId, onSelect }) => (
  <aside className="room-list">
    <h3>Rooms</h3>
    {rooms.map((room) => (
      <button
        key={room._id}
        className={room._id === activeRoomId ? 'room active' : 'room'}
        onClick={() => onSelect(room)}
      >
        <div>{room.isGroup ? `# ${room.name}` : room.members.map((m) => m.name).join(', ')}</div>
      </button>
    ))}
  </aside>
);
