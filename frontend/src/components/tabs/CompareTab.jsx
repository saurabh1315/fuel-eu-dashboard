import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data fallback
const mockComparison = [
  { id: "1", route_name: "Route A", current_cost: 12500, baseline_cost: 11800, difference_pct: 5.93, compliant: false },
  { id: "2", route_name: "Route B", current_cost: 8200, baseline_cost: 8500, difference_pct: -3.53, compliant: true },
  { id: "3", route_name: "Route C", current_cost: 7800, baseline_cost: 7600, difference_pct: 2.63, compliant: true },
  { id: "4", route_name: "Route D", current_cost: 15200, baseline_cost: 14000, difference_pct: 8.57, compliant: false },
  { id: "5", route_name: "Route E", current_cost: 4500, baseline_cost: 4600, difference_pct: -2.17, compliant: true },
];

const CompareTab = () => {
  const [comparison, setComparison] = useState(mockComparison);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      const response = await axios.get(`${API}/routes/comparison`);
      setComparison(response.data);
    } catch (error) {
      console.error("Using mock data:", error);
      setComparison(mockComparison);
    } finally {
      setLoading(false);
    }
  };

  const compliantCount = comparison.filter(c => c.compliant).length;
  const nonCompliantCount = comparison.filter(c => !c.compliant).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="compare-loading">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="compare-container">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Total Routes</p>
          <p className="font-heading text-2xl font-semibold text-white" data-testid="total-routes-count">
            {comparison.length}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Compliant</p>
          <p className="font-heading text-2xl font-semibold text-[#00FF66]" data-testid="compliant-count">
            {compliantCount}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Non-Compliant</p>
          <p className="font-heading text-2xl font-semibold text-[#FF3B30]" data-testid="non-compliant-count">
            {nonCompliantCount}
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card-surface p-6">
        <div className="mb-6">
          <h2 className="font-heading text-xl font-semibold text-white">Route Comparison</h2>
          <p className="text-sm text-[#A3A3A3] mt-1">Compare current costs against baseline</p>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table" data-testid="compare-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Current Cost</th>
                <th>Baseline Cost</th>
                <th>Difference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item) => (
                <tr key={item.id} data-testid={`compare-row-${item.id}`}>
                  <td className="font-medium">{item.route_name}</td>
                  <td>${item.current_cost.toLocaleString()}</td>
                  <td>${item.baseline_cost.toLocaleString()}</td>
                  <td>
                    <span className={`flex items-center gap-1 ${item.difference_pct > 0 ? 'text-[#FF3B30]' : 'text-[#00FF66]'}`}>
                      {item.difference_pct > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span data-testid={`difference-pct-${item.id}`}>
                        {Math.abs(item.difference_pct).toFixed(2)}%
                      </span>
                    </span>
                  </td>
                  <td>
                    <span 
                      className={item.compliant ? 'badge-compliant' : 'badge-non-compliant'}
                      data-testid={`compliant-flag-${item.id}`}
                    >
                      {item.compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareTab;
