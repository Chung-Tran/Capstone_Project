import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import './index.css'
function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} /> {/* Homepage */}
        </Route>

        {/* <Route path="" element={ } /> */}

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
