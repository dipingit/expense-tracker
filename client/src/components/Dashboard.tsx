import { useState } from "react";
import CategoryDistribution from "./CategoryDistribution";
import MonthlySpending from "./MonthlySpending";
import StatCard from "./StatCard";
import TransactionList from "./TransactionList";
import Navbar from "./Navbar";

function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-10">
      <Navbar onExpenseAdded={handleExpenseAdded}></Navbar>
      <StatCard refreshTrigger={refreshTrigger}></StatCard>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 animate-fade-in">
          <MonthlySpending refreshTrigger={refreshTrigger} />
        </div>
        <div className="animate-fade-in">
          <CategoryDistribution refreshTrigger={refreshTrigger} />
        </div>
      </div>
      <TransactionList refreshTrigger={refreshTrigger}></TransactionList>
    </div>
  );
}

export default Dashboard;
