import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
    const { phoneNumber, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome, {phoneNumber}!
                    </h1>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Content List
                    </h2>
                    <ul className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <li
                                key={item}
                                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Item {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 