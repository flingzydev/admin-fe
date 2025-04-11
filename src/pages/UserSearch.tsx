import { useState, ChangeEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ADMIN_API_BASE_URL } from "../constants";
import UserCard from "../components/UserCard.tsx";
import { User } from "../types";
import { useParams } from "react-router-dom";

interface ErrorResponse {
  error: string;
}

type SearchResult = User | ErrorResponse | null;

const isErrorResponse = (result: SearchResult): result is ErrorResponse => {
  return result !== null && "error" in result;
};

const UserSearch: React.FC = () => {
  const { userID = "" } = useParams<{ userID?: string }>(); // Provide a default empty string
  const [userId, setUserId] = useState<string>(userID);
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const { accessToken } = useAuth();

  const handleSearch = async (): Promise<void> => {
    try {
      const url = new URL(`${ADMIN_API_BASE_URL}/users/user`);
      url.searchParams.append("id", userId);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data: User = await response.json();
        setSearchResult(data);
      } else {
        setSearchResult({ error: "User not found" });
      }
    } catch {
      setSearchResult({ error: "Failed to search user" });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUserId(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={userId}
          onChange={handleInputChange}
          placeholder="Enter User ID"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
      {searchResult && (
        <div className="mt-4">
          {isErrorResponse(searchResult) ? (
            <p className="text-red-600">{searchResult.error}</p>
          ) : (
            <UserCard user={searchResult} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
