import { useEffect, useState } from "react";
import ChatMessages from "../components/ChatMessages.tsx";
import ChatChannels from "../components/ChatChannels.tsx";
import { User } from "../types";

interface UserChatProps {
  user: User | null;
}

const UserChat = ({ user }: UserChatProps) => {
  const [selectedChannel, setSelectedChannel] = useState("");

  useEffect(() => {
    setSelectedChannel("");
  }, [user]);

  const handleChannelSelect = (channelId: string) => {
    // Handle channel selection
    setSelectedChannel(channelId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex space-x-4">
        <ChatChannels
          user={user}
          onChannelSelect={handleChannelSelect}
          selectedChannelId={selectedChannel}
        />
        {selectedChannel && (
          <ChatMessages channelId={selectedChannel} user={user} />
        )}
      </div>
    </div>
  );
};

export default UserChat;
