"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { ResponsiveContainer } from "recharts";
// Dynamically import the WordCloud component with SSR disabled to avoid hydration issues
const WordCloud = dynamic(() => import("react-d3-cloud"), {
  ssr: false,
});

export default function KeywordCloud({ data }) {
  // Callbacks for word interactions
  const onWordClick = useCallback((word) => {
    console.log(word);
    // You can add custom behavior here when a word is clicked
  }, []);

  if (!data || data.length === 0) {
    return <div className="text-center p-4">No keyword data available.</div>;
  }

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tender Keyword Cloud
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Common keywords found in tender descriptions
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <WordCloud
          data={data}
          fontSize={(word) => Math.log2(word.value) * 5}
          rotate={(word) => word.value % 360}
          onWordClick={(event, d) => {
            console.log(`onWordClick: ${d.text}`);
          }}
          onWordMouseOver={(event, d) => {
            console.log(`onWordMouseOver: ${d.text}`);
          }}
          onWordMouseOut={(event, d) => {
            console.log(`onWordMouseOut: ${d.text}`);
          }}
          padding={2}
          font="Arial"
          fill="#B8C5FF"
        />
      </ResponsiveContainer>
    </div>
  );
}
