import { useState } from "react";

const JoinForm = ({ socket, roomId, setRoomId, userName, setUserName, setJoin }) => {
  const [focusRoomId, setFocusRoomId] = useState(false);
  const [focusUserName, setFocusUserName] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoin(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-8 sm:p-12 flex flex-col gap-8">
        <h1 className="text-4xl font-extrabold text-white text-center tracking-tight">
          Join a Coding Room
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Room ID */}
          <div className="flex flex-col relative">
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onFocus={() => setFocusRoomId(true)}
              onBlur={() => setFocusRoomId(false)}
              className="p-4 rounded-xl bg-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label
              className={`absolute left-4 transition-all duration-300 text-gray-400
                ${roomId || focusRoomId ? 'top-0 text-xs text-indigo-400' : 'top-4 text-sm'}`}
            >
              Room ID
            </label>
          </div>

          {/* User Name */}
          <div className="flex flex-col relative">
            <input
              type="text"
              placeholder="User Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onFocus={() => setFocusUserName(true)}
              onBlur={() => setFocusUserName(false)}
              className="p-4 rounded-xl bg-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label
              className={`absolute left-4 transition-all duration-300 text-gray-400
                ${userName || focusUserName ? 'top-0 text-xs text-indigo-400' : 'top-4 text-sm'}`}
            >
              User Name
            </label>
          </div>

          <button
            type="submit"
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
          >
            Join Room
          </button>
        </form>

        <p className="text-gray-400 text-center text-sm mt-4">
          Enter your user name and room ID to start collaborating in real-time.
        </p>
      </div>
    </div>
  );
};

export default JoinForm;
