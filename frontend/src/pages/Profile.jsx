import { useEffect, useState } from "react";
import { fetchApi } from "../utils/api";

export default function Profile() {
  const storedUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [user, setUser] =
    useState(storedUser);
    const [stats, setStats] =
  useState({
    donations: 0,
    amount: 0,
    campaigns: 0,
  });
  useEffect(() => {
    if (user?.role === "donor" && (user?.name || user?._id)) {
      const identifier = user.name || user._id;
      fetchApi(
        `/api/donations/user/${encodeURIComponent(identifier)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const totalAmount =
              data.reduce(
                (sum, donation) =>
                  sum + donation.amount,
                0
              );

            setStats({
              donations:
                data.length,
              amount:
                totalAmount,
              campaigns: new Set(
                data.map(
                  (d) =>
                    d.campaignId
                )
              ).size,
            });
          }
        })
        .catch((err) =>
          console.log(err)
        );
    } else if (user?.role === "organization" && user?._id) {
      fetchApi(`/api/dashboard/organization/${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setStats({
              donations: data.totalCampaigns || 0,
              amount: data.totalRaised || 0,
              campaigns: data.totalDonors || 0,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const [showEdit, setShowEdit] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);
  const [selectedImage, setSelectedImage] =
  useState(null);

const [previewImage, setPreviewImage] =
  useState(
    user?.profileImage || ""
  );

  const [editForm, setEditForm] =
    useState({
      name: user?.name || "",
      email: user?.email || "",
      profileImage:
        user?.profileImage || "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const handleProfileUpdate =
  async () => {
    try {

      let imagePath =
        editForm.profileImage;

      if (selectedImage) {

        const formData =
          new FormData();

        formData.append(
          "image",
          selectedImage
        );

        const uploadRes =
          await fetch(
            "https://online-donation-platform-x9rc.onrender.com/api/auth/upload-profile",
            {
              method: "POST",
              body: formData,
            }
          );

        const uploadData =
          await uploadRes.json();

        imagePath =
          `https://online-donation-platform-x9rc.onrender.com${uploadData.image}`;
      }

      const res = await fetch(
        `https://online-donation-platform-x9rc.onrender.com/api/auth/update-profile/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: editForm.name,
            email: editForm.email,
            profileImage:
              imagePath,
          }),
        }
      );

      const data =
        await res.json();

      if (res.ok) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

        setUser(data.user);

        alert(
          "Profile Updated Successfully"
        );

        setShowEdit(false);

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

    }
  };

  const handlePasswordChange =
    async () => {
      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        alert(
          "Passwords do not match"
        );
        return;
      }

      try {
        const res = await fetch(
          `https://online-donation-platform-x9rc.onrender.com/api/auth/change-password/${user._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              currentPassword:
                passwordForm.currentPassword,
              newPassword:
                passwordForm.newPassword,
            }),
          }
        );

        const data =
          await res.json();

        if (res.ok) {
          alert(
            "Password Updated Successfully"
          );

          setShowPassword(false);

          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-6">

          <div className="flex items-center gap-5">

            <img
              src={
                user?.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />

            <div>

              <h1 className="text-3xl font-bold">
                {user?.name}
              </h1>

              <p className="text-lg capitalize">
                {user?.role}
              </p>

            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-6">

  <div className="bg-white rounded-xl p-5 shadow">
    <h3 className="text-gray-500">
      {user?.role === "organization" ? "Campaigns Created" : "Total Donations"}
    </h3>

    <h2 className="text-3xl font-bold text-purple-700">
      {stats.donations}
    </h2>
  </div>

  <div className="bg-white rounded-xl p-5 shadow">
    <h3 className="text-gray-500">
      {user?.role === "organization" ? "Total Funds Raised" : "Amount Donated"}
    </h3>

    <h2 className="text-3xl font-bold text-green-600">
      ₹{stats.amount}
    </h2>
  </div>

  <div className="bg-white rounded-xl p-5 shadow">
    <h3 className="text-gray-500">
      {user?.role === "organization" ? "Total Donors" : "Campaigns Supported"}
    </h3>

    <h2 className="text-3xl font-bold text-blue-600">
      {stats.campaigns}
    </h2>
  </div>

</div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6">
            Profile Information
          </h2>

          <div className="space-y-5">

            <div>
              <p className="text-gray-500">
                Full Name
              </p>

              <p className="text-lg font-semibold">
                {user?.name}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Email Address
              </p>

              <p className="text-lg font-semibold">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Account Type
              </p>

              <div className="flex items-center gap-3">

  <p className="text-lg capitalize">
    {user?.role}
  </p>

  <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
    ✓ Verified
  </span>

</div>

<p className="mt-2">
  {user?.email}
</p>
            </div>

          </div>

          <div className="flex gap-4 mt-8">

            <button
              onClick={() =>
                setShowEdit(true)
              }
              className="bg-purple-600 text-white px-5 py-2 rounded-lg"
            >
              Edit Profile
            </button>

            <button
              onClick={() =>
                setShowPassword(
                  true
                )
              }
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Change Password
            </button>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-2xl font-bold mb-4">
              Edit Profile
            </h2>

            <input
              type="text"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  name:
                    e.target.value,
                })
              }
              className="border p-3 rounded w-full mb-3"
            />

            <input
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  email:
                    e.target.value,
                })
              }
              className="border p-3 rounded w-full mb-3"
            />

            <img
  src={
    previewImage ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt="Preview"
  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    setPreviewImage(
      URL.createObjectURL(
        file
      )
    );

  }}
  className="border p-3 rounded w-full mb-4"
/>

            <div className="flex gap-3">

              <button
                onClick={
                  handleProfileUpdate
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() =>
                  setShowEdit(
                    false
                  )
                }
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPassword && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-2xl font-bold mb-4">
              Change Password
            </h2>

            <input
              type="password"
              placeholder="Current Password"
              value={
                passwordForm.currentPassword
              }
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword:
                    e.target.value,
                })
              }
              className="border p-3 rounded w-full mb-3"
            />

            <input
              type="password"
              placeholder="New Password"
              value={
                passwordForm.newPassword
              }
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword:
                    e.target.value,
                })
              }
              className="border p-3 rounded w-full mb-3"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={
                passwordForm.confirmPassword
              }
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword:
                    e.target.value,
                })
              }
              className="border p-3 rounded w-full mb-4"
            />

            <div className="flex gap-3">

              <button
                onClick={
                  handlePasswordChange
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>

              <button
                onClick={() =>
                  setShowPassword(
                    false
                  )
                }
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}