import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define types
interface User {
  is_active: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isEmailConfirmed: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    console.error(
      "!!! CRITICAL ERROR: The real 'login' function was not called."
    );
  },
  register: async () => {
    console.error(
      "!!! CRITICAL ERROR: The real 'register' function was not called."
    );
  },
  logout: () => {},
  loading: true,
  isEmailConfirmed: false,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    console.log("[AuthProvider] MOUNTED. Checking for existing token.");
    const token = localStorage.getItem("access_token");
    console.log("Token being sent:", token);
    console.log("Authorization header:", `Bearer ${token}`);
    if (token) {
const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token payload:", payload);
      console.log("Expiration:", new Date(payload.exp * 1000));
      axios
        .get(`${API_URL}user-status/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("[AuthProvider] Token validation successful.");
          setUser(response.data);
          setIsEmailConfirmed(response.data.is_active);
        })
        .catch((error) => {
          console.error("[AuthProvider] Token validation failed:", {
            message: error.message,
            response: error.response
              ? { status: error.response.status, data: error.response.data }
              : null,
          });
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      navigate("/login");
      console.log("[AuthProvider] No token found.");
      setLoading(false);
    }
  }, [API_URL]);

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    console.log("✅ [AuthContext] REAL register function called.");
    try {
      await axios.post(`${API_URL}register/`, { username, email, password });
      // Auto-login after registration
      const response = await axios.post(`${API_URL}token/`, {
        email,
        password,
      });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      const userResponse = await axios.get(`${API_URL}user-status/`, {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });
      setUser(userResponse.data);
      setIsEmailConfirmed(userResponse.data.is_active);
      console.log("✅ [AuthContext] Registration successful.");
    } catch (error: any) {
      console.error("❌ [AuthContext] Registration failed:", {
        message: error.message,
        response: error.response
          ? { status: error.response.status, data: error.response.data }
          : null,
      });
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  };


  const login = async (email: string, password: string): Promise<void> => {
    console.log("✅ [AuthContext] REAL login function called.");
    try {
      const response = await axios.post(`${API_URL}token/`, {
        email,
        password,
      });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      const userResponse = await axios.get(`${API_URL}user-status/`, {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });
      setUser(userResponse.data);
      setIsEmailConfirmed(userResponse.data.is_active);
      console.log("✅ [AuthContext] Login successful.");
    } catch (error: any) {
      console.error("❌ [AuthContext] Login failed:", {
        message: error.message,
        response: error.response
          ? { status: error.response.status, data: error.response.data }
          : null,
      });
      throw new Error(error.response?.data?.detail || "Invalid credentials");
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsEmailConfirmed(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, isEmailConfirmed }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
