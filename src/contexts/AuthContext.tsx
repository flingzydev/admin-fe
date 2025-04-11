import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { API_BASE_URL } from "../constants";

// Types
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface ParsedMessage {
  topic: string;
  data: unknown;
}

interface WebSocketContextValue {
  sendMessage: (message: unknown) => void;
  subscribe: (handler: (message: ParsedMessage) => void) => () => void;
  connectionID: number;
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  ws?: WebSocketContextValue;
  isLoading: boolean;
}

const WS_ERROR_CODES = {
  CONNECTION_LIMIT: 4001,
} as const;

const PING_INTERVAL = 20000;
const PONG_TIMEOUT = 3000;
const STORAGE_KEY = "auth_state";

const AuthContext = createContext<AuthContextType | null>(null);

const getInitialState = (): AuthState => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error("Failed to parse auth state:", error);
      alert("Error loading saved authentication state. Please login again.");
    }
  }
  return {
    isAuthenticated: false,
    accessToken: null,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialState);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnectionID, setWsConnectionID] = useState<number>(0);

  // WebSocket related refs
  const ws = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Set<(message: ParsedMessage) => void>>(
    new Set(),
  );
  const pingInterval = useRef<ReturnType<typeof setInterval>>();
  const pongTimeout = useRef<ReturnType<typeof setTimeout>>();
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempt = useRef(0);
  const operationQueue = useRef<(() => void)[]>([]);
  const isProcessingQueue = useRef(false);

  const processQueue = async () => {
    if (isProcessingQueue.current || operationQueue.current.length === 0) {
      return;
    }
    isProcessingQueue.current = true;
    try {
      const operation = operationQueue.current.shift();
      if (operation) {
        await operation();
      }
    } finally {
      isProcessingQueue.current = false;
      if (operationQueue.current.length > 0) {
        processQueue();
      }
    }
  };

  const queueOperation = (operation: () => void) => {
    operationQueue.current.push(operation);
    processQueue();
  };

  const cleanup = () => {
    try {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = undefined;
      }
      if (pongTimeout.current) {
        clearTimeout(pongTimeout.current);
        pongTimeout.current = undefined;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = undefined;
      }
      if (ws.current) {
        ws.current.close(1000, "Normal closure");
        ws.current = null;
      }
      messageHandlers.current.clear();
      reconnectAttempt.current = 0;
    } catch (error) {
      console.error("Error in cleanup:", error);
    }
  };

  const startPingInterval = () => {
    try {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
      sendPing();
      pingInterval.current = setInterval(sendPing, PING_INTERVAL);
    } catch (error) {
      console.error("Error starting ping interval:", error);
      queueOperation(reconnect);
    }
  };

  const sendPing = () => {
    try {
      if (!ws.current) {
        throw new Error("WebSocket is null");
      }
      ws.current.send("ping");

      if (pongTimeout.current) {
        clearTimeout(pongTimeout.current);
      }

      pongTimeout.current = setTimeout(() => {
        alert("Pong not received in time, reconnecting...");
        queueOperation(reconnect);
      }, PONG_TIMEOUT);
    } catch (error) {
      console.error("Error sending ping:", error);
      queueOperation(reconnect);
    }
  };

  const reconnect = () => {
    cleanup();
    connect();
  };

  const connect = () => {
    if (!authState.accessToken) {
      return;
    }

    try {
      cleanup();

      ws.current = new WebSocket(
        `${API_BASE_URL}/ws?token=Bearer ${authState.accessToken}`,
      );

      ws.current.onopen = () => {
        reconnectAttempt.current = 0;
        setWsConnectionID(Date.now());
        startPingInterval();
      };

      ws.current.onmessage = (event) => {
        try {
          if (event.data === "pong") {
            if (pongTimeout.current) {
              clearTimeout(pongTimeout.current);
              pongTimeout.current = undefined;
            }
            return;
          }

          const [topic, data] = event.data.split("|");
          messageHandlers.current.forEach((handler) => {
            try {
              handler({ topic, data: JSON.parse(data) });
            } catch (error) {
              console.error("Error in message handler:", error);
            }
          });
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.current.onclose = (event) => {
        if (event.code === 1000) {
          return;
        }

        if (event.code === WS_ERROR_CODES.CONNECTION_LIMIT) {
          alert(
            "Connection limit reached. Please close other sessions before continuing.",
          );
          return;
        }

        if (reconnectAttempt.current < 5) {
          reconnectAttempt.current++;
          const delay = 1000 * Math.pow(2, reconnectAttempt.current);
          reconnectTimeout.current = setTimeout(
            () => queueOperation(connect),
            delay,
          );
        } else {
          alert(
            "Unable to establish connection. Please refresh the page to try again.",
          );
          reconnectAttempt.current = 0;
          queueOperation(connect);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setAuthState(state);
      } catch (error) {
        console.error("Error initializing auth:", error);
        alert("Error loading your session. Please login again.");
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Connect when token is available
  useEffect(() => {
    if (authState.accessToken) {
      // Small delay on initial connection to avoid race conditions
      const timer = setTimeout(() => {
        queueOperation(connect);
      }, 500);
      return () => {
        clearTimeout(timer);
        queueOperation(cleanup);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.accessToken]);

  // Persist auth state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error("Error saving auth state:", error);
      alert(
        "Failed to save authentication state. You may need to login again after refreshing.",
      );
    }
  }, [authState]);

  const login = (token: string) => {
    setIsLoading(true);
    try {
      queueOperation(cleanup);
      setAuthState({
        isAuthenticated: true,
        accessToken: token,
      });
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      queueOperation(cleanup);
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error during logout. Please refresh the page.");
    }
  };

  const websocketApi: WebSocketContextValue = {
    sendMessage: (message: unknown) => {
      if (!ws.current) return;
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send message:", error);
        queueOperation(reconnect);
      }
    },
    subscribe: (handler: (message: ParsedMessage) => void) => {
      messageHandlers.current.add(handler);
      return () => messageHandlers.current.delete(handler);
    },
    connectionID: wsConnectionID,
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        ws: websocketApi,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
