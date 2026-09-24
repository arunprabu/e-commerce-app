import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}

export default App;
