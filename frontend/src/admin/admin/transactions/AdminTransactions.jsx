import { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import { getAllTransactions } from "../../../api/transactionApi";
import TransactionHistoryModal from "../components/TransactionHistoryModal"; // Modal component

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ totalPaid: 0, totalNotPaid: 0 });
  const [userTransactions, setUserTransactions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const fetchAllTransactions = async () => {
    try {
      const res = await getAllTransactions();
      setTransactions(res);
      calculateTotals(res);
      groupTransactionsByUser(res);
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
    fetchAllTransactions();
  }, []);

  const calculateTotals = (transactions) => {
    let totalPaid = 0;
    let totalNotPaid = 0;

    transactions.forEach((transaction) => {
      if (transaction.isPaid) {
        totalPaid += transaction.amount;
      } else {
        totalNotPaid += transaction.amount;
      }
    });

    setTotals({ totalPaid, totalNotPaid });
  };

  const groupTransactionsByUser = (transactions) => {
    const userMap = {};

    transactions.forEach((transaction) => {
      const userId = transaction.user ? transaction.user.email : "Unknown User";
      if (!userMap[userId]) {
        userMap[userId] = {
          totalPaid: 0,
          totalNotPaid: 0,
          transactions: [],
        };
      }

      if (transaction.isPaid) {
        userMap[userId].totalPaid += transaction.amount;
      } else {
        userMap[userId].totalNotPaid += transaction.amount;
      }

      userMap[userId].transactions.push(transaction);
    });

    setUserTransactions(userMap);
  };

  const handleViewTransactions = (userId) => {
    setSelectedUser(userTransactions[userId]);
    setIsModalOpen(true); // Open modal
  };

  function getTypeClassName(type) {
    return type ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  }

  return (
    <AdminDrawer>
      <div className="mb-28 shadow-md rounded-lg">
        {/* Divs to show total paid and total not paid */}
        <div className="grid grid-cols-2 gap-">
          <div className="bg-green-100 p-5 rounded-lg text-left flex items-center justify-between">
            <div className="flex flex-col justify-start items-start">
              <h3 className="text-md font-semibold text-gray-600">
                Total Amount Paid
              </h3>
            </div>
            <p className="text-[40px] font-bold text-green-600">
              LKR {totals.totalPaid}.00
            </p>
          </div>
          <div className="bg-red-100 p-5 rounded-lg text-left flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-600">
              Total Amount To Be Paid
            </h3>
            <p className="text-[40px] font-bold text-red-600">
              LKR {totals.totalNotPaid}.00
            </p>
          </div>
        </div>

        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-[#48752c] bg-white">
            Transaction Summary
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Total Paid
              </th>
              <th scope="col" className="px-6 py-3">
                Total Not Paid
              </th>
              <th scope="col" className="px-6 py-3">
                Transactions
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(userTransactions).length > 0 ? (
              Object.keys(userTransactions).map((user) => (
                <tr className="bg-white border-b" key={user}>
                  <td className="px-6 py-4">{user}</td>
                  <td className="px-6 py-4 bg-green-100 text-green-700 font-semibold">
                    LKR {userTransactions[user].totalPaid}.00
                  </td>
                  <td className="px-6 py-4 bg-red-100 text-red-700 font-semibold">
                    LKR {userTransactions[user].totalNotPaid}.00
                  </td>
                  <td className="px-6 py-4">
                    {userTransactions[user].transactions.length} Transactions
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="bg-green-700 text-white px-4 py-2 rounded-md"
                      onClick={() => handleViewTransactions(user)}
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="w-full text-md text-gray-600 font-semibold text-center py-4"
                >
                  No transaction requests found!
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Transaction History Modal */}
        {isModalOpen && (
          <TransactionHistoryModal
            user={selectedUser}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </AdminDrawer>
  );
};

export default AdminTransactions;
