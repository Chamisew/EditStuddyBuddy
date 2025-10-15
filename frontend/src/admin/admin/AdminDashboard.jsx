import AdminDrawer from "./components/AdminDrawer";

// MUI Icons
import GroupIcon from "@mui/icons-material/Group";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PaidIcon from "@mui/icons-material/Paid";

const AdminDashboard = () => {
  return (
    <AdminDrawer>
      <div className="w-full grid grid-cols-1 gap-6 px-5 my-8 sm:grid-cols-2 sm:px-8 h-[200px]">
        <div className="w-full flex items-center bg-white border rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
          <div className="p-8 h-full bg-green-500 flex justify-center items-center">
            <GroupIcon style={{ fontSize: 50 }} className="text-white" />
          </div>
          <div className="px-5 text-gray-700 flex items-center justify-between w-full">
            <h3 className="text-sm font-semibold tracking-wider">
              Total Users
            </h3>
            <p className="text-5xl font-bold">{"10"}</p>
          </div>
        </div>
        <div className="w-full flex items-center bg-white border rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
          <div className="p-8 h-full bg-blue-500 flex justify-center items-center">
            <DeleteSweepIcon style={{ fontSize: 50 }} className=" text-white" />
          </div>
          <div className="px-4 text-gray-700 flex items-start justify-between w-full">
            <h3 className="text-sm font-semibold tracking-wider">
              Total Garbage Requests
            </h3>
            <p className="text-5xl font-bold">{"22"}</p>
          </div>
        </div>
        <div className="w-full flex items-center bg-white border rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
          <div className="p-8 h-full bg-indigo-500 flex justify-center items-center">
            <LocalShippingIcon
              style={{ fontSize: 50 }}
              className="text-white"
            />
          </div>
          <div className="px-5 text-gray-700 flex items-start justify-between w-full">
            <h3 className="text-sm font-semibold tracking-wider ">
              Total Trucks
            </h3>
            <p className="text-5xl font-bold">{"7"}</p>
          </div>
        </div>
        <div className="w-full flex items-center bg-white border rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
          <div className="p-8 h-full bg-red-500 flex justify-center items-center">
            <PaidIcon style={{ fontSize: 50 }} className=" text-white" />
          </div>
          <div className="px-5 text-gray-700 flex items-start justify-between w-full">
            <h3 className="text-sm font-semibold tracking-wider">
              Total Transactions
            </h3>
            <p className="text-5xl font-bold">{"12"}</p>
          </div>
        </div>
      </div>
      <div className="m-8 flex gap-y-3 flex-col">
        <span className="font-semibold text-xl">Live Garbage Requests</span>
        {/* <br /> */}
        {/* <Map /> */}
      </div>
    </AdminDrawer>
  );
};

export default AdminDashboard;
