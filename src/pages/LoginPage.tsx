import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import view from "/assets/view.png";
import hide from "/assets/hide.png";
import logo from "/assets/logo.png";
import { logout } from "../services/auth.ts";
import { auth, provider } from "../services/firebase.ts";
import HomePage from "./HomePage";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";


function LoginPage() {
    const [user, setUser] = useState<import("firebase/auth").User | null>(null);
    const [Email, setEmail] = useState<string>("");
    const [Password, setPassword] = useState<string>("");
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Add a loading state


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, Email, Password);
            } else {
                await signInWithEmailAndPassword(auth, Email, Password);
            }
            navigate("/home");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert("Authentication failed: " + error.message);
            } else {
                alert("An unknown error occurred.");
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate("/home");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert("Google login failed: " + error.message);
                console.error("Google login error:", error);
            } else {
                alert("An unknown error occurred during Google login.");
                console.error("Google login error:", error);
            }
        }
    };


    const handleSwitchMode = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setIsSignUp((prev: boolean) => !prev);
        setEmail("");
        setPassword("");
    }


    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser: import("firebase/auth").User | null) => {
            setUser(currentUser);
            setLoading(false);


            if (currentUser) {
                setUser(currentUser);
            }
            else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);




    // Show loading spinner before authentication is checked
    if (loading) {
        return (
            <div className="ispinner">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="ispinner-blade"></div>
                ))}
            </div>
        );
    }





    return (
        <>
            {!user ? (
                <div className="login-page">
                    <form className="login-box" onSubmit={handleSubmit}>
                        <div className="header">
                            <img className="logo" src={logo} alt="logo" />
                            <p>{isSignUp ? "Create Your Account" : "Sign In"}</p>
                        </div>

                        <div className="user-input">
                            <div className="password-wrapper">
                                <input
                                    type={Email ? "text" : "text"}
                                    className="input-field"
                                    placeholder={isSignUp ? "Email" : "Email"}
                                    value={Email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <span
                                    className="eye-btn"
                                    onClick={() => setEmail("")}
                                ></span>
                            </div>

                            <div className="password-wrapper">
                                <input
                                    type={isPasswordVisible ? "text" : "password"}
                                    className="input-field"
                                    placeholder="Password"
                                    value={Password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span
                                    className="eye-btn"
                                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                                >
                                    <img className="eye-btn" src={isPasswordVisible ? view : hide} />
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>

                        <p className="or">OR</p>
                        <button className="submit-btn" type="button" onClick={handleGoogleLogin}>
                            Login with Google
                        </button>

                        <div className="options">
                            {!isSignUp && <a href="#">FORGOT PASSWORD</a>}
                            <a href="#" onClick={handleSwitchMode}>
                                {isSignUp ? "ALREADY HAVE AN ACCOUNT? SIGN IN" : "NEW USER? SIGN UP"}
                            </a>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <HomePage user={user} onLogout={logout} />
                </>
            )}
        </>
    );
}



export default LoginPage;
