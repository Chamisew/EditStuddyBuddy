const TransactionHistoryModal = ({ user, onClose }) => {
  if (!user) return null;
  console.log(`user => `, user);
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full h-[75%] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>

        {/* Responsive Table */}
        <table className="table-auto min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                #{" "}
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Amount (LKR)
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {user.transactions.map((transaction, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{transaction.description}</td>
                <td className="px-6 py-4">{transaction.amount}.00</td>
                <td className="px-6 py-4">
                  <span
                    className={`${
                      transaction.isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } font-medium px-1 py-0.5 rounded`}
                  >
                    {transaction.isPaid ? "Paid" : "Not Paid"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
