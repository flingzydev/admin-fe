import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../contexts/AuthContext.tsx";
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ADMIN_API_BASE_URL } from "../constants";
import {User} from "../types";

const ChannelIcon = () => (
    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

interface ChatChannelOtherUserPair {
    chat_channel: {
        id: string;
        last_message_content: string;
        last_message_at: string;
        updated_at: string;
    };
    other_user: {
        username: string;
        metadata: {
            bio?: string;
        };
    };
}

interface ChatChannelsProps {
    onChannelSelect: (channelId: string) => void;
    selectedChannelId?: string;
    user: User | null;
}

const ChatChannels = ({ onChannelSelect, selectedChannelId, user }: ChatChannelsProps) => {
    const { accessToken } = useAuth();
    const [channels, setChannels] = useState<ChatChannelOtherUserPair[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | undefined>();

    const lastUpdatedTimeRef = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchChannels = async (before?: string) => {
        try {
            setIsLoading(true);
            setError(undefined);

            const response = await fetch(`${ADMIN_API_BASE_URL}/users/chat_channels/list?user_id=${user?.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    limit: 20,
                    chat_channel_list_type: 'all',
                    cursor_last_message_at: before || new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch channels');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching channels:', error);
            setError(error as Error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInitialChannels = async () => {
        const data = await fetchChannels();
        if (data) {
            const sortedChannels = data.chat_channel_other_user_pairs.sort((a: ChatChannelOtherUserPair, b: ChatChannelOtherUserPair) =>
                new Date(b.chat_channel.updated_at).getTime() - new Date(a.chat_channel.updated_at).getTime()
            );

            if (sortedChannels.length > 0) {
                lastUpdatedTimeRef.current = sortedChannels[sortedChannels.length - 1].chat_channel.updated_at;
            }

            setChannels(sortedChannels);
            setHasMore(data.has_more);
        }
    };

    const fetchMoreChannels = async () => {
        if (!hasMore || isLoading || !lastUpdatedTimeRef.current) return;

        const data = await fetchChannels(lastUpdatedTimeRef.current);
        if (data) {
            const newChannels = data.chat_channel_other_user_pairs;
            if (newChannels.length > 0) {
                const sortedNewChannels = newChannels.sort((a: ChatChannelOtherUserPair, b: ChatChannelOtherUserPair) =>
                    new Date(b.chat_channel.updated_at).getTime() - new Date(a.chat_channel.updated_at).getTime()
                );

                lastUpdatedTimeRef.current = sortedNewChannels[sortedNewChannels.length - 1].chat_channel.updated_at;

                setChannels(prev => {
                    const existingIds = new Set(prev.map(channel => channel.chat_channel.id));
                    const uniqueNewChannels = sortedNewChannels.filter(
                        (channel: ChatChannelOtherUserPair) => !existingIds.has(channel.chat_channel.id)
                    );
                    return [...prev, ...uniqueNewChannels];
                });
            }
            setHasMore(data.has_more);
        }
    };

    useEffect(() => {
        setChannels([]);
        lastUpdatedTimeRef.current = null;
        setHasMore(true);
        fetchInitialChannels();
    }, []);

    const [scrollRef] = useInfiniteScroll({
        loading: isLoading,
        hasNextPage: hasMore,
        onLoadMore: fetchMoreChannels,
        disabled: !!error,
        rootMargin: '0px 0px 400px 0px',
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const truncateMessage = (message: string) => {
        return message.length > 50 ? message.substring(0, 47) + '...' : message;
    };

    return (
        <div className="flex flex-col h-[70vh] w-72 bg-white border rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <ChannelIcon />
                    <h2 className="text-lg font-medium">Chat Channels</h2>
                </div>
            </div>
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto"
            >
                {channels.map((channel) => (
                    <div
                        key={channel.chat_channel.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedChannelId === channel.chat_channel.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => onChannelSelect(channel.chat_channel.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{channel.other_user.username}</h3>
                                {channel.chat_channel.last_message_content && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {truncateMessage(channel.chat_channel.last_message_content)}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500">
                                    {formatDate(channel.chat_channel.last_message_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {(isLoading || hasMore) && (
                    <div ref={scrollRef} className="flex justify-center items-center p-4">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatChannels;