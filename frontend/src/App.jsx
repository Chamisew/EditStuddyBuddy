import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/client/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserGarbageRequest from "./pages/client/garbage/UserGarbageRequest";
import Notifications from "./pages/client/notifications/Notifications";
import UserDashboard from "./pages/client/dashboard/UserDashboard";
import UserTransaction from "./pages/client/transaction/UserTransaction";
import UserProfile from "./pages/client/profile/profile";
import UserTransactionHistory from "./pages/client/transaction/UserTransactionHistory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGarbage from "./pages/admin/garbage/AdminGarbage";
import AdminTransactions from "./pages/admin/transactions/AdminTransactions";
import UserSmartDeviceRequest from "./pages/client/smartDevice/UserSmartDeviceRequest";
import BinPage from "./pages/client/bins/BinPage";
import AdminGarbageUpdate from "./pages/admin/garbage/AdminGarbageUpdate";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminWMAs from "./pages/admin/wmas/AdminWMAs";
import AdminBins from "./pages/admin/bins/AdminBins";

import WMADashboard from "./pages/wma/dashboard/WMADashboard";
import WMACollectors from "./pages/wma/collectors/ViewCollectors";
import WMAProfile from "./pages/wma/profile/WMAProfile";
import WMASchedules from "./pages/wma/schedule/ViewSchedules";
import WMATransaction from "./pages/wma/transaction/WMATransaction";
import ViewBins from "./pages/wma/bins/ViewBins";
import AdminSchedule from "./pages/admin/schedule/AdminSchedule";
import AdminScheduleUpdate from "./pages/admin/schedule/AdminScheduleUpdate";
import AdminScheduleCreate from "./pages/admin/schedule/AdminScheduleCreateForm";
import AdminCollectors from "./pages/admin/collectors/AdmonCollectors";
import AdminCollectorUpdate from "./pages/admin/collectors/AdminCollectorUpdate";
import WmaCollectorUpdate from "./pages/wma/collectors/UpdateCollector";
import WmaCollectorCreate from "./pages/wma/collectors/AddCollectors";
import ScheduleUpdate from "./pages/wma/schedule/ScheduleUpdate";
import AdminDevice from "./pages/admin/device/AdminDevice";
import AdminDeviceUpdate from "./pages/admin/device/AdminDeviceUpdate";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* User routes */}
          <Route path="/" exact Component={Home} />
          <Route exact path="/login" Component={Login} />
          <Route exact path="/register" Component={Register} />
          <Route exact path="/user/dashboard" Component={UserDashboard} />
          <Route exact path="/user/my-garbage" Component={UserGarbageRequest} />
          <Route exact path="/user/notifications" Component={Notifications} />
          <Route exact path="/user/profile" Component={UserProfile} />
          <Route
            exact
            path="/user/my-transaction"
            Component={UserTransaction}
          />
          <Route
            exact
            path="/user/my-transaction/history"
            Component={UserTransactionHistory}
          />
          <Route
            exact
            path="/user/smartDevice"
            Component={UserSmartDeviceRequest}
          />
          <Route exact path="/user/bins" Component={BinPage} />

          {/* WMA Routes */}
          <Route exact path="/wma/dashboard" Component={WMADashboard} />
          <Route exact path="/wma/collectors" Component={WMACollectors} />
          <Route
            exact
            path="/wma/collectors/update"
            Component={WmaCollectorUpdate}
          />
          <Route
            exact
            path="/wma/collectors/create"
            Component={WmaCollectorCreate}
          />
          <Route exact path="/wma/transactions" Component={WMATransaction} />
          <Route
            exact
            path="/wma/schedules/update"
            Component={ScheduleUpdate}
          />
          <Route exact path="/wma/schedules" Component={WMASchedules} />
          <Route exact path="/wma/profile" Component={WMAProfile} />
          <Route exact path="/wma/transactions" Component={WMATransaction} />
          <Route exact path="/wma/bins" Component={ViewBins} />

          {/* Admin routes */}
          <Route exact path="/admin/dashboard" Component={AdminDashboard} />
          <Route exact path="/admin/garbage" Component={AdminGarbage} />
          <Route
            exact
            path="/admin/garbage/update"
            Component={AdminGarbageUpdate}
          />
          <Route
            exact
            path="/admin/transactions"
            Component={AdminTransactions}
          />
          <Route exact path="/admin/schedules" Component={AdminSchedule} />
          <Route
            exact
            path="/admin/schedules/update"
            Component={AdminScheduleUpdate}
          />
          <Route
            exact
            path="/admin/schedules/create"
            Component={AdminScheduleCreate}
          />
          <Route exact path="/admin/collectors" Component={AdminCollectors} />
          <Route
            exact
            path="/admin/collectors/update"
            Component={AdminCollectorUpdate}
          />
          <Route exact path="/admin/users" Component={AdminUsers} />
          <Route exact path="/admin/wmas" Component={AdminWMAs} />
          <Route exact path="/admin/devices" Component={AdminDevice} />
          <Route
            exact
            path="/admin/devices/update"
            Component={AdminDeviceUpdate}
          />
          <Route exact path="/admin/bins" Component={AdminBins} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
