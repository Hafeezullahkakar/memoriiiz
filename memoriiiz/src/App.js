import "./App.css";
import Homepage from "./pages/Homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import AddNewWord from "./pages/AddNewWord";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewAllWords from "./pages/ViewAllWords";
import Login from "./pages/auth/Login";
import About from "./pages/About";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/addword" element={<AddNewWord />} />
          <Route path="/wordslist" element={<ViewAllWords />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
