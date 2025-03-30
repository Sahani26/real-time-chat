import React from 'react';

const RoomSelector = ({ rooms, currentRoom, onChangeRoom }) => {
  return (
    <div className="room-selector">
      {rooms.map((room) => (
        <button
          key={room}
          className={room === currentRoom ? 'active' : ''}
          onClick={() => onChangeRoom(room)}
          aria-label={`Join ${room} room`}
        >
          {room}
        </button>
      ))}
    </div>
  );
};

export default RoomSelector;