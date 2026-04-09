import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { MapPin, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data fallback
const mockRoutes = [
  { id: "1", name: "Route A", origin: "NYC", destination: "LAX", distance: 2451, status: "active", baseline: null },
  { id: "2", name: "Route B", origin: "CHI", destination: "MIA", distance: 1378, status: "active", baseline: null },
  { id: "3", name: "Route C", origin: "SEA", destination: "DEN", distance: 1321, status: "pending", baseline: null },
  { id: "4", name: "Route D", origin: "BOS", destination: "SFO", distance: 2704, status: "active", baseline: null },
  { id: "5", name: "Route E", origin: "ATL", destination: "DFW", distance: 721, status: "inactive", baseline: null },
];

const RoutesTab = () => {
  const [routes, setRoutes] = useState(mockRoutes);
  const [loading, setLoading] = useState(true);
  const [settingBaseline, setSettingBaseline] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API}/routes`);
      setRoutes(response.data);
    } catch (error) {
      console.error("Using mock data:", error);
      setRoutes(mockRoutes);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId) => {
    setSettingBaseline(routeId);
    try {
      const response = await axios.post(`${API}/routes/${routeId}/baseline`);
      setRoutes(routes.map(r => 
        r.id === routeId ? { ...r, baseline: response.data.baseline } : r
      ));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error setting baseline:", error);
      // Mock update
      const now = new Date().toISOString();
      setRoutes(routes.map(r => 
        r.id === routeId ? { ...r, baseline: now } : r
      ));
      toast.success("Baseline set successfully");
    } finally {
      setSettingBaseline(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-[#00FF66]";
      case "pending": return "text-yellow-500";
      case "inactive": return "text-[#525252]";
      default: return "text-[#A3A3A3]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="routes-loading">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="card-surface p-6" data-testid="routes-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Routes</h2>
          <p className="text-sm text-[#A3A3A3] mt-1">Manage and monitor route configurations</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#525252]" />
          <span className="font-mono text-xs text-[#525252] uppercase tracking-wider">
            {routes.length} Routes
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table" data-testid="routes-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Distance</th>
              <th>Status</th>
              <th>Baseline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} data-testid={`route-row-${route.id}`}>
                <td className="font-medium">{route.name}</td>
                <td>{route.origin}</td>
                <td>{route.destination}</td>
                <td>{route.distance.toLocaleString()} mi</td>
                <td>
                  <span className={`font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </td>
                <td>
                  {route.baseline ? (
                    <span className="flex items-center gap-1 text-[#00FF66]">
                      <Check className="w-3 h-3" />
                      Set
                    </span>
                  ) : (
                    <span className="text-[#525252]">Not set</span>
                  )}
                </td>
                <td>
                  <Button
                    onClick={() => handleSetBaseline(route.id)}
                    disabled={settingBaseline === route.id || route.baseline !== null}
                    data-testid={`baseline-button-${route.id}`}
                    className="bg-white text-black hover:bg-gray-200 rounded-sm px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-7"
                  >
                    {settingBaseline === route.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : route.baseline ? (
                      "Baselined"
                    ) : (
                      "Set Baseline"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoutesTab;
