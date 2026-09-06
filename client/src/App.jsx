import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";

import { setUserData } from "./redux/userSlice";

export const ServerUrl = import.meta.env.VITE_API_URL;

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Don't check session while already on auth page
    if (location.pathname === "/auth") return;

    const getUser = async () => {
      try {
        console.log("Checking user session...");
        console.log("Server URL:", ServerUrl);

        const result = await axios.get(`${ServerUrl}/api/user/session`, {
          withCredentials: true,
        });

        console.log("SESSION SUCCESS:", result.data);

        dispatch(setUserData(result.data));
      } catch (error) {
        console.error("SESSION ERROR:", error);
        console.error("SESSION STATUS:", error.response?.status);
        console.error("SESSION DATA:", error.response?.data);
        console.error("SESSION MESSAGE:", error.message);

        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/auth" element={<Auth />} />

      <Route path="/interview" element={<InterviewPage />} />

      <Route path="/history" element={<InterviewHistory />} />

      <Route path="/pricing" element={<Pricing />} />

      <Route path="/report/:id" element={<InterviewReport />} />
    </Routes>
  );
}

export default App;
