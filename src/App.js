import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useEffect, useState } from "react";
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
        finalResults.push(item);
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

  return (
    <div>
      <div>
        <input
          type="text"
          id="country-search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
          placeholder="Enter a country name..."
          required
        />
      </div>
      <Paginate
        postsPerPage={countriesPerPage}
        totalPosts={countries.length}
        paginate={paginate}
        previousPage={previousPage}
        nextPage={nextPage}
      />
      {searchResults.length > 0 && searchQuery.length > 0
        ? JSON.stringify(searchResults)
        : JSON.stringify(paginatedCountries)}
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
