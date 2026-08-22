import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [goalAmount, setGoalAmount] =
    useState("");

  const [image, setImage] =
    useState("");
  const [previewImage, setPreviewImage] =
    useState("");

  const [category, setCategory] =
    useState("Education");

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    try {
      const res = await fetch(
        `https://online-donation-platform-x9rc.onrender.com/api/campaigns/${id}`
      );

      const data =
        await res.json();

      setTitle(data.title);
      setDescription(
        data.description
      );
      setGoalAmount(
        data.goalAmount
      );
      setImage(data.image);
      setCategory(
        data.category
      );
      setImage(data.image);
setPreviewImage(data.image);

    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate =
  async (e) => {

    e.preventDefault();

    console.log("Saving Image:", image);

    try {

        const res =
          await fetch(
            `https://online-donation-platform-x9rc.onrender.com/api/campaigns/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                title,
                description,
                goalAmount:
                  Number(
                    goalAmount
                  ),
                image,
                category,
              }),
            }
          );

        const data =
          await res.json();

        if (res.ok) {

          alert(
            "Campaign Updated Successfully 🎉"
          );

          navigate(
            "/my-campaigns"
          );

        } else {

          alert(
            data.message
          );

        }

      } catch (error) {

        console.log(error);

        alert(
          "Failed to update campaign"
        );

      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 py-10 px-4">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white p-8">

          <h1 className="text-4xl font-bold">
            Edit Campaign
          </h1>

          <p className="mt-2">
            Update campaign details
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-8 p-8">

          {/* FORM */}
          <form
            onSubmit={
              handleUpdate
            }
          >

            <input
              type="text"
              placeholder="Campaign Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full border p-3 mb-4 rounded-lg"
            />

            <textarea
              rows="5"
              placeholder="Campaign Description"
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full border p-3 mb-4 rounded-lg"
            />

            <input
              type="number"
              placeholder="Goal Amount"
              value={
                goalAmount
              }
              onChange={(e) =>
                setGoalAmount(
                  e.target.value
                )
              }
              className="w-full border p-3 mb-4 rounded-lg"
            />

            <img
  src={
    previewImage ||
    image ||
    "https://via.placeholder.com/300"
  }
  alt="Preview"
  className="w-full h-52 object-cover rounded-lg mb-4"
/>

<input
  type="file"
  accept="image/*"
  onChange={async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setPreviewImage(
      URL.createObjectURL(file)
    );

    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    const res =
      await fetch(
        "https://online-donation-platform-x9rc.onrender.com/api/auth/upload-campaign",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await res.json();

    setImage(
      `https://online-donation-platform-x9rc.onrender.com${data.image}`
    );

  }}
  className="w-full border p-3 rounded-lg mb-4"
/>

            <select
              value={
                category
              }
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full border p-3 mb-4 rounded-lg"
            >
              <option value="Education">
                🎓 Education
              </option>

              <option value="Food">
                🍲 Food
              </option>

              <option value="Medical">
                🏥 Medical
              </option>

              <option value="Animals">
                🐶 Animals
              </option>

              <option value="Disaster Relief">
                🚨 Disaster Relief
              </option>

              <option value="Women Empowerment">
                👩 Women Empowerment
              </option>

            </select>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
            >
              Update Campaign
            </button>

          </form>

          {/* PREVIEW */}
          <div>

            <h2 className="text-2xl font-bold mb-4">
              Live Preview
            </h2>

            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">

              <img
                src={
                  image ||
                  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                }
                alt="Preview"
                className="w-full h-56 object-cover"
              />

              <div className="p-4">

                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                  {category}
                </span>

                <h3 className="text-xl font-bold mt-3">
                  {title ||
                    "Campaign Title"}
                </h3>

                <p className="text-gray-600 mt-2">
                  {description ||
                    "Campaign description..."}
                </p>

                <p className="font-semibold mt-3">
                  Goal: ₹
                  {goalAmount || 0}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}