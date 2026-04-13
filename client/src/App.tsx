import CategoryDistribution from "./components/categoryDistribution";
import MonthlySpending from "./components/monthlySpending";
import TransactionList from "./components/TransactionList";

function App() {
  return (
    <div className="p-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 animate-fade-in">
          <MonthlySpending/>
        </div>
        <div className="animate-fade-in">
          <CategoryDistribution/>
        </div>
      </div>
      <TransactionList></TransactionList>
    </div>
  );
}

export default App;

