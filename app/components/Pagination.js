import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Debug logs
  console.log("Pagination Props:", { currentPage, totalPages });

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const pageWindow = 1; // Number of pages to show before/after current

    // Always show first page
    if (1 === currentPage) {
      pages.push(
        <Button
          key={1}
          variant="default"
          onClick={() => onPageChange(1)}
          className="w-10 h-10 cursor-pointer"
        >
          1
        </Button>
      );
    } else {
      pages.push(
        <Button
          key={1}
          variant="outline"
          onClick={() => onPageChange(1)}
          className="w-10 h-10 cursor-pointer"
        >
          1
        </Button>
      );
    }

    // Show ellipsis if needed
    if (currentPage - pageWindow > 2) {
      pages.push(
        <span key="ellipsis-start" className="px-2 py-2">
          ...
        </span>
      );
    }

    // Show window of pages around currentPage
    for (
      let i = Math.max(2, currentPage - pageWindow);
      i <= Math.min(totalPages - 1, currentPage + pageWindow);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Already rendered
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

    // Show ellipsis if needed
    if (currentPage + pageWindow < totalPages - 1) {
      pages.push(
        <span key="ellipsis-end" className="px-2 py-2">
          ...
        </span>
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          onClick={() => onPageChange(totalPages)}
          className="w-10 h-10 cursor-pointer"
        >
          {totalPages}
        </Button>
      );
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
