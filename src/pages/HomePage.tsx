import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
    const { phoneNumber, logout } = useAuth();

    return (
        <div>
            <h1>Welcome, {phoneNumber}!</h1>
            <button onClick={logout}>Logout</button>
            <div>
                <h2>Task List</h2>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </div>
        </div>
    );
} 