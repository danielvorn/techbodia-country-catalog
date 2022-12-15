export default function Modal({ setShowModal, modalContent }) {
  return (
    <>
      <div className="fixed inset-0 z-10">
        <div
          className="fixed inset-0 w-full h-full bg-black opacity-40"
          onClick={() => setShowModal(false)}
        ></div>
        <div className="flex items-center min-h-screen px-4 py-8">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col min-w-[50%] mx-auto bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="text-3xl font-semibold">{`${modalContent.flag} ${modalContent.name.official} ${modalContent.flag}`}</h3>
            </div>
            <div className="relative p-6 flex-auto">
              <ul>
                <li>
                  {" "}
                  <span className="text-xl font-bold">Common Name: </span>
                  {modalContent.name.common}
                </li>
                <li>
                  <span className="text-xl font-bold">Capital:</span>{" "}
                  {modalContent.capital}
                </li>
                <li>
                  <span className="text-xl font-bold">Region: </span>
                  {modalContent.region}
                </li>
                <li>
                  <span className="text-xl font-bold">Subregion:</span>{" "}
                  {modalContent.subregion}
                </li>
                <li>
                  <span className="text-xl font-bold">Population:</span>{" "}
                  {modalContent.population.toLocaleString()}
                </li>
                <li>
                  <span className="text-xl font-bold">Timezones: </span>
                  {modalContent.timezones}
                </li>
                <li>
                  <span className="text-xl font-bold">Continent: </span>
                  {modalContent.continents}
                </li>
                <li>
                  <span className="text-xl font-bold">Languages: </span>
                  {modalContent.languages[
                    Object.keys(modalContent.languages)
                  ] ?? "N/A"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
