// Connection status indicator component
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";

const ConnectionStatus: React.FC = () => {
  const { ws } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (ws?.connectionID) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [ws?.connectionID]);

  return (
    <div className="flex justify-start w-full">
      <div className="flex items-start gap-2 ml-4">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? "ws connected" : "ws disconnected"}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
