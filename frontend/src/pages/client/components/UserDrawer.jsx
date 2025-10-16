import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserApi from "../../../api/userApi";
import { getMyNotifications } from "../../../api/notificationApi";
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import logo from "../../../assets/logo.png";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PaidIcon from "@mui/icons-material/Paid";
import StorageIcon from "@mui/icons-material/Storage";

import LogoutIcon from "@mui/icons-material/Logout";

// Custom Components
import { toast, ToastContainer } from "react-toastify";

const drawerWidth = 240;
const iconStyle = { fontSize: 20, color: "#267a50" };
const listItemTextStyle = {
  "& .MuiListItemText-primary": {
    fontSize: 13,
    fontWeight: 600,
    color: "#267a50",
  },
};

function UserDrawer({ children }) {
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await UserApi.getCurrentUserDetails();
        setProfile(userProfile);
        console.log(`Profile =>`, userProfile);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
    // fetch notifications summary
    const fetchNotes = async () => {
      try {
        const notes = await getMyNotifications();
        if (Array.isArray(notes)) {
          const unread = notes.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to load notifications', err.message);
      }
    };
    fetchNotes();

    const handler = (e) => {
      const unread = e?.detail?.unread ?? 0;
      setUnreadCount(unread);
      // refresh unread count if notifications changed
      (async () => {
        try {
          await getMyNotifications();
        } catch (err) {
          console.error('Failed to refresh notes', err.message);
        }
      })();
    };
    window.addEventListener('notificationsUpdated', handler);
    return () => window.removeEventListener('notificationsUpdated', handler);
  }, []);

  const handleLogout = async () => {
    try {
      // Call server logout endpoint
      await UserApi.logoutCurrentUser();
      // Clear local session storage immediately
      UserApi.logout();

      toast.success("Logout successful", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
      });
      // Redirect to login page shortly after
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Logout failed');
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
            icon: <DashboardIcon sx={iconStyle} color="" />,
            text: "Dashboard",
            link: "/user/dashboard",
          },
          {
            icon: <EventAvailableIcon sx={iconStyle} />,
            text: "Smart Device Requests",
            link: "/user/smartDevice",
          },
          {
            icon: <StorageIcon sx={iconStyle} />,
            text: "Bins",
            link: "/user/bins",
          },
          {
            icon: <DeleteSweepIcon sx={iconStyle} />,
            text: "Garbage Requests",
            link: "/user/my-garbage",
          },
          {
            icon: <EventAvailableIcon sx={iconStyle} />,
            text: "Notifications",
            link: "/user/notifications",
            badge: true,
          },
          {
            icon: <PaidIcon sx={iconStyle} />,
            text: "Transactions",
            link: "/user/my-transaction",
          },
          {
            icon: <AccountCircleIcon sx={iconStyle} />,
            text: "Profile",
            link: "/user/profile",
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
                // If clicking Notifications, optimistically clear the badge immediately
                if (item.link === '/user/notifications') {
                  window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { unread: 0 } }));
                }
                navigate(item.link); // For other items, navigate as usual
              }
            }}
          >
            <ListItemButton sx={{ paddingLeft: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={unreadCount} color="error">
                  <ListItemText sx={listItemTextStyle} primary={item.text} />
                </Badge>
              ) : (
                <ListItemText sx={listItemTextStyle} primary={item.text} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* recent notification details removed per UX request */}
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
          bgcolor: "#ffffff",
          boxShadow: "none",
          borderBottom: '1px solid #e6f6ee'
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
}

export default UserDrawer;
