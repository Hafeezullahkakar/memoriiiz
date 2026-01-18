import "./App.css";
import Homepage from "./pages/Homepage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Link,
  useRoutes,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AddNewWord from "./pages/AddNewWord";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewAllWords from "./pages/ViewAllWords";
import Login from "./pages/auth/Login";
import About from "./pages/About";
import Signup from "./pages/auth/Signup";
import Chat from "./pages/chat/Chat";
import GREPage from "./pages/GREPage";
import GREPlay from "./pages/GREPlay";
import { ColorModeProvider } from "./theme/ThemeContext";

function App() {
  return (
    <ColorModeProvider>
      <div className="App">
        <Router>
          <Header />
          <ToastContainer />
          <Routes>
            <Route index element={<Homepage />} />
            <Route path="/addword" element={<AddNewWord />} />
            <Route path="/wordslist" element={<ViewAllWords />} />
            <Route path="/gre" element={<GREPage />} />
            <Route path="/greplay" element={<GREPlay />} />
            <Route path="/about" element={<About />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <Footer />
        </Router>
      </div>
    </ColorModeProvider>
  );
}

export default App;
