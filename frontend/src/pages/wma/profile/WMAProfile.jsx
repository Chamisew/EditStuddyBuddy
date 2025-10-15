import { useState, useEffect } from "react";
import WMADrawer from "../components/WMADrawer";
import AuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";

import wma from "../../../assets/company.png";
import email from "../../../assets/icons/email.png";
import phone from "../../../assets/icons/phone.png";
import address from "../../../assets/icons/location.png";
import dropdown from "../../../assets/icons/dropdown.png";
import editprofile from "../../../assets/icons/editprofile.png";

const WMAProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const [imageSelected, setImageSelected] = useState("");

  const [isToggleDropdownforInformation, setToggleDropdownforInformation] =
    useState(true);
  const [updateProfile, setUpdateProfile] = useState({
    wmaname: "",
    contact: "",
    address: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const wmaProfile = await AuthService.getCurrentWmaDetails();
        setProfile(wmaProfile);
        setUpdateProfile({
          wmaname: wmaProfile.wmaname || "",
          contact: wmaProfile.contact || "",
          authNumber: wmaProfile.authNumber || "",
          address: wmaProfile.address || "",
          profileImage: wmaProfile.profileImage || "",
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  // if (error) return <div>Error: {error}</div>;
  // if (!profile) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateProfile((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const toggleDropdownforInformation = () => {
    setToggleDropdownforInformation(!isToggleDropdownforInformation);
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
    console.log("Profile to update:", updateProfile);
    setIsLoading(true);

    try {
      let profileImageUrl = updateProfile.profileImage;

      if (imageSelected) {
        profileImageUrl = await uploadImage();
      }

      const updatedProfileData = {
        ...updateProfile,
        profileImage: profileImageUrl || updateProfile.profileImage, // Keep old image if no new image is uploaded
      };

      const response = await AuthService.updateWma(updatedProfileData);
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
      <WMADrawer>
        <div className="flex flex-col items-center justify-center ">
          <div className=" w-full rounded border-[3px]  p-5 ">
            <div className=" flex justify-around ">
              <div className="flex justify-center w-full">
                <div className=" my-5 justify-center flex mx-5 ">
                  <img
                    src={profile?.profileImage || wma}
                    alt="Profile Picture"
                    className="w-[120px] h-[120px] rounded-full"
                  />
                </div>

                <div className="justify-center flex">
                  <div className=" flex flex-col justify-center space-y-3">
                    <div className=" text-[24px] font-bold text-[#48752c]">
                      <span>{profile?.wmaname}</span>
                    </div>
                    <div className="">
                      <img
                        src={address}
                        alt="Logo"
                        className="mx-auto w-[20px] h-[20px] mr-4  inline-block"
                      />
                      <span>{profile?.address}</span>
                    </div>
                    <div className="">
                      <img
                        src={email}
                        alt="Logo"
                        className="mx-auto w-[20px] h-[20px] mr-4  inline-block"
                      />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="">
                      <img
                        src={phone}
                        alt="Logo"
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
                    alt="edit"
                    className="mx-auto w-[25px] h-[25px] inline-block"
                  />
                </div>
                <div className="items-center justify-center px-5 flex flex-col bg-[#48752c] text-center rounded-3xl shadow-lg p-2">
                  <h1 className="text-[24px] font-bold text-[#f9da78]">
                    {profile?.authNumber}
                  </h1>
                  <h1 className="text-[16px] text-white">Auth Number</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-full py-5 flex items-start">
            <div className=" w-[100%] h-auto rounded border-[3px] p-3 mr-2 border-[#48752c]">
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
                  <div className="flex flex-col justify-around space-y-2 ">
                    <h1 className="font-bold">Name: </h1>
                    <input
                      type="text"
                      name="wmaname"
                      value={updateProfile.wmaname}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="py-2 px-5 bg-[#64625c1a] text-[16px] rounded-br-full rounded-bl-full rounded-tl-full"
                    />
                  </div>

                  <div className="items-center flex flex-col justify-center">
                    <div className="w-full my-2">
                      <h1 className="font-bold">Current Address: </h1>
                      <input
                        type="text"
                        name="address"
                        value={updateProfile.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                        className="py-2 px-5 w-full bg-[#64625c1a] text-[16px] rounded-br-full rounded-bl-full rounded-tl-full"
                      />
                    </div>
                    <div className="w-full my-2">
                      <h1 className="font-bold"> Upload Profile Image </h1>
                      <input
                        type="file"
                        name="image"
                        id="image"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 :bg-gray-700 :border-gray-600 :placeholder-gray-400 :text-white :focus:ring-blue-500 :focus:border-blue-500"
                        onChange={(e) => setImageSelected(e.target.files[0])}
                      />
                    </div>
                  </div>
                  <div className="mt-5 w-full text-center bg-[#48752c] text-[16px] rounded-full inline-block">
                    <button
                      className="px-5 py-2 text-center text-white"
                      onClick={handleUpdate}
                    >
                      Update Information
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <ToastContainer />
      </WMADrawer>
    </div>
  );
};

export default WMAProfile;
