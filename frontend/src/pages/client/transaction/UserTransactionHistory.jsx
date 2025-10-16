import { useEffect, useState } from "react";
import UserDrawer from "../components/UserDrawer";
import { getUserTransactions } from "../../../api/transactionApi";

const UserTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const fetchAllUserTransactions = async () => {
    try {
      const res = await getUserTransactions();
      const paidTransactions = res.filter(
        (paidTransaction) => paidTransaction.isPaid,
      );
      setTransactions(paidTransactions);
      console.log(`paidTransactions => `, transactions);
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

  return (
    <UserDrawer>
      <div className="mb-28 shadow-md rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-[#48752c] bg-white :text-white :bg-gray-800">
            Transaction History
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              {/* <th scope="col" className="px-6 py-3">
                Email
              </th> */}
              <th scope="col" className="px-6 py-3">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Paid
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>

              <th scope="col" className="px-5 py-3">
                <span className="sr-only"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
                .map(
                  (transaction) => (
                    console.log(`transaction => `, transaction.isPaid),
                    (
                      <tr
                        className="bg-white border-b :bg-gray-800 :border-gray-700"
                        key={transaction._id}
                      >
                        <td className="px-6 py-4">{transaction._id}</td>
                        <td className="px-6 py-4">{transaction.description}</td>

                        <td className="px-6 py-4 capitalize">
                          <span
                            className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getTypeClassName(
                              transaction.isPaid,
                            )}`}
                          >
                            {transaction.isPaid ? "Paid" : "Not Paid"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          LKR&nbsp;{transaction.amount}.00
                        </td>
                        <td className="px-6 py-4">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>

                        <td className="px-3 py-4 text-right">
                          <a
                            onClick={() => handleClickOpen(transaction._id)}
                            className="font-medium text-red-600 :text-blue-500 cursor-pointer"
                          >
                            {/* <DeleteIcon /> */}
                          </a>
                        </td>
                      </tr>
                    )
                  ),
                )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="w-full text-md text-gray-600 font-semibold text-center py-4"
                >
                  No transaction requests found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </UserDrawer>
  );
};

export default UserTransactionHistory;
