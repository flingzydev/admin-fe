import { User } from '../types';
import {useEffect, useState} from "react";
import TabButton from "./TabButton.tsx";
import UserInfo from "./UserInfo.tsx";
import UserChat from "./UserChat.tsx";

interface UserCardProps {
    user?: User | null;
}

type TabType = 'info' | 'chat';

const UserCard = ({ user }: UserCardProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('info');

    useEffect(() => {
        setActiveTab('info')
    }, [user]);

    if (!user) return null;

    return (

        <div className="bg-white rounded-xl shadow-lg">
            <div className="mb-6 flex gap-2">
                <TabButton
                    active={activeTab === 'info'}
                    onClick={() => setActiveTab('info')}
                >
                    Info
                </TabButton>
                <TabButton
                    active={activeTab === 'chat'}
                    onClick={() => setActiveTab('chat')}
                >
                    Chat
                </TabButton>
            </div>
            {activeTab == 'info' && <UserInfo user={user}/>}
            {activeTab == 'chat' && <UserChat user={user}/>}
        </div>
    );
};

export default UserCard;