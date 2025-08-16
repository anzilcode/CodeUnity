import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Play, Users, X } from "lucide-react"; 

const EditorRoom = ({ socket, roomId, userName, setJoin, setRoomId, setUserName }) => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState("*");

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const copyId = () => navigator.clipboard.writeText(roomId);

  const handleLanguage = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit("languageChange", { roomId, language: newLang });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoin(false);
    setRoomId("");
    setUserName("");
    setCode("");
  };

  const runCode = () => socket.emit("compileCode", { code, roomId, language, version });

  useEffect(() => {
    const handleLeave = () => socket.emit("leaveRoom");
    window.addEventListener("beforeunload", handleLeave);
    return () => window.removeEventListener("beforeunload", handleLeave);
  }, []);

  useEffect(() => {
    const handleUserJoined = (users) => setUsers(users);

    socket.on("userJoined", handleUserJoined);
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("userTyping", (user) => {
      setTyping(`${user} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", setLanguage);
    socket.on("codeResponse", (response) => setOutput(response.run.output));

    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, [socket]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="md:w-1/4 w-full bg-gray-800 p-6 flex flex-col gap-6 shadow-lg rounded-xl">
        {/* Room Info */}
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-1 font-bold text-lg text-indigo-400">
            <Users size={18} /> Room Code:
          </h2>
          <button
            onClick={copyId}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg text-white font-medium text-sm transition"
          >
            <Copy size={16} /> Copy
          </button>
        </div>
        <p className="text-gray-300 truncate">{roomId}</p>

        {/* Users List */}
        <div>
          <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-1">
            <Users size={16} /> Users in Room
          </h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {users.map((user, id) => (
              <li
                key={id}
                className={`px-2 py-1 rounded flex items-center justify-between ${
                  user === userName ? "bg-indigo-700 font-bold" : "bg-gray-700"
                }`}
              >
                {user}
                {user === userName && <span className="text-xs text-gray-300">(You)</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* Typing Indicator */}
        {typing && <p className="text-gray-300 italic text-sm">{typing}</p>}

        {/* Language Selector */}
        <div>
          <label className="block text-indigo-400 mb-1">Language</label>
          <select
            className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={language}
            onChange={handleLanguage}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Leave Room */}
        <button
          onClick={leaveRoom}
          className="mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-pink-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300"
        >
          <X size={16} /> Leave Room
        </button>
      </div>

      {/* Editor & Output */}
      <div className="md:w-3/4 w-full flex flex-col h-screen">
        <Editor
          height="70%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: true,
            parameterHints: { enabled: true },
            tabCompletion: "on",
            autoClosingBrackets: "always",
          }}
        />

        {/* Run Button */}
        <div className="flex justify-end mt-2">
          <button
            onClick={runCode}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg shadow transition-all duration-300"
          >
            <Play size={16} /> Run
          </button>
        </div>

        {/* Output */}
        <textarea
          readOnly
          placeholder="Output"
          value={output}
          className="mt-2 w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default EditorRoom;
