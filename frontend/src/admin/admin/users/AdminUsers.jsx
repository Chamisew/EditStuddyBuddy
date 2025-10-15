import { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import AuthService from "../../../api/userApi";

import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import userimage from "../../../assets/user.png";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClickOpen = (id) => {
    console.log(`id => `, id);
    setSelectedUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteUser = async () => {
    if (selectedUserId) {
      try {
        await AuthService.deleteUser(selectedUserId);
        setUsers((currentUser) =>
          currentUser.filter((user) => user._id !== selectedUserId),
        );
        handleClose();
        toast.success("User account has been deleted successfully!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error) {
        alert(error.message);
        console.log("Error deleting garbage: ", error);
      }
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await AuthService.getAllUsers();
      setUsers(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching Users: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const calculateTotalUsers = () => {
    return users.length;
  };

  const downloadPDF = (userData) => {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = "../src/assets/logo.png";

    console.log("Image path: ", imgLogo.src);
    imgLogo.onload = () => {
      //Header
      doc.addImage(imgLogo, "PNG", 14, 10, 55, 15);

      doc.setFont("helvetica", "bold");
      doc.setTextColor("48752c");
      doc.setFontSize(16);
      doc.text("CleanPath Waste Management System", 95, 18);

      // Title
      doc.setFont("helvetica", "normal");
      doc.setTextColor("000000");
      doc.setFontSize(18);
      doc.text("User Management Report", 14, 40);

      doc.setFontSize(11);
      doc.setTextColor(100);

      // Date and Time of Report Generation
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 48);

      // Table for Garbage Collection Summary
      autoTable(doc, {
        startY: 58,
        head: [["Summary", ""]],
        body: [["Total Accounts Registered", userData.totalUsers]],
        theme: "grid",
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20, // Right-aligned
          doc.internal.pageSize.getHeight() - 10, // Positioned at the bottom
        );
        doc.text(
          "CleanPath Waste Management System - Confidential",
          14, // Left-aligned
          doc.internal.pageSize.getHeight() - 10, // Positioned at the bottom
        );
      }

      // Save the PDF
      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
      doc.save(`User_Management_Report_${generatedDate}.pdf`);
      toast.success("Report Generated Successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    };
  };

  return (
    <div>
      <AdminDrawer>
        <h1 className="m-5 text-2xl font-semibold text-green-900">
          Resident Management
        </h1>
        <div className=" m-5 flex justify-between mb-4 text-center">
          <div className="bg-white rounded w-[45%] p-4 flex flex-col justify-center shadow-xl">
            <h1 className="">Total Accounts Registered: </h1>
            <h1 className="text-[28px] font-semibold text-[#48752c]">
              {" "}
              {calculateTotalUsers()}{" "}
            </h1>
          </div>

          <div
            className="bg-[#48752c] cursor-pointer shadow-xl text-white hover:text-[#f9da78] rounded w-[45%] p-4 flex flex-col justify-center"
            onClick={() =>
              downloadPDF({
                totalUsers: calculateTotalUsers(),
              })
            }
          >
            <h1> Click to Download User Management Report</h1>
          </div>
        </div>
        {/* Add search input field */}
        <div className="m-5">
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <table className="w-[96%] m-5 shadow-xl text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <caption className="p-5 shadow-xl  text-lg font-semibold text-left rtl:text-right text-[#48752c]  bg-gray-50 :text-white :bg-gray-800">
            User Account Holders
          </caption>
          <thead className=" text-center text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3 "></th>
              <th scope="col" className="px-4 py-3 ">
                Username
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                area
              </th>
              <th scope="col" className="px-4 py-3">
                Address
              </th>
              <th scope="col" className="px-4 py-3">
                contact
              </th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-center shadow-xl ">
            {filteredUsers.length > 0 ? (
              filteredUsers
                .filter((user) => user.email !== "thimeshaansar@gmail.com")
                .map((user) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700 "
                    key={user._id}
                  >
                    <td className="  px-3">
                      <img
                        src={user?.profileImage || userimage}
                        alt="Profile Picture"
                        className="w-[30px] h-[30px] rounded-full"
                      />
                    </td>
                    <th
                      scope="row"
                      className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                      {user.username}
                    </th>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      {user.area ? user.area.name : "N/A"}
                    </td>
                    <td className="px-4 py-4">{user.address}</td>
                    <td className="px-4 py-4">{user.contact}</td>
                    <td className="px-3 py-4 text-right">
                      <a
                        onClick={() => handleClickOpen(user._id)}
                        className={`font-medium text-red-600 :text-blue-500 cursor-pointer`}
                      >
                        <DeleteIcon />
                      </a>
                    </td>
                  </tr>
                ))
            ) : (
              <div className="w-full text-md text-gray-600 font-semibold m-10 text-center">
                No registered user found!
              </div>
            )}
          </tbody>
        </table>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              The selected user accout will be deleted and cannot be retrieved.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <ToastContainer />
      </AdminDrawer>
    </div>
  );
}

export default AdminUsers;
