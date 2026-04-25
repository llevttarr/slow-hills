import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "pages/about/About";
import Begin from "pages/begin/Begin";
import Visualization from "pages/vis/Visualization";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Begin />} />
        <Route path="/about" element={<About />} />
        <Route path="/vis" element={<Visualization />} />
      </Routes>
    </BrowserRouter>
  );
}
