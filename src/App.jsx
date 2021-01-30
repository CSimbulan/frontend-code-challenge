import React, { useState } from 'react';
import './App.css';

const URL_PATH = "https://gist.githubusercontent.com/bar0191/fae6084225b608f25e98b733864a102b/raw/dea83ea9cf4a8a6022bfc89a8ae8df5ab05b6dcc/pokemon.json";

const App = () => {

    /*
        Store the data, the user input, loading state and the max cp toggle into the state.
    */
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [maxCp, setMaxCp] = useState(false);
    const [loading, setLoading] = useState(false);

    /*
        When the user inputs into the search bar, update the search string in the state,
        then make a fetch call to the json file.
    */
    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        const regex = new RegExp(`^${value}`, "i");

        // Helper function for sorting the javascript object.
        const sortPriority = (a, b) => {
            // If the max cp is checked, sort the array by max cp.
            // I was not sure if this was supposed to override the fact
            // that the name is supposed to have priority over the type.
            if (maxCp) {
                if (a.hasOwnProperty("MaxCP") && !b.hasOwnProperty("MaxCP")) return -1;
                if (!a.hasOwnProperty("MaxCP") && b.hasOwnProperty("MaxCP")) return 1;
                if (parseInt(a.MaxCP) > parseInt(b.MaxCP)) return -1;
                if (parseInt(a.MaxCP) < parseInt(b.MaxCP)) return 1;
            }
            // If max cp is not checked, sort first by whether or not the name
            // contains the search string, then by the name alphabetcially.
            if (regex.test(a.Name) && !regex.test(b.Name)) return -1;
            if (!regex.test(a.Name) && regex.test(b.Name)) return 1;
            if (a.Name > b.Name) return 1;
            if (a.Name < b.Name) return -1;
        }

        // Fetch the json data if the search string is larger than 0 characters.
        if (value.length > 0) {
            // Show the spinner.
            setLoading(true);
            fetch(URL_PATH)
                .then(res => res.json())
                .then(json => {
                    // Hide the spinner.
                    setLoading(false);
                    // Filter the json data by name or type, then sort using the helper function, then slice the top 4 results.
                    setData(json.filter((v) => regex.test(v.Name) || regex.test(v.Types)).sort(sortPriority).slice(0, 4));

                })
        }
    }

    // Toggle the sort by cp option.
    const onMaxCPChange = (e) => {
        setMaxCp(e.target.checked);
    }

    // Highlight part of the name that matches the search string.
    const highlightSearch = (name) => {
        const regex = new RegExp(`^${search}`, "i");
        if (regex.test(name)) {
            return <><span className="hl">{search.charAt(0).toUpperCase() + search.slice(1)}</span>{name.slice(search.length)}</>
        }
        return <>{name}</>
    }

    return (
        <>
            <label htmlFor="maxCP" className="max-cp">
                <input type="checkbox" id="maxCP" onChange={onMaxCPChange} />
                <small>
                    Maximum Combat Points
                </small>
            </label>
            <input type="text" className="input" placeholder="Pokemon or type" onChange={onSearchChange} />
            {/*Show the spinner while downloading the list.*/}
            {loading ? <div className="loader"></div> : <></>}
            <ul className="suggestions">
                {/*Map the results stored in the state to the list.*/}
                {data.length > 0 ? data.map(mon =>
                    <li>
                        <img src={mon.img} alt="" />
                        <div className="info">
                            <h1>{highlightSearch(mon.Name)}</h1>
                            {mon.Types.map(typing =>
                                <span className={"type " + typing.toLowerCase()}>
                                    {typing}
                                </span>)}
                        </div>
                    </li>
                ) : <li>
                        <img src="https://cyndiquil721.files.wordpress.com/2014/02/missingno.png" alt="" />
                        <div className="info">
                            <h1 className="no-results">
                                No results
                            </h1>
                        </div>
                    </li>}
            </ul>
        </>
    );
}

export default App;
