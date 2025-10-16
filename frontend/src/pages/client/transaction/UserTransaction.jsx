import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserDrawer from "../components/UserDrawer";
import {
  getUserTransactions,
  updateTransaction,
} from "../../../api/transactionApi";
import { toast } from "react-toastify"; // Assuming react-toastify is used for notifications
import PaymentGateway from "../components/PaymentGateway";

const UserTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [paidTransactions, setPaidTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const fetchAllUserTransactions = async () => {
    try {
      const res = await getUserTransactions();
      const unpaidTransactions = res.filter(
        (transaction) => !transaction.isPaid,
      );
      setTransactions(unpaidTransactions);
      const paidTransactions = res.filter(
        (paidTransaction) => paidTransaction.isPaid,
      );
      setPaidTransactions(paidTransactions);
      // console.log(`paidTransactions => `, paidTransactions);
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error fetching transactions: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllUserTransactions();
  }, []);

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId],
    );
  };

  const handleMakePaidClick = () => {
    if (selectedTransactions.length === 0) {
      toast.error("Please select at least one transaction", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentModalOpen(false);
  };

  const handlePaymentSubmit = async () => {
    try {
      await Promise.all(
        selectedTransactions.map((transactionId) =>
          updateTransaction(transactionId),
        ),
      );
      toast.success("Payments marked as successful", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setPaymentModalOpen(false);
      setSelectedTransactions([]);
      fetchAllUserTransactions();
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  // Calculate the summary based on selected transactions
  const selectedSummary = transactions.reduce(
    (acc, transaction) => {
      if (selectedTransactions.includes(transaction._id)) {
        if (transaction.isRefund) {
          acc.refunded += transaction.amount;
        } else {
          acc.toBePaid += transaction.amount;
        }
      }
      return acc;
    },
    { refunded: 0, toBePaid: 0 },
  );

  selectedSummary.total = selectedSummary.toBePaid - selectedSummary.refunded;

  // Recalculate discount amount whenever subtotal or discountPercent changes
  useEffect(() => {
    const subtotal = selectedSummary.total || 0;
    const calculated = Number(((subtotal * discountPercent) / 100).toFixed(2));
    setDiscountAmount(isNaN(calculated) ? 0 : calculated);
  }, [selectedSummary.total, discountPercent]);

  const totalUnpaidAmount = transactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? 0 : transaction.amount);
  }, 0);

  const totalPaidAmount = paidTransactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? transaction.amount : 0);
  }, 0);

  function getTypeClassName(type) {
    switch (type) {
      case true:
        return "bg-green-100 text-green-800";
      case false:
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  }

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "LKR 0.00";
    return `LKR ${Number(value).toLocaleString()}.00`;
  };

  const getPaymentStatusClassName = (isPaid) => {
    return isPaid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800";
  };

  console.log(`transaction => `, transactions);

  return (
    <UserDrawer>
      {/* Header / Summary Banner */}
      <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transactions</h1>
              <p className="text-sm opacity-90">Manage your pending & paid transactions</p>
            </div>

            <div className="text-right">
              <div className="text-sm">Total unpaid</div>
              <div className="text-3xl font-extrabold">{formatCurrency(totalUnpaidAmount)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-brand-50 rounded-lg">
                <div className="text-sm text-gray-600">To be Paid</div>
                <div className="text-2xl font-bold text-brand-700">{formatCurrency(totalUnpaidAmount)}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">Paid</div>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalPaidAmount)}</div>
                <Link to="/user/my-transaction/history" className="mt-3 inline-block">
                  <button className="text-brand-700 bg-brand-100 px-3 py-1 rounded-md text-sm">View History</button>
                </Link>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">Selected Total</div>
                <div className="text-2xl font-bold text-brand-700">{formatCurrency(selectedSummary.total)}</div>
                <div className="mt-3">
                  <button onClick={handleMakePaidClick} className="btn-primary w-full">Pay Selected</button>
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions list */}
        <div className="lg:col-span-2 space-y-4">
          {transactions.length > 0 ? (
            transactions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((transaction) => (
                <div key={transaction._id} className="bg-white rounded-xl shadow px-4 py-4 flex items-center justify-between hover:shadow-lg transform transition hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction._id)}
                      onChange={() => handleCheckboxChange(transaction._id)}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                    <div>
                      <div className="text-md font-semibold text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className={`uppercase text-[12px] px-3 py-1 rounded-full font-semibold ${getPaymentStatusClassName(transaction.isPaid)}`} aria-label={transaction.isPaid ? 'Paid' : 'Not paid'}>
                        {transaction.isPaid ? 'Paid' : 'Not Paid'}
                      </span>
                    </div>
                    <div className={`${transaction.isRefund ? 'text-green-600' : 'text-red-600'} font-semibold`}>{formatCurrency(transaction.amount)}</div>
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600 font-semibold">No unpaid transaction requests found!</div>
          )}
        </div>

        {/* Right sidebar summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-600">Subtotal</div>
            <div className="text-xl font-semibold">{formatCurrency(selectedSummary.toBePaid)}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Tax</div>
              <div className="text-sm text-gray-700">LKR 0.00</div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-600">Discount</div>
              <div className="text-sm text-gray-700">{formatCurrency(discountAmount)}</div>
            </div>

            <div className="mt-3">
              <label className="text-sm text-gray-600">Discount code (optional)</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter numeric code"
                  className="form-input w-full px-3 py-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Auto-generate discount percent based on number of selected transactions (2% per bin)
                    const percent = selectedTransactions.length * 2;
                    setDiscountPercent(percent);
                    setDiscountCode(String(selectedTransactions.length));
                  }}
                  className="px-3 py-2 bg-brand-100 text-brand-700 rounded-md text-sm"
                >
                  Auto
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Auto uses 2% per selected bin (e.g. 1 bin = 2%)</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(Number(selectedSummary.total - discountAmount))}</div>
            <button onClick={handleMakePaidClick} className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg">Make Payment</button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentGateway onSubmitPayment={handlePaymentSubmit} onClose={handleClosePayment} />
      )}
    </UserDrawer>
  );
};

export default UserTransaction;
