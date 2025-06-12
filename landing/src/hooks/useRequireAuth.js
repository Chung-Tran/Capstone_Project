// hooks/useRequireAuth.ts
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export const useRequireAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const token = localStorage.getItem("token")
    return useCallback(
        (callbackIfAuthed) => {
            if (isAuthenticated && token) {
                callbackIfAuthed();
            } else {
                navigate("/login", {
                    state: { from: location }, // Lưu trang hiện tại để redirect sau login
                    replace: true,
                });
            }
        },
        [navigate, location, isAuthenticated]
    );
};
