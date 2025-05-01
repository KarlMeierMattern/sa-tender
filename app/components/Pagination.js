import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Debug logs
  console.log("Pagination Props:", { currentPage, totalPages });

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 6;

    // Always show first 3 pages
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          onClick={() => onPageChange(i)}
          className="w-10 h-10 cursor-pointer"
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis if there are more pages after 3
    if (showEllipsis && totalPages > 3) {
      pages.push(
        <span key="ellipsis-1" className="px-2 py-2">
          ...
        </span>
      );
    }

    // Add last 3 pages if we have more than 3 pages total
    if (totalPages > 3) {
      for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            onClick={() => onPageChange(i)}
            className="w-10 h-10 cursor-pointer"
          >
            {i}
          </Button>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4 ">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 p-0 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 cursor-pointer" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 p-0 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4 cursor-pointer" />
      </Button>
    </div>
  );
}
