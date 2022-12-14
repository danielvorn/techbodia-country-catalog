import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useCallback, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Paginate from "./components/Paginate";
import SearchInput from "./components/SearchInput";
import Table from "./components/Table";
import Spinner from "./components/Spinner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
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
  const showSearchResults = searchQuery.length > 0 && searchResults.length > 0;

  const paginatedCountries = useMemo(() => {
    const result = showSearchResults ? searchResults : countries;
    return result.slice(indexOfFirstPost, indexOfLastPost);
  }, [
    countries,
    indexOfFirstPost,
    indexOfLastPost,
    searchResults,
    showSearchResults,
  ]);
  const searchItem = useCallback(
    (query) => {
      const fuse = new Fuse(countries, {
        isCaseSensitive: false,
        findAllMatches: true,
        keys: ["name.official"],
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
      setCurrentPage(1);
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

  if (error) return "An error has occurred: " + error.message;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <SearchInput setSearchQuery={setSearchQuery} />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Paginate
            postsPerPage={countriesPerPage}
            totalPosts={
              showSearchResults ? searchResults.length : countries.length
            }
            paginate={paginate}
            currentPage={currentPage}
            previousPage={previousPage}
            nextPage={nextPage}
          />
          <Table countriesList={paginatedCountries} />
        </>
      )}
    </>
  );
}

export default App;
