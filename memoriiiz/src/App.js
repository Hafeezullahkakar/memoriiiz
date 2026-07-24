import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ui/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Homepage from "./pages/Homepage";
import AddNewWord from "./pages/AddNewWord";
import Words from "./pages/Words";
import GREPlay from "./pages/GREPlay";
import AskAI from "./pages/AskAI";
import Practice from "./pages/Practice";
import PracticeHistory from "./pages/PracticeHistory";
import PracticeDetail from "./pages/PracticeDetail";
import About from "./pages/About";
import Chat from "./pages/chat/Chat";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import { ColorModeProvider } from "./theme/ThemeContext";

function App() {
  return (
    <ColorModeProvider>
      <div className="App">
        <Router>
          <Header />
          <ToastContainer position="bottom-center" theme="colored" />
          <Routes>
            <Route index element={<Homepage />} />
            <Route path="/words" element={<Words />} />
            {/* Legacy routes — same page */}
            <Route path="/wordslist" element={<Words />} />
            <Route path="/gre" element={<Words />} />

            <Route path="/play" element={<GREPlay />} />
            <Route path="/greplay" element={<GREPlay />} />

            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/history" element={<PracticeHistory />} />
            <Route path="/practice/history/:id" element={<PracticeDetail />} />

            <Route path="/addword" element={<AddNewWord />} />
            <Route path="/askai" element={<AskAI />} />
            <Route path="/about" element={<About />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <Footer />
          <ScrollToTop />
        </Router>
      </div>
    </ColorModeProvider>
  );
}

export default App;
