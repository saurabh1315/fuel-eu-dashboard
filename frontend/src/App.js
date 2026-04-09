import "@/App.css";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="dashboard-container">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#141414',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
      <Dashboard />
    </div>
  );
}

export default App;
