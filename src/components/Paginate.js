import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function Paginate({
  postsPerPage,
  totalPosts,
  paginate,
  previousPage,
  nextPage,
  currentPage,
}) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-container">
      <ul className="pagination flex justify-end gap-1 text-white items-center m-3">
        <ChevronLeftIcon
          onClick={previousPage}
          className="w-7 cursor-pointer"
        />
        {pageNumbers.map((number) => (
          <li
            key={number}
            onClick={() => paginate(number)}
            className="page-number cursor-pointer p-1"
          >
            <span
              className={`${
                currentPage === number ? "text-2xl font-extrabold" : undefined
              }`}
            >
              {number}
            </span>
          </li>
        ))}
        <ChevronRightIcon onClick={nextPage} className="w-7 cursor-pointer" />
      </ul>
    </div>
  );
}
