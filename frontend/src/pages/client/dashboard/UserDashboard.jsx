import { useEffect, useState } from "react";
import UserDrawer from "../components/UserDrawer";
import SliderComponent from "../components/Slider";
import { DollarSign, TrendingUp, Trash } from "lucide-react";
import { getUserTransactions } from "../../../api/transactionApi";
import { getUserAllGarbages } from "../../../api/garbageApi";

const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [paidTransactions, setPaidTransactions] = useState([]);
  const [garbageCount, setGarbageCount] = useState(0);

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

  const fetchAllUserGarbages = async () => {
    try {
      const garbages = await getUserAllGarbages();
      setGarbageCount(garbages.length);
    } catch (error) {
      console.error("Error fetching garbages: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllUserGarbages();
    fetchAllUserTransactions();
  }, []);

  // Calculate totals above metrics array
  const totalUnpaidAmount = transactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? 0 : transaction.amount);
  }, 0);

  const totalPaidAmount = paidTransactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? transaction.amount : 0);
  }, 0);

  const metrics = [
    {
      title: "Total spent",
      value: totalPaidAmount ? totalPaidAmount : 0,
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      color: "border-l-green-500",
    },
    {
      title: "Total unpaid",
      value: totalUnpaidAmount ? totalUnpaidAmount : 0,
      icon: <TrendingUp className="h-6 w-6 text-red-500" />,
      color: "border-l-red-500",
    },
    {
      title: "Garbage Requests",
      value: garbageCount,
      icon: <Trash className="h-6 w-6 text-orange-500" />,
      color: "border-l-orange-500",
    },
    // {
    //   title: "Costs",
    //   value: "24.58 $",
    //   icon: <CreditCard className="h-6 w-6 text-red-500" />,
    //   color: "border-l-red-500",
    // },
  ];

  return (
    <UserDrawer>
      <div className="p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        <SliderComponent />
      </div>
    </UserDrawer>
  );
};

const MetricCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("border-l-", "bg-")
          .replace("500", "100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default UserDashboard;
