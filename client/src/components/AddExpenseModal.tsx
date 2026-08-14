import { useState, useEffect, useRef } from "react";
import { X, Lightbulb, AlertTriangle } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { suggestCategory } from "../utils/categorySuggestion";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
}

interface Category {
  id: number;
  name: string;
}

interface OutlierStats {
  average: number;
  highest: number;
  count: number;
}

interface OutlierWarning {
  message: string;
  stats: OutlierStats;
}

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [outlierWarning, setOutlierWarning] = useState<OutlierWarning | null>(null);
  const [checkingOutlier, setCheckingOutlier] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    } else {
      setOutlierWarning(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const suggested = suggestCategory(description, categories);
    setSuggestedCategory(suggested);

    if (suggested) {
      const suggestedCat = categories.find(cat => cat.name === suggested);
      if (suggestedCat) {
        setCategoryId(suggestedCat.id);
      }
    }
  }, [description, categories]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) {
      setOutlierWarning(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      checkOutlier(parsedAmount, categoryId);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [amount, categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
      if (response.data.data.length > 0) {
        setCategoryId(response.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const checkOutlier = async (parsedAmount: number, selectedCategoryId: number) => {
    setCheckingOutlier(true);
    try {
      const response = await api.get("/expenses/outlier-check", {
        params: { amount: parsedAmount, categoryId: selectedCategoryId },
      });

      const { isOutlier, message, stats } = response.data.data;
      if (isOutlier && message && stats) {
        setOutlierWarning({ message, stats });
      } else {
        setOutlierWarning(null);
      }
    } catch (err) {
      console.error("Failed to check outlier:", err);
      setOutlierWarning(null);
    } finally {
      setCheckingOutlier(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || !categoryId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/expenses", {
        description: description.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId,
      });

      toast.success("Expense Added Successfully!");

      setDescription("");
      setAmount("");
      setSuggestedCategory(null);
      setOutlierWarning(null);
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      
      onExpenseAdded?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find(cat => cat.id === categoryId)?.name;

  return (
    <>
      <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box rounded-2xl max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-base-content">Add Expense</h3>
            <button 
              className="btn btn-ghost btn-sm btn-circle" 
              onClick={onClose}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {outlierWarning && (
            <div className="alert alert-warning mb-4">
              <AlertTriangle size={18} />
              <div>
                <p className="font-medium">{outlierWarning.message}</p>
                <p className="text-sm mt-1 opacity-80">
                  Your usual {selectedCategoryName?.toLowerCase()} spending: avg ${outlierWarning.stats.average.toFixed(2)}, highest ${outlierWarning.stats.highest.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery run"
                className="input input-bordered w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Amount ($)</span>
                {checkingOutlier && (
                  <span className="label-text-alt text-xs opacity-60">Checking...</span>
                )}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={`input input-bordered w-full ${outlierWarning ? "input-warning" : ""}`}
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
                {suggestedCategory && (
                  <span className="label-text-alt text-xs text-primary flex items-center gap-1">
                    <Lightbulb size={14} />
                    Suggested
                  </span>
                )}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className={`select select-bordered w-full ${
                  suggestedCategory ? "select-primary" : ""
                }`}
                disabled={loading || categories.length === 0}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action mt-2">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? "Adding..." : outlierWarning ? "Add Anyway" : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={onClose} />
      </dialog>
    </>
  );
};

export default AddExpenseModal;
