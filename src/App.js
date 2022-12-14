import "./App.css";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useEffect, useState } from "react";

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
  const indexOfLastPost = currentPage * countriesPerPage;
  const indexOfFirstPost = indexOfLastPost - countriesPerPage;
  const paginatedCountries = countries.slice(indexOfFirstPost, indexOfLastPost);

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
      <Paginate
        postsPerPage={countriesPerPage}
        totalPosts={countries.length}
        paginate={paginate}
        previousPage={previousPage}
        nextPage={nextPage}
      />
      {JSON.stringify(paginatedCountries)}
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
