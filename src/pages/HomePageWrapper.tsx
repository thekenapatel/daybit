import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import HomePage from "./HomePage";

function HomePageWrapper() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate("/"); // Not logged in, redirect to login
            }

        });
        return () => unsubscribe();
    }, []);

    return <HomePage user={auth.currentUser} onLogout={() => auth.signOut()} />;
}


export default HomePageWrapper;