import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LayoutLoader from "./components/layout/Loaders";
import { Toaster } from "react-hot-toast";
const Home = lazy(() => import("./pages/Home"));
const Admin = lazy(() => import("./pages/Admin"));
const Verifier = lazy(() => import("./pages/Verifier"));
const Login = lazy(() => import("./pages/Login"));
const Notfound = lazy(() => import("./pages/Notfound"));
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verifier" element={<Verifier />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
};

export default App;
