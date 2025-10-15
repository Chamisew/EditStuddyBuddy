import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WmaAuthService from "../../../api/wmaApi";
import logo from "../../../assets/logo.png";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import StorageIcon from "@mui/icons-material/Storage";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LogoutIcon from "@mui/icons-material/Logout";
import ScheduleIcon from "@mui/icons-material/Schedule"; // Import ScheduleIcon
import AnalyticsIcon from "@mui/icons-material/Analytics";

// Custom Components
import { toast, ToastContainer } from "react-toastify";
import { getUrgentBinsForWma } from "../../../api/binApi";

const drawerWidth = 240;
const iconStyle = { fontSize: 20, color: "#777777" };
const listItemTextStyle = {
  "& .MuiListItemText-primary": {
    fontSize: 13,
    fontWeight: 600,
    color: "#777777",
  },
};

const WMADrawer = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [urgentBins, setUrgentBins] = useState([]);

  useEffect(() => {
    const fetchUrgent = async () => {
      try {
        const res = await getUrgentBinsForWma();
        // api helper returns data directly
        setUrgentBins(res || []);
      } catch (err) {
        console.error("Failed to fetch urgent bins:", err);
      }
    };

    fetchUrgent();
  }, []);

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const userProfile = await UserApi.getCurrentUserDetails();
  //       setProfile(userProfile);
  //       console.log(`Profile =>`, userProfile);
  //     } catch (err) {
  //       setError(err.message);
  //     }
  //   };

  //   fetchProfile();
  // }, []);

  const handleLogout = async () => {
    try {
      const response = await WmaAuthService.logoutCurrentWma();

      toast.success("Logout successful", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <img src={logo} alt="logo" style={{ width: 150 }} />
      </Toolbar>
      <Divider />
      <List>
        {[
          {
            icon: <DashboardIcon sx={iconStyle} />,
            text: "Dashboard",
            link: "/wma/dashboard",
          },
          {
            icon: <DeleteSweepIcon sx={iconStyle} />,
            text: "Collectors",
            link: "/wma/collectors",
          },
          // {
          //   icon: <PaidIcon sx={iconStyle} />,
          //   text: "Transactions",
          //   link: "/wma/transactions",
          // },
          {
            icon: <ScheduleIcon sx={iconStyle} />, // Add ScheduleIcon here
            text: "Schedules",
            link: "/wma/schedules",
          },
          {
            icon: <AnalyticsIcon sx={iconStyle} />,
            text: "Reports & Analytics",
            link: "/wma/reports",
          },
          {
            icon: <StorageIcon sx={iconStyle} />,
            text: `Bins${urgentBins.length ? ` (${urgentBins.length} urgent)` : ""}`,
            link: "/wma/bins",
          },
          {
            icon: <AccountCircleIcon sx={iconStyle} />,
            text: "Profile",
            link: "/wma/profile",
          },
          {
            icon: <LogoutIcon sx={iconStyle} />,
            text: "Logout",
            isLogout: true,
          },
        ].map((item) => (
          <ListItem
            key={item.text}
            onClick={() => {
              if (item.isLogout) {
                handleLogout();
              } else {
                navigate(item.link);
              }
            }}
          >
            <ListItemButton sx={{ paddingLeft: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText sx={listItemTextStyle} primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#f7f7f7",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#f5fadf",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f7f7f7",
        }}
      >
        <Toolbar />
        <div className="usr-drawer-content ">{children}</div>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default WMADrawer;
