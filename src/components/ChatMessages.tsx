import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../contexts/AuthContext.tsx";
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ADMIN_API_BASE_URL } from "../constants";
import {User} from "../types";

const MessageIcon = () => (
    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

interface ChatMessage {
    id: string;
    content: string;
    created_at: string;
    src_user_id: string;
    dst_user_id: string;
}

interface ChatMessagesProps {
    channelId: string;
    user: User | null;
}

const ChatMessages = ({ channelId, user }: ChatMessagesProps) => {
    const { accessToken } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [messagesError, setMessagesError] = useState<Error | undefined>();

    const oldestMessageTimeRef = useRef<string | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isInitialLoadRef = useRef(true);
    const previousScrollHeightRef = useRef<number>(0);

    const fetchInitialMessages = async () => {
        try {
            setIsLoadingMessages(true);
            setMessagesError(undefined);

            const response = await fetch(`${ADMIN_API_BASE_URL}/users/chat_messages/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    chat_channel_id: channelId,
                    limit: 20,
                    // Not specifying 'before' parameter to get newest messages
                }),
            });

            const data = await response.json();
            const newMessages = data.chat_messages;

            if (newMessages.length > 0) {
                // Set oldest message time to the oldest message in the set
                const sortedMessages = newMessages.sort((a: ChatMessage, b: ChatMessage) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                oldestMessageTimeRef.current = sortedMessages[0].created_at;
                setMessages(sortedMessages);
            }

            setHasMoreMessages(data.has_more);
        } catch (error) {
            console.error('Error fetching initial messages:', error);
            setMessagesError(error as Error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const fetchOlderMessages = async () => {
        if (!hasMoreMessages || isLoadingMessages || !oldestMessageTimeRef.current) return;

        try {
            setIsLoadingMessages(true);
            setMessagesError(undefined);

            if (messagesContainerRef.current) {
                previousScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            }

            const response = await fetch(`${ADMIN_API_BASE_URL}/users/chat_messages/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${accessToken}`
                },
                body: JSON.stringify({
                    chat_channel_id: channelId,
                    before: oldestMessageTimeRef.current,
                    limit: 20
                }),
            });

            const data = await response.json();
            const olderMessages = data.chat_messages;

            if (olderMessages.length > 0) {
                // Sort older messages newest to oldest
                const sortedOlderMessages = olderMessages.sort((a: ChatMessage, b: ChatMessage) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                oldestMessageTimeRef.current = sortedOlderMessages[0].created_at;

                setMessages(prev => {
                    const existingMessageIds = new Set(prev.map(msg => msg.id));
                    const uniqueOlderMessages = sortedOlderMessages.filter(
                        (msg: ChatMessage) => !existingMessageIds.has(msg.id)
                    );
                    // Add older messages at the start of the array
                    return [...uniqueOlderMessages, ...prev];
                });
            }

            setHasMoreMessages(data.has_more);
        } catch (error) {
            console.error('Error fetching older messages:', error);
            setMessagesError(error as Error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        setMessages([]);
        oldestMessageTimeRef.current = null;
        setHasMoreMessages(true);
        isInitialLoadRef.current = true;
        previousScrollHeightRef.current = 0;
        fetchInitialMessages();
    }, [channelId]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (isInitialLoadRef.current && messages.length > 0) {
            // Scroll to bottom on initial load
            container.scrollTop = container.scrollHeight;
            isInitialLoadRef.current = false;
        } else if (previousScrollHeightRef.current > 0) {
            // When loading older messages, maintain relative scroll position
            const newScrollHeight = container.scrollHeight;
            const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
            container.scrollTop = container.scrollTop + scrollDiff;
            previousScrollHeightRef.current = 0;
        }
    }, [messages]);

    const [scrollRef] = useInfiniteScroll({
        loading: isLoadingMessages,
        hasNextPage: hasMoreMessages,
        onLoadMore: fetchOlderMessages,
        disabled: !!messagesError,
        rootMargin: '0px 0px 400px 0px',
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const LoadingIndicator = () => (
        <div className="flex justify-center items-center p-4">
            <LoadingSpinner />
        </div>
    );

    return (
        <div className="flex flex-col h-[70vh] bg-white  max-w-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <MessageIcon />
                    <h2 className="text-lg font-medium">Chat Messages</h2>
                </div>
            </div>
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto"
            >
                {(isLoadingMessages || hasMoreMessages) && (
                    <div ref={scrollRef}>
                        <LoadingIndicator />
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 last:mb-0 px-4 ${
                            message.src_user_id === user?.id ? 'flex justify-end' : 'flex justify-start'
                        }`}
                    >
                        <div
                            className={`inline-block max-w-[70%] rounded-lg p-3 shadow-sm ${
                                message.src_user_id === user?.id ? 'bg-blue-300 text-white' : 'bg-gray-200'
                            }`}
                        >
                            <p className="text-gray-900 break-words">{message.content}</p>
                            <span className="text-xs text-black mt-1 block">
                                {formatDate(message.created_at)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatMessages;