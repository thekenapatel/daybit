import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./firebase";




// Google Sign-In
const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope("profile"); // Request profile information
        provider.addScope("email");   // Request email information
        const result = await signInWithPopup(auth, provider);
        // Wait for Firebase to update the user state
        await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    resolve(user);
                    unsubscribe();
                }
            });
        });
        console.log("User Info:", result.user); // Debugging: Check user info
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error signing in:", error.message);
        } else {
            console.error("Error signing in:", error);
        }
    }
};




import { User } from "firebase/auth";

function updateUserMenu(user: User | null) {
    const userEmail = document.getElementById("user-email");
    const userPic = document.getElementById("user-pic") as HTMLImageElement;
    const userName = document.getElementById("user-name");


    if (user && userEmail && userName && userPic) {
        // User is signed in
        userEmail.textContent = user.email || "No Email";
        userPic.src = user.photoURL || "../assets/user.png";
        userName.textContent = user.displayName || "No Name";
    } else if (userName && userEmail && userPic) {
        // User is signed out
        userEmail.textContent = "Not logged in";
        userName.textContent = "Guest";
    }
}


onAuthStateChanged(auth, (user) => {
  updateUserMenu(user);
})

const logout = async () => {
  try {
    await signOut(auth);
    updateUserMenu(null);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};



export { signInWithGoogle, logout };
