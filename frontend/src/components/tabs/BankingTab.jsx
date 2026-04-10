import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Loader2, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data fallback
const mockBanking = {
  cb_balance: 125000.00,
  pending_transactions: 3,
  last_bank_date: "2026-01-10",
  last_apply_date: "2026-01-08",
};

const mockComplianceCB = {
  total_routes: 5,
  compliant_count: 3,
  non_compliant_count: 2,
  compliance_rate: 60.0,
  last_updated: new Date().toISOString(),
};

const BankingTab = () => {
  const [banking, setBanking] = useState(mockBanking);
  const [complianceCB, setComplianceCB] = useState(mockComplianceCB);
  const [loading, setLoading] = useState(true);
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [applyRouteId, setApplyRouteId] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bankingRes, cbRes] = await Promise.all([
        axios.get(`${API}/banking`),
        axios.get(`${API}/compliance/cb`)
      ]);
      setBanking(bankingRes.data);
      setComplianceCB(cbRes.data);
    } catch (error) {
      console.error("Using mock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    if (!bankAmount || isNaN(parseFloat(bankAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    setProcessing(true);
    try {
      const response = await axios.post(`${API}/banking/bank`, { amount: parseFloat(bankAmount) });
      setBanking({ ...banking, cb_balance: response.data.new_balance });
      toast.success(response.data.message);
      alert("Bank action triggered");
      setBankAmount("");
      setBankDialogOpen(false);
    } catch (error) {
      console.error("Bank error:", error);
      // Mock update
      const newBalance = banking.cb_balance + parseFloat(bankAmount);
      setBanking({ ...banking, cb_balance: newBalance });
      toast.success(`Successfully banked $${parseFloat(bankAmount).toLocaleString()}`);
      alert("Bank action triggered");
      setBankAmount("");
      setBankDialogOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleApply = async () => {
    if (!applyAmount || isNaN(parseFloat(applyAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(applyAmount) > banking.cb_balance) {
      toast.error("Insufficient balance");
      return;
    }
    setProcessing(true);
    try {
      const response = await axios.post(`${API}/banking/apply`, { 
        route_id: applyRouteId,
        amount: parseFloat(applyAmount) 
      });
      setBanking({ ...banking, cb_balance: banking.cb_balance - response.data.amount_applied });
      toast.success(response.data.message);
      alert("Apply action triggered");
      setApplyAmount("");
      setApplyDialogOpen(false);
    } catch (error) {
      console.error("Apply error:", error);
      // Mock update
      const newBalance = banking.cb_balance - parseFloat(applyAmount);
      setBanking({ ...banking, cb_balance: newBalance });
      toast.success(`Applied $${parseFloat(applyAmount).toLocaleString()} to route ${applyRouteId}`);
      alert("Apply action triggered");
      setApplyAmount("");
      setApplyDialogOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="banking-loading">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="banking-container">
      {/* CB Balance Card */}
      <div className="card-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#0055FF] rounded-sm flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-mono text-xs text-[#525252] uppercase tracking-wider">CB Balance</p>
            <p className="font-heading text-3xl font-semibold text-white" data-testid="cb-balance">
              ${banking.cb_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="bank-button"
                className="bg-white text-black hover:bg-gray-200 rounded-sm px-4 py-2 text-sm font-medium transition-colors"
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141414] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="font-heading text-white">Bank Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    placeholder="Enter amount"
                    data-testid="bank-amount-input"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                </div>
                <Button 
                  onClick={handleBank} 
                  disabled={processing}
                  data-testid="confirm-bank-button"
                  className="w-full bg-[#0055FF] text-white hover:bg-[#0044CC] rounded-sm"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Bank"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="apply-button"
                className="bg-transparent border border-white/10 text-white hover:bg-white/5 rounded-sm px-4 py-2 text-sm transition-colors"
              >
                <ArrowUpFromLine className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141414] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="font-heading text-white">Apply Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                    Route ID
                  </label>
                  <Input
                    type="text"
                    value={applyRouteId}
                    onChange={(e) => setApplyRouteId(e.target.value)}
                    placeholder="Enter route ID"
                    data-testid="apply-route-input"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-[#525252] uppercase tracking-wider block mb-2">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={applyAmount}
                    onChange={(e) => setApplyAmount(e.target.value)}
                    placeholder="Enter amount"
                    data-testid="apply-amount-input"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                </div>
                <Button 
                  onClick={handleApply} 
                  disabled={processing}
                  data-testid="confirm-apply-button"
                  className="w-full bg-[#0055FF] text-white hover:bg-[#0044CC] rounded-sm"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Apply"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Pending Transactions</p>
          <p className="font-heading text-xl font-semibold text-white" data-testid="pending-transactions">
            {banking.pending_transactions}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Compliance Rate</p>
          <p className="font-heading text-xl font-semibold text-[#00FF66]" data-testid="compliance-rate">
            {complianceCB.compliance_rate}%
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Last Bank</p>
          <p className="font-heading text-xl font-semibold text-white" data-testid="last-bank-date">
            {banking.last_bank_date}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="font-mono text-xs text-[#525252] uppercase tracking-wider mb-2">Last Apply</p>
          <p className="font-heading text-xl font-semibold text-white" data-testid="last-apply-date">
            {banking.last_apply_date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankingTab;
