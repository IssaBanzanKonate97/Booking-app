import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader, Search as SearchIcon } from "react-feather";
// import { Link } from "react-router-dom";
import { locations } from "../../pages/shared_locations_datas/LOCATIONS_DATAS";

const SearchInput = (props) => {
    const { disabled = false, isLoading = false, placeholder = "Rechercher", value, onChange, maxSearchLength = 45 } = props;

    return <div className="search-input flex items-center bg-white text-slate-600 
    border border-solid border-gray-400 overflow-hidden duration-300
    group focus-within:border-portal-500 focus-within:shadow-portal-200/40 focus-within:shadow-xl
    focus-within:w-full
    shadow px-4 h-full rounded-full w-full md:w-5/6">
        { isLoading ? <Loader size={22} className="text-slate-600" /> : <SearchIcon size={22} className="text-slate-600" /> }
        <input type="text" 
            value={value}
            disabled={disabled}
            maxLength={maxSearchLength}
            onChange={(e) => onChange(e.target.value)}

            className="w-full h-full text-sm pl-2 outline-none bg-transparent focus:outline-none focus:ring-0"
            placeholder={placeholder}
        />
    </div>
};

const LocationAsResult = ({ location }) => {
    return <a href={`${ location.path }?sID=${ location.pathId }`} className="w-full">
        <div className="result flex flex-col items-start justify-start hover:bg-portal-100 cursor-pointer px-4 py-2 w-full">
            <h1 className="result-name text-slate-800 mb-1 text-sm font-medium">{location.name}</h1>
            <p className="result-city text-slate-600 leading-tighter text-xs">{location.address} <br/> {location.city}, {location.country.name}</p>
        </div>
    </a>
};

const Search = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const [isPending, startTransition] = useTransition({
        timeoutMs: 3500,
    });

    const handleSearch = useCallback((search) => {
        setSearch(search);
        startTransition(() => {
            setSearchResults(null);
            const _s = search.toLowerCase();

            const _locations = locations.filter(l => {
                return l.city.toLowerCase().includes(_s) ||
                l.address.toLowerCase().includes(_s) ||
                l.geoZoneName.toLowerCase().includes(_s) ||
                l.path.toLowerCase().includes(_s) ||
                l.advancedKeywords.some(k => k.toLowerCase().includes(_s))
            });

            return setSearchResults(_locations);
        });
    }, [locations]);

    useEffect(() => {
        if (search.length === 0) {
            setSearchResults(null);
        }
    }, [search]);

    return <div className="search h-9 md:h-11 w-36 md:w-[22em] roboto flex relative justify-end">
        <SearchInput 
            value={search}
            onChange={handleSearch}
            isLoading={isPending}
            placeholder="Rechercher un institut"
        />

        { searchResults && <div className="search-results max-h-80 overflow-y-auto absolute flex-col py-1 items-center justify-center overflow-hidden
            top-12 z-[80] right-0 max-w-sm md:right-0 md:w-full bg-white text-slate-800 rounded-md shadow-2xl border border-solid border-gray-300">
                <div className="text-sm text-slate-600 p-3 text-center">
                    { searchResults.length } établissement{ searchResults.length > 1 ? "s" : "" } trouvé{ searchResults.length > 1 ? "s" : "" }
                </div>
            {
                searchResults && searchResults.map((location, index) => {
                    return <LocationAsResult location={location} key={index} />
                })
            }
        </div> }
    </div>
};

export default Search;