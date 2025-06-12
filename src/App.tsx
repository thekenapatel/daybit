import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageWrapper from "./pages/HomePageWrapper";
// import { signInWithGoogle, logout } from "./services/auth.js";
// import { auth, db } from "./services/firebase.js";
import { Navigate } from 'react-router-dom';


function App() {
  return (
    <Router basename="/daybit">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePageWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
