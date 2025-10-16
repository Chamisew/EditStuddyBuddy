import { useState, useEffect } from "react";
import UserDrawer from "../components/UserDrawer";
import AuthService from "../../../api/userApi";
import { getAllAreas } from "../../../api/areaApi";
import { ToastContainer, toast } from "react-toastify";

import user from "../../../assets/user.png";
import email from "../../../assets/icons/email.png";
import phone from "../../../assets/icons/phone.png";
import address from "../../../assets/icons/location.png";
import dropdown from "../../../assets/icons/dropdown.png";
import editprofile from "../../../assets/icons/editprofile.png";

import { useNavigate } from "react-router";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [imageSelected, setImageSelected] = useState("");
  const [isToggleDropdownforInformation, setToggleDropdownforInformation] =
    useState(true);
  const [updateProfile, setUpdateProfile] = useState({
    username: "",
    email: "",
    area: "",
    contact: "",
    address: "",
    profileImage: "",
  });

  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState("");

  // Fetch current user details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await AuthService.getCurrentUserDetails();
        setProfile(userProfile);
        setUpdateProfile({
          username: userProfile.username || "",
          email: userProfile.email || "",
          area: userProfile.area?._id || "", // Set the area ID from user profile
          contact: userProfile.contact || "",
          address: userProfile.address || "",
          profileImage: userProfile.profileImage || "",
        });
        setAreaId(userProfile.area?._id || ""); // Set areaId from user profile
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);
  const toggleDropdownforInformation = () => {
    setToggleDropdownforInformation(!isToggleDropdownforInformation);
  };
  // Fetch all areas
  useEffect(() => {
    const fetchAllAreas = async () => {
      try {
        const res = await getAllAreas();
        setAreas(res);
      } catch (error) {
        alert(error.message);
        console.error("Error fetching Areas: ", error.message);
      }
    };
    fetchAllAreas();
  }, []);

  // if (error) return <div>Error: {error}</div>;
  // if (!profile) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAreaChange = (e) => {
    setAreaId(e.target.value); // Update areaId based on selected option
  };

  const uploadImage = async () => {
    const data = new FormData();
    data.append("file", imageSelected);
    data.append("upload_preset", "GarboGoUser_Preset");
    data.append("cloud_name", "dg8cpnx1m");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dg8cpnx1m/image/upload",
      {
        method: "POST",
        body: data,
      },
    );
    const imageUrl = await res.json();
    return imageUrl.url;
  };

  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      let profileImageUrl = updateProfile.profileImage;

      if (imageSelected) {
        profileImageUrl = await uploadImage();
      }
      const updatedProfileData = {
        ...updateProfile,
        area: areaId, // Pass the selected areaId to update
        profileImage: profileImageUrl,
      };

      await AuthService.updateUser(updatedProfileData);
      toast.success("Your Profile Updated successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      // setToggleDropdownforInformation(false);

      setProfile((prevProfile) => ({
        ...prevProfile,
        ...updatedProfileData,
      }));

      setIsLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <UserDrawer>
        <div className="flex flex-col items-center justify-center">
          <div className="w-full rounded border-[3px] p-5">
            <div className="flex justify-around">
              <div className="flex justify-center w-full">
                <div className="my-5 justify-center flex mx-5">
                  <img
                    src={profile?.profileImage || user}
                    alt="Profile"
                    className="w-[120px] h-[120px] rounded-full"
                  />
                </div>
                <div className="justify-center flex">
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="text-[24px] font-bold text-[#48752c]">
                      <span>{profile?.username}</span>
                    </div>
                    <div>
                      <img
                        src={address}
                        alt="Location"
                        className="mx-auto w-[20px] h-[20px] mr-4 inline-block"
                      />
                      <span>{profile?.area?.name || "No area selected"}</span>
                    </div>
                    <div>
                      <img
                        src={email}
                        alt="Email"
                        className="mx-auto w-[20px] h-[20px] mr-4 inline-block"
                      />
                      <span>{profile?.email}</span>
                    </div>
                    <div>
                      <img
                        src={phone}
                        alt="Phone"
                        className="mx-auto w-[20px] h-[20px] mr-4 inline-block"
                      />
                      <span>{profile?.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col items-end justify-end w-[30%]">
                <div
                  onClick={toggleDropdownforInformation}
                  className="absolute top-0 right-0 bg-gray-300 hover:bg-[#f9da78] w-[50px] shadow-xl h-[50px] flex items-center justify-center rounded-full mb-2"
                >
                  <img
                    src={editprofile}
                    alt="Edit"
                    className="mx-auto w-[25px] h-[25px]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-full py-5 flex items-start">
            <div className="w-[100%] h-auto rounded border-[3px] p-3 mr-2 border-[#48752c]">
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-[21px] my-1">
                  Update Personal Information
                </h1>
                <img
                  src={dropdown}
                  alt="dropdown"
                  className={`w-[20px] h-[20px] cursor-pointer transition-transform duration-300 ${
                    isToggleDropdownforInformation ? "rotate-180" : "rotate-0"
                  }`}
                  onClick={toggleDropdownforInformation}
                />
              </div>
              {isToggleDropdownforInformation && (
                <div className="m-4">
                  <div className="flex flex-col space-y-2">
                    <h1 className="font-bold">Name:</h1>
                    <input
                      type="text"
                      name="username"
                      value={updateProfile.username}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="py-2 px-5 bg-[#64625c1a] text-[16px] rounded-full"
                    />
                    <h1 className="font-bold">Email:</h1>
                    <input
                      type="email"
                      name="email"
                      value={updateProfile.email}
                      // onChange={handleInputChange}
                      readOnly
                      placeholder="Enter your email"
                      className="py-2 px-5 bg-[#64625c1a] text-[16px] rounded-full bg-gray-50"
                    />
                    <h1 className="font-bold">Area:</h1>
                    <select
                      name="area"
                      value={areaId} // Use areaId as the value
                      onChange={handleAreaChange} // Update areaId on change
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                      required
                    >
                      <option value="">Select Your Area</option>
                      {areas.length > 0 ? (
                        areas.map((areaItem) => (
                          <option key={areaItem._id} value={areaItem._id}>
                            {areaItem.name}
                          </option>
                        ))
                      ) : (
                        <option>No areas available</option>
                      )}
                    </select>
                    <h1 className="font-bold">Contact:</h1>
                    <input
                      type="text"
                      name="contact"
                      value={updateProfile.contact}
                      onChange={handleInputChange}
                      placeholder="Enter your contact"
                      className="py-2 px-5 bg-[#64625c1a] text-[16px] rounded-full"
                    />
                    <h1 className="font-bold">Address:</h1>
                    <input
                      type="text"
                      name="address"
                      value={updateProfile.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="py-2 px-5 bg-[#64625c1a] text-[16px] rounded-full"
                    />
                    <h1 className="font-bold">Profile Image:</h1>
                    <input
                      type="file"
                      onChange={(event) =>
                        setImageSelected(event.target.files[0])
                      }
                      className="bg-[#64625c1a] rounded-full"
                    />
                    <button
                      className="bg-[#48752c] w-full py-3 my-5 rounded text-white"
                      onClick={handleUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </UserDrawer>
    </div>
  );
}

export default Profile;
