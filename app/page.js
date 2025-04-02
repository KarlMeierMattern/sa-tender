// implement react query

"use client";

import React, { useState, useEffect } from "react";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
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
        }
      } catch (error) {
        setError(error); // Store the error object
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Tenders</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="border-b-2 border-gray-500 bg-black text-left">
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Advertised</th>
            <th className="px-4 py-2">Closing</th>
            <th className="px-4 py-2">Tender Number</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Tender Type</th>
            <th className="px-4 py-2">Province</th>
            <th className="px-4 py-2">Place Services Required</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((tender, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-2">{tender.category}</td>
              <td className="px-4 py-2">{tender.description}</td>
              <td className="px-4 py-2">{tender.advertised}</td>
              <td className="px-4 py-2">{tender.closing}</td>
              <td className="px-4 py-2">{tender.tendernumber}</td>
              <td className="px-4 py-2">{tender.department}</td>
              <td className="px-4 py-2">{tender.tendertype}</td>
              <td className="px-4 py-2">{tender.province}</td>
              <td className="px-4 py-2">{tender.placeServicesRequired}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// _id
// category
// description
// advertised
// closing
// tendernumber
// department
// tendertype
// province
// placeServicesRequired
