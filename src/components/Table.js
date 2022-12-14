import { isEmpty, isUndefined } from "lodash";
import { useSortableData } from "../hooks";
import Modal from "./Modal";
import { useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";

export default function Table({ countriesList }) {
  const [modalContent, setModalContent] = useState({});
  const [showModal, setShowModal] = useState(false);
  const topRow = useRef(null);

  function executeScroll() {
    topRow?.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  function SortIcon({ currentSortDirection }) {
    const handleSort = () => {
      executeScroll();
      requestSort("name.official");
    };

    return (
      <span>
        {isUndefined(currentSortDirection) && (
          <ArrowsUpDownIcon
            onClick={handleSort}
            className="cursor-pointer h-6 w-6"
          />
        )}
        {currentSortDirection === "ascending" && (
          <ArrowUpIcon
            onClick={handleSort}
            className="cursor-pointer h-6 w-6"
          />
        )}
        {currentSortDirection === "descending" && (
          <ArrowDownIcon
            onClick={handleSort}
            className="cursor-pointer h-6 w-6"
          />
        )}
      </span>
    );
  }
  const { items, requestSort, getClassNamesFor } =
    useSortableData(countriesList);

  return (
    <>
      {showModal && (
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          modalContent={modalContent}
        />
      )}
      <div className="flex flex-col h-screen">
        <div className="flex-grow overflow-auto rounded-lg mb-20">
          <table className="table-fixed relative text-center w-full">
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
    </>
  );
}
