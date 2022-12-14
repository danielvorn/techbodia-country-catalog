import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import Fuse from "fuse.js";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Catalog />
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
  const [sortedCountries, setSortedCountries] = useState(null);
  const indexOfLastPost = currentPage * countriesPerPage;
  const indexOfFirstPost = indexOfLastPost - countriesPerPage;
  const paginatedCountries = countries.slice(indexOfFirstPost, indexOfLastPost);

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

  const showSearchResults = searchQuery.length > 0 && searchResults.length > 0;
  const countriesList = showSearchResults ? searchResults : paginatedCountries;
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

      <div className="flex gap-3 mb-3">
        <button>Sort By Name (official)</button>
      </div>
      <div>
        <Paginate
          postsPerPage={countriesPerPage}
          totalPosts={countries.length}
          paginate={paginate}
          previousPage={previousPage}
          nextPage={nextPage}
        />
        <table>
          <thead>
            <tr>
              <th align="center">Countries</th>
              <th align="center">Name (Official)</th>
              <th align="center">Name (Native)</th>
              <th align="center">Name (Alt)</th>
              <th align="center">Code (cca2)</th>
              <th align="center">Code (cca3)</th>
              <th align="center">Calling Codes</th>
            </tr>
          </thead>
          <tbody>
            {countriesList.map((country) => {
              const nativeNameKey = isEmpty(country.name.nativeName)
                ? null
                : Object.keys(country.name.nativeName)[0];
              return (
                <tr>
                  <td>
                    <img
                      src={country.flags.png}
                      width="75"
                      style={{ objectFit: "contain", padding: 0 }}
                    />
                  </td>
                  <td align="center">{country.name.official}</td>
                  <td align="center">
                    {nativeNameKey
                      ? country.name.nativeName[nativeNameKey].official
                      : "N/A"}
                  </td>
                  <td align="center">
                    {country.altSpellings.map((alt) => (
                      <div>{alt}</div>
                    ))}
                  </td>
                  <td align="center">{country.cca2}</td>
                  <td align="center">{country.cca3}</td>
                  <td align="center">{`${country.idd.root} ${country.idd.suffixes}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
      <ul className="pagination flex justify-end gap-3">
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
