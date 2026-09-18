import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const renderPageButton = (pageNum) => (
    <Button
      key={pageNum}
      variant={currentPage === pageNum ? "default" : "outline"}
      onClick={() => onPageChange(pageNum)}
      className="h-10 w-10 cursor-pointer"
      aria-label={`Go to page ${pageNum}`}
      aria-current={currentPage === pageNum ? "page" : undefined}
    >
      {pageNum}
    </Button>
  );

  const renderPageNumbers = () => {
    const pages = [];
    const pageWindow = 1;

    pages.push(renderPageButton(1));

    if (currentPage - pageWindow > 2) {
      pages.push(
        <span key="ellipsis-start" className="px-2 py-2">
          ...
        </span>
      );
    }

    for (
      let i = Math.max(2, currentPage - pageWindow);
      i <= Math.min(totalPages - 1, currentPage + pageWindow);
      i++
    ) {
      if (i === 1 || i === totalPages) continue;
      pages.push(renderPageButton(i));
    }

    if (currentPage + pageWindow < totalPages - 1) {
      pages.push(
        <span key="ellipsis-end" className="px-2 py-2">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      pages.push(renderPageButton(totalPages));
    }

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center space-x-2 py-4"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 p-0 cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 p-0 cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
