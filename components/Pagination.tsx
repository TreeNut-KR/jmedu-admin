import * as ShadcnPagination from "@/components/shadcn/ui/pagination";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  size: number;
  setPage: (arg: number) => void;
}

export default function Pagination(props: PaginationProps) {
  const totalPage = Math.ceil(props.total / props.limit);
  const halfSize = Math.floor(props.size / 2);
  let startPage = Math.max(1, props.page - halfSize);
  let endPage = Math.min(totalPage, props.page + halfSize);

  if (endPage - startPage + 1 < props.size) {
    if (startPage === 1) {
      endPage = Math.min(totalPage, startPage + props.size - 1);
    } else if (endPage === totalPage) {
      startPage = Math.max(1, endPage - props.size + 1);
    }
  }

  const pages = Array.from({ length: endPage - startPage + 1 }).map((el, idx) => idx + startPage);

  function handlePrev() {
    if (props.page > 1 && props.setPage) {
      props.setPage(props.page - 1);
    }
  }

  function handleNext() {
    if (props.page < totalPage && props.setPage) {
      props.setPage(props.page + 1);
    }
  }

  return (
    <div className="text-adaptiveGray-700">
      <ShadcnPagination.Pagination>
        <ShadcnPagination.PaginationContent>
          <ShadcnPagination.PaginationItem>
            <ShadcnPagination.PaginationPrevious
              className="cursor-pointer"
              href=""
              onClick={handlePrev}
            />
          </ShadcnPagination.PaginationItem>
          {pages.map((page) => (
            <ShadcnPagination.PaginationItem key={page}>
              <ShadcnPagination.PaginationLink
                className="cursor-pointer"
                href=""
                onClick={() => props.setPage(page)}
                isActive={props.page === page}
              >
                {page}
              </ShadcnPagination.PaginationLink>
            </ShadcnPagination.PaginationItem>
          ))}
          <ShadcnPagination.PaginationItem>
            <ShadcnPagination.PaginationNext
              className="cursor-pointer"
              href=""
              onClick={handleNext}
            />
          </ShadcnPagination.PaginationItem>
        </ShadcnPagination.PaginationContent>
      </ShadcnPagination.Pagination>
      <div className="mt-2 text-center text-xs">총 {totalPage} 페이지</div>
    </div>
  );
}
