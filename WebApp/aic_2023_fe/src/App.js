import Layout from "./pages/Layout"
import Index from "./pages/Index"
import VideoDetails from "./pages/VideoDetails";
import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    // <div className="App">
    //   <DefaultLayout />
    // </div>
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="videos" element={<VideoDetails />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
