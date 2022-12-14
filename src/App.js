import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useCallback, useEffect, useRef, useState } from "react";
import { isEmpty, isUndefined } from "lodash";
import Fuse from "fuse.js";
import { useSortableData } from "./hooks";
import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Modal from "./components/Modal";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto pt-12">
          <Catalog />
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function Catalog() {
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [countriesPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalContent, setModalContent] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const indexOfLastPost = currentPage * countriesPerPage;
  const indexOfFirstPost = indexOfLastPost - countriesPerPage;
  const paginatedCountries = countries.slice(indexOfFirstPost, indexOfLastPost);
  const showSearchResults = searchQuery.length > 0 && searchResults.length > 0;
  const countriesList = showSearchResults ? searchResults : paginatedCountries;
  const [showModal, setShowModal] = useState(false);
  const topRow = useRef(null);
  const executeScroll = () =>
    topRow?.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });

  const { items, requestSort, getClassNamesFor } =
    useSortableData(countriesList);

  const searchItem = useCallback(
    (query) => {
      const fuse = new Fuse(countries, {
        isCaseSensitive: false,
        findAllMatches: true,
        includeMatches: false,
        includeScore: true,
        useExtendedSearch: false,
        threshold: 0.4,
        location: 0,
        distance: 2,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: ["name.common"],
      });
      const result = fuse.search(query);
      const finalResults = [];
      if (result.length) {
        result.forEach((item) => {
          finalResults.push(item.item);
        });
        setSearchResults(finalResults);
      }
    },
    [countries]
  );

  const { isLoading, error, data } = useQuery(
    "countriesList",
    () => fetch("https://restcountries.com/v3.1/all").then((res) => res.json()),
    {
      cacheTime: 60000,
    }
  );

  useEffect(() => {
    if (data) {
      setCountries(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchQuery) {
      searchItem(searchQuery);
    }
  }, [searchItem, searchQuery]);

  const previousPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage !== Math.ceil(countries.length / countriesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  function SortIcon({ currentSortDirection }) {
    const handleSort = () => {
      executeScroll();
      requestSort("name.official");
    };

    return (
      <>
        {isUndefined(currentSortDirection) && (
          <ArrowsUpDownIcon onClick={handleSort} className="h-6 w-6" />
        )}
        {currentSortDirection === "ascending" && (
          <ArrowUpIcon onClick={handleSort} className="h-6 w-6" />
        )}
        {currentSortDirection === "descending" && (
          <ArrowDownIcon onClick={handleSort} className="h-6 w-6" />
        )}
      </>
    );
  }

  return (
    <>
      {showModal && (
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          modalContent={modalContent}
        />
      )}
      <div className="relative w-[50%] mx-auto">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full p-4 pl-10 text-sm text-gray-900 rounded-lg bg-gray-50 focus:outline-0 "
          placeholder="Enter Country Name..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div>
        <Paginate
          postsPerPage={countriesPerPage}
          totalPosts={
            showSearchResults ? searchResults.length : countries.length
          }
          paginate={paginate}
          previousPage={previousPage}
          nextPage={nextPage}
        />
        <div className="flex flex-col h-screen">
          <div className="flex-grow overflow-auto rounded-lg">
            <table className="table-fixed relative text-center w-full mb-20">
              <thead className="text-sm">
                <tr ref={topRow}>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Flag
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    <div className="flex items-center">
                      Name (official)
                      <SortIcon
                        currentSortDirection={getClassNamesFor("name.official")}
                      />
                    </div>
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Name (native)
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Name (alt)
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Code (cca2)
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Code (cca3)
                  </th>
                  <th className="sticky top-0 px-6 py-3 text-indigo-900 bg-indigo-300">
                    Calling Codes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-200 bg-indigo-100 text-indigo-900">
                {items.map((country, index) => {
                  const nativeNameKey = isEmpty(country.name.nativeName)
                    ? null
                    : Object.keys(country.name.nativeName)[0];
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        setModalContent(country);
                        setShowModal(true);
                      }}
                      className="cursor-pointer"
                    >
                      <td className="p-0">
                        <img
                          alt="country-flag"
                          src={country.flags.png}
                          className="object-contain w-fit"
                        />
                      </td>
                      <td>{country.name.official}</td>
                      <td>
                        {nativeNameKey
                          ? country.name.nativeName[nativeNameKey].official
                          : "N/A"}
                      </td>
                      <td>{country.altSpellings[1] ?? "N/A"}</td>
                      <td>{country.cca2}</td>
                      <td>{country.cca3}</td>
                      <td>{`${country.idd.root} ${country.idd.suffixes}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

const Paginate = ({
  postsPerPage,
  totalPosts,
  paginate,
  previousPage,
  nextPage,
}) => {
  const [currentPage, setCurrentPage] = useState(null);
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
            onClick={() => {
              setCurrentPage(number);
              paginate(number);
            }}
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
};

export default App;
