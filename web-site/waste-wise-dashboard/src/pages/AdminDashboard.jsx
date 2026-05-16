import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

// ✅ Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [residents, setResidents] = useState([]);
  const [wasteEntries, setWasteEntries] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Form",
  });

  // ======================================================
  // AUTH
  // ======================================================

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("userInfo")
    );

    if (!data || data.role !== "admin") {
      navigate("/login");
      return;
    }

    setUser(data);

    fetchDocuments();
    fetchResidents();
    fetchWasteEntries();
  }, [navigate]);

  // ======================================================
  // FETCH DOCUMENTS
  // ======================================================

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/documents"
      );

      const data = await res.json();

      if (res.ok) {
        setDocuments(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH RESIDENTS
  // ======================================================

  const fetchResidents = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/users"
      );

      const data = await res.json();

      if (res.ok) {
        const residentUsers = data.filter(
          (user) =>
            user.role === "resident" &&
            user.location
        );

        setResidents(residentUsers);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FETCH WASTE
  // ======================================================

  const fetchWasteEntries = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/waste"
      );

      const data = await res.json();

      if (res.ok) {
        setWasteEntries(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FILE CHANGE
  // ======================================================

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // RANDOM WEIGHT
  // ======================================================

  const generateWeight = (size) => {
    if (size === "small") {
      return Math.floor(Math.random() * 5) + 1;
    }

    if (size === "medium") {
      return Math.floor(Math.random() * 11) + 5;
    }

    if (size === "large") {
      return Math.floor(Math.random() * 6) + 15;
    }

    return 0;
  };

  // ======================================================
  // GET ZONE
  // ======================================================

  const getZone = (lat, lng) => {
    // NORTH WEST
    if (
      lat >= 6.95 &&
      lat <= 7.05 &&
      lng >= 79.8 &&
      lng <= 79.9
    ) {
      return "northWest";
    }

    // NORTH EAST
    if (
      lat >= 6.95 &&
      lat <= 7.05 &&
      lng >= 79.9 &&
      lng <= 80.02
    ) {
      return "northEast";
    }

    // SOUTH WEST
    if (
      lat >= 6.8 &&
      lat <= 6.95 &&
      lng >= 79.8 &&
      lng <= 79.9
    ) {
      return "southWest";
    }

    // SOUTH EAST
    if (
      lat >= 6.8 &&
      lat <= 6.95 &&
      lng >= 79.9 &&
      lng <= 80.02
    ) {
      return "southEast";
    }

    return null;
  };

  // ======================================================
  // ZONE STATS
  // ======================================================

  const zoneStats = {
    northWest: {
      residents: 0,
      residentsWithWaste: 0,
      totalWaste: 0,
      organic: 0,
      solid: 0,
    },

    northEast: {
      residents: 0,
      residentsWithWaste: 0,
      totalWaste: 0,
      organic: 0,
      solid: 0,
    },

    southWest: {
      residents: 0,
      residentsWithWaste: 0,
      totalWaste: 0,
      organic: 0,
      solid: 0,
    },

    southEast: {
      residents: 0,
      residentsWithWaste: 0,
      totalWaste: 0,
      organic: 0,
      solid: 0,
    },
  };

  // COUNT RESIDENTS
  residents.forEach((resident) => {
    const zone = getZone(
      resident.location.latitude,
      resident.location.longitude
    );

    if (zone) {
      zoneStats[zone].residents++;
    }
  });

  // COUNT WASTE
  wasteEntries.forEach((entry) => {
    const resident = residents.find(
      (r) => r._id === entry.user?._id
    );

    if (!resident) return;

    const zone = getZone(
      resident.location.latitude,
      resident.location.longitude
    );

    if (!zone) return;

    const weight = generateWeight(
      entry.wasteSize
    );

    zoneStats[zone].totalWaste += weight;

    if (entry.wasteType === "organic") {
      zoneStats[zone].organic++;
    }

    if (entry.wasteType === "solid") {
      zoneStats[zone].solid++;
    }
  });

  // UNIQUE RESIDENTS WITH WASTE
  Object.keys(zoneStats).forEach((zone) => {
    const users = new Set();

    wasteEntries.forEach((entry) => {
      const resident = residents.find(
        (r) => r._id === entry.user?._id
      );

      if (!resident) return;

      const residentZone = getZone(
        resident.location.latitude,
        resident.location.longitude
      );

      if (residentZone === zone) {
        users.add(entry.user._id);
      }
    });

    zoneStats[zone].residentsWithWaste =
      users.size;
  });

  // ======================================================
  // UPLOAD TO CLOUDINARY
  // ======================================================

  const uploadToCloudinary = async () => {
    if (!file) return null;

    const formData = new FormData();

    formData.append("file", file);

    setUploading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      return {
        fileUrl: data.url,
        publicId: data.public_id,
      };
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // ADD DOCUMENT
  // ======================================================

  const handleAddDocument = async (e) => {
    e.preventDefault();

    const uploadResult =
      await uploadToCloudinary();

    if (!uploadResult) {
      alert("Upload Failed");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      fileUrl: uploadResult.fileUrl,
      publicId: uploadResult.publicId,
    };

    try {
      const res = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert("Document Added");

        setForm({
          title: "",
          description: "",
          type: "Form",
        });

        setFile(null);

        fetchDocuments();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // DELETE DOCUMENT
  // ======================================================

  const handleDelete = async (id) => {
    await fetch(
      `http://localhost:5000/api/documents/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchDocuments();
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("userInfo");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* HEADER */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Waste Wise Colombo Management
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl"
        >
          Logout
        </button>
      </div>

      {/* ADMIN INFO */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-slate-100 p-5 rounded-2xl">
            <p className="text-gray-500 text-sm">
              Admin Name
            </p>

            <h2 className="font-bold text-2xl">
              {user?.name}
            </h2>
          </div>

          <div className="bg-slate-100 p-5 rounded-2xl">
            <p className="text-gray-500 text-sm">
              Email
            </p>

            <h2 className="font-bold text-2xl">
              {user?.email}
            </h2>
          </div>

          <div className="bg-slate-100 p-5 rounded-2xl">
            <p className="text-gray-500 text-sm">
              Role
            </p>

            <h2 className="font-bold text-2xl">
              {user?.role}
            </h2>
          </div>

        </div>
      </div>

      {/* ZONE STATS */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* NORTH WEST */}
        <div className="bg-red-100 border border-red-300 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            North West Zone
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Residents</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northWest.residents}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Residents With Waste</p>
              <h2 className="text-3xl font-bold">
                {
                  zoneStats.northWest
                    .residentsWithWaste
                }
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northWest.totalWaste} KG
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Organic Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northWest.organic}
              </h2>
            </div>

          </div>
        </div>

        {/* NORTH EAST */}
        <div className="bg-green-100 border border-green-300 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            North East Zone
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Residents</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northEast.residents}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Residents With Waste</p>
              <h2 className="text-3xl font-bold">
                {
                  zoneStats.northEast
                    .residentsWithWaste
                }
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northEast.totalWaste} KG
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Solid Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.northEast.solid}
              </h2>
            </div>

          </div>
        </div>

        {/* SOUTH WEST */}
        <div className="bg-blue-100 border border-blue-300 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            South West Zone
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Residents</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southWest.residents}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Residents With Waste</p>
              <h2 className="text-3xl font-bold">
                {
                  zoneStats.southWest
                    .residentsWithWaste
                }
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southWest.totalWaste} KG
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Organic Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southWest.organic}
              </h2>
            </div>

          </div>
        </div>

        {/* SOUTH EAST */}
        <div className="bg-purple-100 border border-purple-300 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            South East Zone
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Residents</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southEast.residents}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Residents With Waste</p>
              <h2 className="text-3xl font-bold">
                {
                  zoneStats.southEast
                    .residentsWithWaste
                }
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Total Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southEast.totalWaste} KG
              </h2>
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <p>Solid Waste</p>
              <h2 className="text-3xl font-bold">
                {zoneStats.southEast.solid}
              </h2>
            </div>

          </div>
        </div>

      </div>

      {/* MAP */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">

        <h2 className="text-2xl font-bold mb-5">
          Colombo Resident Map
        </h2>

        <MapContainer
          center={[6.9271, 79.8612]}
          zoom={11}
          style={{
            height: "550px",
            width: "100%",
            borderRadius: "20px",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* NORTH WEST */}
          <Rectangle
            bounds={[
              [6.95, 79.8],
              [7.05, 79.9],
            ]}
            pathOptions={{
              color: "red",
              fillOpacity: 0.2,
            }}
          />

          {/* NORTH EAST */}
          <Rectangle
            bounds={[
              [6.95, 79.9],
              [7.05, 80.02],
            ]}
            pathOptions={{
              color: "green",
              fillOpacity: 0.2,
            }}
          />

          {/* SOUTH WEST */}
          <Rectangle
            bounds={[
              [6.8, 79.8],
              [6.95, 79.9],
            ]}
            pathOptions={{
              color: "blue",
              fillOpacity: 0.2,
            }}
          />

          {/* SOUTH EAST */}
          <Rectangle
            bounds={[
              [6.8, 79.9],
              [6.95, 80.02],
            ]}
            pathOptions={{
              color: "purple",
              fillOpacity: 0.2,
            }}
          />

          {/* RESIDENTS */}
          {residents.map((resident) => (
            <Marker
              key={resident._id}
              position={[
                resident.location.latitude,
                resident.location.longitude,
              ]}
            >
              <Popup>
                <div>
                  <h2 className="font-bold text-lg">
                    {resident.name}
                  </h2>

                  <p>{resident.email}</p>

                  <p>
                    📍 {resident.address}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* DOCUMENT SECTION */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-5">
            Upload Document
          </h2>

          <form
            onSubmit={handleAddDocument}
            className="space-y-4"
          >

            <input
              type="text"
              name="title"
              placeholder="Document Title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-4 rounded-2xl"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-4 rounded-2xl"
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border p-4 rounded-2xl"
            >
              <option>Form</option>
              <option>Policy</option>
              <option>Report</option>
            </select>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border p-4 rounded-2xl"
            />

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold"
            >
              {uploading
                ? "Uploading..."
                : "Add Document"}
            </button>

          </form>
        </div>

        {/* DOCUMENT LIST */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-5">
            Documents
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">

              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-slate-50 border rounded-3xl p-5 hover:shadow-lg transition"
                >

                  <div className="flex items-center gap-4 mb-4">

                    <div className="text-5xl">
                      📄
                    </div>

                    <div>
                      <h2 className="font-bold text-xl">
                        {doc.title}
                      </h2>

                      <p className="text-gray-500">
                        {doc.type}
                      </p>
                    </div>

                  </div>

                  <p className="text-gray-600 mb-5">
                    {doc.description}
                  </p>

                  <div className="flex gap-2">

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-2xl text-center"
                    >
                      View
                    </a>

                    <a
                      href={doc.fileUrl}
                      download={`${doc.title}.pdf`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-2xl text-center"
                    >
                      Download
                    </a>

                    <button
                      onClick={() =>
                        handleDelete(doc._id)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-2xl"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;