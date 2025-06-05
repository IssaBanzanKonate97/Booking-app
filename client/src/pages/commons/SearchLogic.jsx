import { useState, useEffect, Fragment, useContext, useCallback } from "react";
import { Search } from "react-feather";

const SearchLogic = () => {
    const [search, setSearch] = useState("");

    const [results, setResults] = useState([
        {
            name: "Paris",
            path: "/paris",
            position: "Paris"
        }
    ]);

    useEffect(() => {
    }, [search]);

    return <div className="flex flex-row mt-1 mb-3 flex flex-row items-center bg-gray-200 -mx-4 relative">
        <SearchBar setSearch={setSearch} search={search}/>
        <div className="bg-red-100 absolute shadow top-12 inset-x-0 z-50">
            <h4 className="text-slate-700 text-sm font-bold m-2 mx-4 roboto">Résultats :</h4>
            <div className="flex flex-col">
                {results.map((result, index) => {
                    return <div key={index} 
                    className="flex flex-col mb-1 bg-white montserrat font-medium
                    hover:bg-blue-600 hover:text-white group p-3 overflow-x-auto duration-150 px-4">
                        <h5>{result.name}</h5>
                        {result.position && <h5 className="group-hover:text-blue-200 text-xs text-gray-600">{result.position}</h5>}
                    </div>
                })}
            </div>
        </div>
    </div>
};

const SearchBar = ({ setSearch, search }) => {

    const handleChange = useCallback((e) => {
        if(e.target.value.trim() === "") {
            setSearch("");
            return;
        }
        setSearch(e.target.value);
    }, [setSearch]);

    return <Fragment>
        <Search className="ml-4"/>
        <input 
            className="bg-gray-200 w-full h-12 p-2 px-3.5 text-gray-800 roboto font-medium placeholder-gray-500
            focus:outline-none focus:shadow-outline focus:border-blue-400 focus:border-b-2 focus:border-t-0 border-y-2 border-gray-200" 
            type="search"
            placeholder="Rechercher votre ville (ex : Paris ou 75000)"
            value={search}
            onChange={handleChange}
        ></input>
    </Fragment>
};

export default SearchLogic;
