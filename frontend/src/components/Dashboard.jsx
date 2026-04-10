import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Route, GitCompare, Landmark, Layers } from "lucide-react";
import RoutesTab from "./tabs/RoutesTab";
import CompareTab from "./tabs/CompareTab";
import BankingTab from "./tabs/BankingTab";
import PoolingTab from "./tabs/PoolingTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("routes");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Layers className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-heading text-xl font-semibold text-white tracking-tight">
              Dashboard Hub
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start gap-0 h-auto p-0 mb-6">
            <TabsTrigger
              value="routes"
              data-testid="routes-tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-[#A3A3A3] data-[state=active]:text-white px-4 py-3 transition-all duration-200"
            >
              <Route className="w-4 h-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              data-testid="compare-tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-[#A3A3A3] data-[state=active]:text-white px-4 py-3 transition-all duration-200"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="banking"
              data-testid="banking-tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-[#A3A3A3] data-[state=active]:text-white px-4 py-3 transition-all duration-200"
            >
              <Landmark className="w-4 h-4 mr-2" />
              Banking
            </TabsTrigger>
            <TabsTrigger
              value="pooling"
              data-testid="pooling-tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-[#A3A3A3] data-[state=active]:text-white px-4 py-3 transition-all duration-200"
            >
              <Layers className="w-4 h-4 mr-2" />
              Pooling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-0">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <CompareTab />
          </TabsContent>

          <TabsContent value="banking" className="mt-0">
            <BankingTab />
          </TabsContent>

          <TabsContent value="pooling" className="mt-0">
            <PoolingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
