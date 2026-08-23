import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Education");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !goal) {
      alert("Please fill all required fields");
      return;
    }

    if (!user) {
      alert("User session expired. Please log in again.");
      navigate("/organization-login");
      return;
    }

    try {
      const response = await fetchApi("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          goalAmount: Number(goal),
          image: image || previewImage || "",
          category,
          organizationId: user._id || user.id || user.email,
          createdBy: user.name || "Organization",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Campaign Created Successfully 🎉");
        navigate("/my-campaigns");
      } else {
        alert(data.message || "Failed to create campaign");
      }
    } catch (error) {
      console.error(error);
      alert("Error Creating Campaign");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white p-8">
          <h1 className="text-4xl font-bold">Create Campaign</h1>
          <p className="mt-2">Start fundraising for a meaningful cause.</p>
          <p className="mt-4 font-semibold">
            Organization: {user?.name || "Verified Organization"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <textarea
              rows="5"
              placeholder="Campaign Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <input
              type="number"
              placeholder="Goal Amount (₹)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <img
              src={
                previewImage ||
                image ||
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
              }
              alt="Preview"
              className="w-full h-52 object-cover rounded-lg mb-4 shadow"
            />

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                setSelectedImage(file);
                setPreviewImage(URL.createObjectURL(file));

                const formData = new FormData();
                formData.append("image", file);

                try {
                  setUploading(true);
                  const res = await fetchApi("/api/auth/upload-campaign", {
                    method: "POST",
                    body: formData,
                  });

                  if (res.ok) {
                    const data = await res.json();
                    if (data.image) {
                      setImage(data.image);
                    }
                  }
                } catch (error) {
                  console.error("Image upload failed:", error);
                } finally {
                  setUploading(false);
                }
              }}
              className="w-full border p-3 mb-4 rounded-lg"
            />
            {uploading && (
              <p className="text-xs text-purple-600 mb-4 font-semibold">Uploading image...</p>
            )}

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Education">🎓 Education</option>
              <option value="Food">🍲 Food</option>
              <option value="Medical">🏥 Medical</option>
              <option value="Animals">🐶 Animals</option>
              <option value="Disaster Relief">🚨 Disaster Relief</option>
              <option value="Women Empowerment">👩 Women Empowerment</option>
            </select>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Create Campaign
            </button>
          </form>

          {/* PREVIEW */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Campaign Preview</h2>
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
              <img
                src={
                  previewImage ||
                  image ||
                  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                }
                alt="preview"
                className="w-full h-56 object-cover"
              />

              <div className="p-4">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                  {category}
                </span>

                <h3 className="text-xl font-bold mt-3">{title || "Campaign Title"}</h3>

                <p className="text-gray-600 mt-2">
                  {description || "Campaign description will appear here..."}
                </p>

                <p className="font-semibold mt-3 text-purple-700">Goal: ₹{goal || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}