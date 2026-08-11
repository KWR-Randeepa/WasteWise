import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
} from "lucide-react";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.log(err));
  }, []);

  // FILTER + SEARCH
  const filteredDocs = documents.filter((doc) => {
    const matchesType =
      filter === "All" || doc.type === filter;

    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg mb-8">
        <h1 className="text-4xl font-bold mb-2">
          📄 WasteWise Documents
        </h1>

        <p className="text-blue-100">
          Access forms, reports, and policy documents
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-8">

        <div className="flex flex-col md:flex-row gap-4">

          {/* SEARCH */}
          <div className="flex items-center border rounded-xl px-4 flex-1">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 outline-none"
            />
          </div>

          {/* FILTER */}
          <div className="flex items-center border rounded-xl px-3">
            <Filter size={18} className="text-gray-400 mr-2" />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-3 outline-none bg-transparent"
            >
              <option>All</option>
              <option>Form</option>
              <option>Report</option>
              <option>Policy</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENT GRID */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <p className="text-gray-500 text-lg">
            No documents found
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
            >

              {/* TOP */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-5 text-white">

                <div className="flex justify-between items-start">
                  <FileText size={40} />

                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {doc.type}
                  </span>
                </div>

                <h2 className="text-xl font-bold mt-4 line-clamp-2">
                  {doc.title}
                </h2>
              </div>

              {/* BODY */}
              <div className="p-5">

                <p className="text-gray-600 text-sm min-h-[60px]">
                  {doc.description || "No description available"}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-6">

                  {/* VIEW */}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition"
                  >
                    <Eye size={18} />
                    View
                  </a>

                  {/* DOWNLOAD */}
                  <a
                    href={doc.fileUrl}
                    download={`${doc.title}.pdf`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition"
                  >
                    <Download size={18} />
                    Download
                  </a>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Documents;
