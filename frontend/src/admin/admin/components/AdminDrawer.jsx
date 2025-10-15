import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../../api/userApi";
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
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaidIcon from "@mui/icons-material/Paid";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupIcon from "@mui/icons-material/Group";
import StorageIcon from "@mui/icons-material/Storage";
import LogoutIcon from "@mui/icons-material/Logout";
import BusinessIcon from "@mui/icons-material/Business";

// Custom Components
import { toast, ToastContainer } from "react-toastify";

const drawerWidth = 240;
const iconStyle = { fontSize: 20, color: "#777777" };
const listItemTextStyle = {
  "& .MuiListItemText-primary": {
    fontSize: 13,
    fontWeight: 600,
    color: "#777777",
  },
};

function AdminDrawer({ children }) {
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

  const handleLogout = async () => {
    try {
      const response = await AuthService.logoutCurrentUser();
      // console.log("Logout status: ", response);

      toast.success("Logged out successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
      // Redirect to dashboard or home page
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
        <Link to="/admin/dashboard">
          <img src={logo} alt="logo" style={{ width: 150 }} />
        </Link>
      </Toolbar>
      <Divider />
      <List>
        {[
          {
            icon: <DashboardIcon sx={iconStyle} color="" />,
            text: "Dashboard",
            link: "/admin/dashboard",
          },
          {
            icon: <DashboardIcon sx={iconStyle} color="" />,
            text: "Devices",
            link: "/admin/devices",
          },
          {
            icon: <DeleteSweepIcon sx={iconStyle} />,
            text: "Garbage Requests",
            link: "/admin/garbage",
          },
          {
            icon: <GroupIcon sx={iconStyle} />,
            text: "Residents",
            link: "/admin/users",
          },
          {
            icon: <StorageIcon sx={iconStyle} />,
            text: "Bins",
            link: "/admin/bins",
          },
          {
            icon: <BusinessIcon sx={iconStyle} />,
            text: "WMAs",
            link: "/admin/wmas",
          },
          {
            icon: <LocalShippingIcon sx={iconStyle} />,
            text: "Collectors",
            link: "/admin/collectors",
          },
          {
            icon: <EventAvailableIcon sx={iconStyle} />,
            text: "Schedules",
            link: "/admin/schedules",
          },
          {
            icon: <PaidIcon sx={iconStyle} />,
            text: "Transactions",
            link: "/admin/transactions",
          },
          {
            icon: <LogoutIcon sx={iconStyle} />,
            text: "Logout",
            isLogout: true,
          },
        ].map((item) => (
          <ListItem
            key={item.text}
            // disablePadding
            onClick={() => {
              if (item.isLogout) {
                handleLogout(); // Call the logout method
              } else {
                navigate(item.link); // For other items, navigate as usual
              }
            }}
          >
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
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
          bgcolor: "#f5fadf",
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
        <div className="usr-drawer-content">{children}</div>
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default AdminDrawer;
