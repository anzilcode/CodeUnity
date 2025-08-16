import { io } from "socket.io-client";
import { useState } from "react";
import JoinForm from "./Pages/JoinForm";
import EditorRoom from "./Pages/Editor";

const socket = io("http://localhost:5000");

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [join, setJoin] = useState(false);

  return (
    <>
      {!join ? (
        <JoinForm
          socket={socket}
          roomId={roomId}
          setRoomId={setRoomId}
          userName={userName}
          setUserName={setUserName}
          setJoin={setJoin}
        />
      ) : (
        <EditorRoom socket={socket} roomId={roomId} setRoomId={setRoomId}
         userName={userName} setJoin={setJoin} setUserName={setUserName}
        />
      )}
    </>
  );
};

export default App;
