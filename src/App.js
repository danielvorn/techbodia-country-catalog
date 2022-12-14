import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useEffect, useState } from "react";
import { isEmpty, isUndefined } from "lodash";
import Fuse from "fuse.js";
import { useSortableData } from "./hooks";
import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon } from "@heroicons/react/20/solid";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark:bg-stone-700">
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
  const [searchResults, setSearchResults] = useState([]);
  const indexOfLastPost = currentPage * countriesPerPage;
  const indexOfFirstPost = indexOfLastPost - countriesPerPage;
  const paginatedCountries = countries.slice(indexOfFirstPost, indexOfLastPost);
  const showSearchResults = searchQuery.length > 0 && searchResults.length > 0;
  const countriesList = showSearchResults ? searchResults : paginatedCountries;
  const { items, requestSort, getClassNamesFor } =
    useSortableData(countriesList);

  function searchItem(query) {
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
  }

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
  }, [searchQuery]);

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
    return (
      <>
        {isUndefined(currentSortDirection) && (
          <ArrowsUpDownIcon
            onClick={() => requestSort("name.official")}
            className="h-6 w-6"
          />
        )}
        {currentSortDirection === "ascending" && (
          <ArrowUpIcon
            onClick={() => requestSort("name.official")}
            className="h-6 w-6"
          />
        )}
        {currentSortDirection === "descending" && (
          <ArrowDownIcon
            onClick={() => requestSort("name.official")}
            className="h-6 w-6"
          />
        )}
      </>
    );
  }

  return (
    <div>
      <input
        type="text"
        id="country-search-input"
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
        placeholder="Enter a country name..."
        required
      />
      <div>
        <Paginate
          postsPerPage={countriesPerPage}
          totalPosts={countries.length}
          paginate={paginate}
          previousPage={previousPage}
          nextPage={nextPage}
        />
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-md text-left text-gray-900 dark:text-white">
            <thead className="text-sm text-gray-300 bg-gray-50 dark:bg-stone-500 dark:black">
              <tr>
                <th scope="col" className="py-3 px-6">
                  Flag
                </th>
                <th scope="col" className="py-3 px-6">
                  <div className="flex items-center">
                    Name (official)
                    <SortIcon
                      currentSortDirection={getClassNamesFor("name.official")}
                    />
                  </div>
                </th>
                <th scope="col" className="py-3 px-6">
                  Name (native)
                </th>
                <th scope="col" className="py-3 px-6">
                  Name (alt)
                </th>
                <th scope="col" className="py-3 px-6">
                  Code (cca2)
                </th>
                <th scope="col" className="py-3 px-6">
                  Code (cca3)
                </th>
                <th scope="col" className="py-3 px-6">
                  Calling Codes
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((country, index) => {
                const nativeNameKey = isEmpty(country.name.nativeName)
                  ? null
                  : Object.keys(country.name.nativeName)[0];
                return (
                  <tr
                    key={index}
                    className="bg-white dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-400"
                  >
                    <td className="py-4 px-6">
                      <img
                        src={country.flags.png}
                        width="75"
                        style={{ objectFit: "contain", padding: 0 }}
                      />
                    </td>
                    <td className="py-4 px-6">{country.name.official}</td>
                    <td className="py-4 px-6">
                      {nativeNameKey
                        ? country.name.nativeName[nativeNameKey].official
                        : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      {country.altSpellings.map((alt, index) => (
                        <div key={index}>{alt}</div>
                      ))}
                    </td>
                    <td className="py-4 px-6">{country.cca2}</td>
                    <td className="py-4 px-6">{country.cca3}</td>
                    <td className="py-4 px-6">
                      {`${country.idd.root} ${country.idd.suffixes}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Paginate = ({
  postsPerPage,
  totalPosts,
  paginate,
  previousPage,
  nextPage,
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-container">
      <ul className="pagination flex justify-end gap-3 text-white">
        <li onClick={previousPage} className="page-number">
          Prev
        </li>
        {pageNumbers.map((number) => (
          <li
            key={number}
            onClick={() => paginate(number)}
            className="page-number"
          >
            {number}
          </li>
        ))}
        <li onClick={nextPage} className="page-number">
          Next
        </li>
      </ul>
    </div>
  );
};

export default App;
