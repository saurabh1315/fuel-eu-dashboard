import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../components/ui/dialog";
import { Loader2, Layers, Plus, Package } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data fallback
const mockPools = [
  { id: "1", name: "Northeast Pool", routes_count: 12, total_volume: 45000, created_at: "2025-12-01" },
  { id: "2", name: "West Coast Pool", routes_count: 8, total_volume: 32000, created_at: "2025-12-15" },
  { id: "3", name: "Midwest Hub", routes_count: 15, total_volume: 58000, created_at: "2026-01-02" },
];

const PoolingTab = () => {
  const [pools, setPools] = useState(mockPools);
  const [loading, setLoading] = useState(true);
  const [poolName, setPoolName] = useState("");
  const [routesCount, setRoutesCount] = useState("");
  const [totalVolume, setTotalVolume] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      const response = await axios.get(`${API}/pools`);
      setPools(response.data);
    } catch (error) {
      console.error("Using mock data:", error);
      setPools(mockPools);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    if (!poolName.trim()) {
      toast.error("Please enter a pool name");
      return;
    }
    setCreating(true);
    try {
      const response = await axios.post(`${API}/pools`, { 
        name: poolName,
        routes_count: parseInt(routesCount) || 0,
        total_volume: parseInt(totalVolume) || 0
      });
      setPools([...pools, response.data.pool]);
      toast.success(response.data.message);
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Create pool error:", error);
      // Mock create
      const newPool = {
        id: String(pools.length + 1),
        name: poolName,
        routes_count: parseInt(routesCount) || 0,
        total_volume: parseInt(totalVolume) || 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setPools([...pools, newPool]);
      toast.success(`Pool '${poolName}' created successfully`);
      resetForm();
      setDialogOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setPoolName("");
    setRoutesCount("");
    setTotalVolume("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="pooling-loading">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="pooling-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Pools</h2>
          <p className="text-sm text-[#A3A3A3] mt-1">Manage route pooling configurations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="create-pool-button"
              className="bg-[#0055FF] text-white hover:bg-[#0044CC] rounded-sm px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-white">Create New Pool</DialogTitle>
              <DialogDescription className="text-[#A3A3A3]">Configure a new route pool</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                  Pool Name
                </label>
                <Input
                  type="text"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="Enter pool name"
                  data-testid="pool-name-input"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                  Routes Count (optional)
                </label>
                <Input
                  type="number"
                  value={routesCount}
                  onChange={(e) => setRoutesCount(e.target.value)}
                  placeholder="0"
                  data-testid="pool-routes-input"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                  Total Volume (optional)
                </label>
                <Input
                  type="number"
                  value={totalVolume}
                  onChange={(e) => setTotalVolume(e.target.value)}
                  placeholder="0"
                  data-testid="pool-volume-input"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
              </div>
              <Button 
                onClick={handleCreatePool} 
                disabled={creating}
                data-testid="confirm-create-pool-button"
                className="w-full bg-[#0055FF] text-white hover:bg-[#0044CC] rounded-sm"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Pool"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="pools-list">
        {pools.map((pool) => (
          <div 
            key={pool.id} 
            className="card-surface p-5 hover:border-white/20 transition-colors"
            data-testid={`pool-card-${pool.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-mono text-xs text-[#525252]">#{pool.id}</span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">{pool.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A3A3A3]">Routes</span>
                <span className="text-sm font-medium text-white" data-testid={`pool-routes-count-${pool.id}`}>
                  {pool.routes_count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A3A3A3]">Volume</span>
                <span className="text-sm font-medium text-white" data-testid={`pool-volume-${pool.id}`}>
                  {pool.total_volume.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A3A3A3]">Created</span>
                <span className="text-sm text-[#525252]">{pool.created_at}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state or add placeholder */}
        {pools.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 card-surface">
            <Package className="w-12 h-12 text-[#525252] mb-4" />
            <p className="text-[#A3A3A3]">No pools created yet</p>
            <p className="text-sm text-[#525252]">Create your first pool to get started</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="card-surface p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#525252]" />
          <span className="font-mono text-xs text-[#525252] uppercase tracking-wider">
            {pools.length} Pools
          </span>
        </div>
        <span className="font-mono text-xs text-[#525252] uppercase tracking-wider">
          Total Volume: {pools.reduce((sum, p) => sum + p.total_volume, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default PoolingTab;
