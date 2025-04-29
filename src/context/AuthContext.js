import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem("jwtToken");
        console.log("🔥 초기 토큰 설정:", storedToken);
        return storedToken;
    });

    console.log("🔥 AuthContext 실행됨");

    // ✅ 로그인 후 `token`이 변경될 때 자동으로 `/me` 요청 실행
    useEffect(() => {
        console.log("🔍 useEffect 실행됨 - 로그인 유지 확인");

        const storedToken = localStorage.getItem("jwtToken");
        console.log("🔍 현재 localStorage JWT Token:", storedToken);

        if (!storedToken) {
            console.log("❌ JWT 없음, 자동 로그인 불가");
            setUser(null);
            return;
        }

        console.log("🔍 JWT 확인됨, /me 요청 시작");
        axios
            .get("/local/api/auth/me", { headers: { Authorization: `Bearer ${storedToken}` } })
            .then((response) => {
                setUser(response.data);
                console.log("✅ /me 요청 성공 - 사용자 정보 업데이트:", response.data);
            })
            .catch((error) => {
                console.error("❌ /me 요청 실패:", error);
                logout();
            });
    }, [token]); // ✅ `token` 상태가 변경될 때마다 실행

    // ✅ `localStorage` 변경 감지하여 `token` 자동 업데이트
    useEffect(() => {
        const handleStorageChange = () => {
            const newToken = localStorage.getItem("jwtToken");
            console.log("🔄 localStorage 변경 감지 - 새로운 토큰:", newToken);
            setToken(newToken); // ✅ token 상태 업데이트 → useEffect 실행됨
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const login = (newToken) => {
        console.log("🔍 login() 실행됨, JWT 저장 중...");
        localStorage.setItem("jwtToken", newToken);
        setToken(newToken); // ✅ token 상태 업데이트 → useEffect 실행됨
    };

    const logout = () => {
        console.log("🔍 로그아웃 실행됨, JWT 삭제");
        localStorage.removeItem("jwtToken");
        setUser(null);
        setToken(null); // ✅ token 상태 초기화
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
