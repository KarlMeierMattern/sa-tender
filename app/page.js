"use client";

import React, { useState, useEffect } from "react";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    department: "",
    province: "",
  });
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await fetch("/api/tenders-detail");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.success) {
          setTenders(data.data);
          setFilteredTenders(data.data); // Initialize filtered data
          setCount(data.data.length);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };

      // Apply all active filters
      const newFilteredTenders = tenders.filter((tender) =>
        Object.entries(updatedFilters).every(
          ([key, filterValue]) =>
            !filterValue ||
            tender[key]?.toLowerCase().includes(filterValue.toLowerCase())
        )
      );

      setFilteredTenders(newFilteredTenders);
      setCount(newFilteredTenders.length);
      return updatedFilters;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-slate-100 text-black p-4 w-full">
      <h1 className="text-xl font-bold mb-4">Tenders</h1>
      <p>Count: {count}</p>
      <div className="overflow-x-auto">
        <table className="border-gray-300 w-full table-auto">
          <thead>
            <tr className="border-b-2 border-gray-500 text-left">
              <th className="px-2 py-2 ">
                Category
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-1 mt-1 border border-gray-300 rounded"
                  placeholder="Filter..."
                />
              </th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2">Advertised</th>
              <th className="px-2 py-2">Closing</th>
              <th className="px-2 py-2">Tender Number</th>
              <th className="px-2 py-2">
                Department
                <input
                  type="text"
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full p-1 mt-1 border border-gray-300 rounded"
                  placeholder="Filter..."
                />
              </th>
              <th className="px-2 py-2 ">Tender Type</th>
              <th className="px-2 py-2 ">
                Province
                <input
                  type="text"
                  name="province"
                  value={filters.province}
                  onChange={handleFilterChange}
                  className="w-full p-1 mt-1 border border-gray-300 rounded"
                  placeholder="Filter..."
                />
              </th>
              <th className="px-2 py-2 ">Place Services Required</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenders.map((tender, index) => (
              <tr
                key={index}
                className="border-b border-gray-300 break-words whitespace-normal"
              >
                <td className="px-2 py-2 ">{tender.category}</td>
                <td className="px-2 py-2 ">{tender.description}</td>
                <td className="px-2 py-2 ">{tender.advertised}</td>
                <td className="px-2 py-2 ">{tender.closing}</td>
                <td className="px-2 py-2">{tender.tendernumber}</td>
                <td className="px-2 py-2 ">{tender.department}</td>
                <td className="px-2 py-2 ">{tender.tendertype}</td>
                <td className="px-2 py-2 ">{tender.province}</td>
                <td className="px-2 py-2 ">{tender.placeServicesRequired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
