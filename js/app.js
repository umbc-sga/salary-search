// CSV Name Header Constants
const FIRST_NAME = 0, MIDDLE_INITIAL = 1, LAST_NAME = 2, SUFFIX = 3;

// CSV Earnings Header Constants
const ANNUAL_SALARY = 9, REGULAR_EARNINGS = 11, OVERTIME_EARNINGS = 12, OTHER_EARNINGS = 13, YTD_GROSS_EARNINGS = 14;

const DELAY = 100;
const PAGE_SIZE = 10;

let salaryData = {};
let people = {};

const dataYears = [2013, 2014, 2015, 2016, 2017, 2018, 2019];

/**
 * Run this when the file is first loaded.
 */
(function onLoad() {
    fetchAll(dataYears.map(year => `data/${year}_data.csv`))
    .then(() => {
        processSalaryData();
        initUI();
    });
})();

/**
 * Initialize the UI components.
 */
function initUI() {
    showDataIsLoaded();
    showExplorePage();
    bindSearchHandler();
}

/**
 * Group salary years of the same people together.
 */
function processSalaryData() {
    for (let [year, yearlyData] of Object.entries(salaryData)) {
        for (let entry of yearlyData) {
            // get the person's first and last name
            let name = getNormalizedName(entry[FIRST_NAME], entry[MIDDLE_INITIAL], entry[LAST_NAME]);

            // if the name has not been seen yet in other years
            if (!(name in people)) {
                people[name] = {};
            }

            // save the person's yearly salary data
            people[name][year] = entry;
        }
    }
}

/**
 * Search the salary data for a user's query.
 * @param {string} query the user's search keyword
 */
function search(query) {
    let results = {};

    for (let [year, yearlyData] of Object.entries(salaryData)) {
        for (let entry of yearlyData) {
            // Get the person's first and last name
            let name = getNormalizedName(entry[FIRST_NAME], "", entry[LAST_NAME]);

            // Convert the employee name and query to lowercase to be case insensitive
            name = name.toLowerCase();
            let caseInsensitiveQuery = query.toLowerCase();

            // If the name includes the search query
            if (name.includes(caseInsensitiveQuery)) {
                // if the name has not been seen yet in other years
                if (!(name in results)) {
                    results[name] = {};
                }

                // save the person's yearly salary data
                results[name][year] = entry;
            }
        }
    }

    clearResults();

    if (results.length !== 0) {
        let slicedResults = {};

        for (let [key, value] of Object.entries(results).slice(0, PAGE_SIZE)) {
            slicedResults[key] = value;
        }

        showResults(slicedResults);
    }
    else {
        showResults(results);
    }

    // setup pagination
    $("#page").pagination({
        items: Object.keys(results).length,
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        itemsOnPage: 10,
        onPageClick: function(page, event) {
            event.preventDefault();

            clearResults();

            let slicedResults = {};
            for (let [key, value] of Object.entries(results).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)) {
                slicedResults[key] = value;
            }

            showResults(slicedResults);
        }
    });
}

/**
 * Show the Salary Explore page.
 */
function showExplorePage() {
    // show the pagination
    document.getElementById("page").style.display = "";

    // show "Explore Salary Data" text
    let resultsDisplay = document.getElementById("results");
    resultsDisplay.innerHTML = "<h4 class='mt-3'>Explore Salary Data (From High to Low)</h4>";

    // sort salary data of people
    const data = Object.values(people).sort((a, b) => {
        let aLatest = Object.keys(a).reduce((a, b) => Math.max(a, b));
        let bLatest = Object.keys(b).reduce((a, b) => Math.max(a, b));
        
        return b[bLatest][YTD_GROSS_EARNINGS] - a[aLatest][YTD_GROSS_EARNINGS];
    });

    // show first page of results
    showResults(data.slice(0, PAGE_SIZE));

    // setup pagination
    $("#page").pagination({
        items: data.length,
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        itemsOnPage: 10,
        onPageClick: function(page, event) {
            event.preventDefault();

            clearResults();

            showResults(data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        }
    });
}

/**
 * Display a list of results to the User Inferface.
 * @param {array} data 
 */
function showResults(results) {
    let resultsDisplay = document.getElementById("results");

    // if there are not results
    if (Object.values(results).length === 0) {
        // create a list item
        let el = document.createElement("LI");
        el.className = "list-group-item";

        // show "No Results Found" text
        el.innerHTML = "<h4 class='mb-0'>No Results Found</h4>";

        // add the result list item to the results display
        resultsDisplay.appendChild(el);

        return;
    }

    // go through each person in the results object
    Object.values(results).forEach(person => {
        // create a list item
        let el = document.createElement("LI");
        el.className = "list-group-item";

        // keep track to only show a person's details once
        let showedPersonalDetails = false;

        // go through years in reverse chronological order
        for (let [year, entry] of Object.entries(person).reverse()) {
            // only show a person's details once
            if (!showedPersonalDetails) {
                // Get the person's first name
                let name = getProperCapitalization(entry[FIRST_NAME]);

                // Get the person's middle initial (if any)
                if (entry[MIDDLE_INITIAL] && entry[MIDDLE_INITIAL] != "NA")
                    name += " " + entry[MIDDLE_INITIAL] + ". ";
                else
                    name += " ";

                // Get the person's last name
                name += getProperCapitalization(entry[LAST_NAME]);

                // Get the person's suffix (if any)
                if (entry[SUFFIX] && entry[SUFFIX] != "NA") {
                    name += entry[SUFFIX];
                }

                // Add the person's name to the list item
                el.innerHTML += "<h4>" + name + "</h4>";

                // add title and department placeholders
                // let titleP = document.createElement("p");
                // titleP.innerHTML = "{{title}}";
                // titleP.style.display = "none";
                // titleP.className = "mb-0";

                // el.appendChild(titleP);

                // let departmentP = document.createElement("p");
                // departmentP.innerHTML = "{{department}}";
                // departmentP.style.display = "none";
                // departmentP.className = "mb-0";

                // el.appendChild(departmentP);

                // // Convert name to search term for UMBC Directory
                // let searchTerm = result[FIRST_NAME] + "+" + result[LAST_NAME];

                // // space out the calls to UMBC directory search
                // setTimeout(() => searchDirectory(searchTerm, el), DELAY);

                showedPersonalDetails = true;
            }

            // show the year of the salary entry
            el.innerHTML += `<p class="yearLabel">${year}</p>`;

            // create data table
            const table = document.createElement("table");

            // create row for table headers
            const headerValues = [
                "YTD Gross Earnings",
                "Regular Earnings",
                "Annual Salary",
                "Overtime Earnings",
                "Other Earnings"
            ]
            const headerRow = createRow(headerValues, "th");

            let reg;

            if (year == 2015)
                reg = entry[REGULAR_EARNINGS - 1];
            else
                reg = entry[REGULAR_EARNINGS];

            const dataValues = [
                "$" + Number(entry[ANNUAL_SALARY]).toLocaleString(),
                "$" + Number(entry[YTD_GROSS_EARNINGS]).toLocaleString(),
                "$" + Number(reg).toLocaleString(),
                "$" + Number(entry[OVERTIME_EARNINGS]).toLocaleString(),
                "$" + Number(entry[OTHER_EARNINGS]).toLocaleString()
            ];
            const dataRow = createRow(dataValues, "td");

            table.appendChild(headerRow);
            table.appendChild(dataRow);

            el.append(table);
        }

        resultsDisplay.appendChild(el);
    });
}

/**
 * Create a HTML table row from the data in the specified cell type.
 * @param {Array} data 
 * @param {String} cellType
 * @returns {HTMLTableRowElement} row
 */
function createRow(data, cellType) {
    const row = document.createElement("tr");

    data.forEach(x => {
        const cell = document.createElement(cellType);
        cell.innerHTML = x;

        row.appendChild(cell);
    });

    return row;
}

/**
 * Clear the results view.
 */
function clearResults() {
    document.getElementById("results").innerHTML = "";
}

/**
 * Search the UMBC Directory through AJAX.
 * @param {string} searchTerm search query for UMBC directory search
 * @param {Node} el target element to show result text in
 */
function searchDirectory(searchTerm, el) {
    // Request from UMBC Directory Search
    $.ajax({
        type: "POST",
        url: "ajax/search_directory.php",
        data: {
            searchTerm: searchTerm
        },
        success: function(res) {
            // Create mock HTML
            let html = document.createElement("html");
            html.innerHTML = res;


            // Get title if the directory has it
            let titleRaw = html.getElementsByClassName("title");
            if (titleRaw.length) {
		        el.children[1].style.display = "block";
                el.innerHTML = el.innerHTML.replace("{{title}}", titleRaw[0].innerHTML.trim());
		    }
            else
                el.innerHTML = el.innerHTML.replace("<p class=\"mb-0\">{{title}}</p>", "");

            // Get department if the directory has it
            let departmentRaw = html.getElementsByClassName("department");
            if (departmentRaw.length) {
				el.children[2].style.display = "";
                el.innerHTML = el.innerHTML.replace("{{department}}", departmentRaw[0].innerHTML.trim());
			}
            else
                el.innerHTML = el.innerHTML.replace("<p class=\"mb-0\">{{department}}</p>", "");

            // Remove mock HTML
            html.remove();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            loadingIndicator.innerHTML = "Data load failed!";

            console.error(thrownError);
        }
    });
}

/**
 * Bind the search handler function to the search element.
 */
function bindSearchHandler() {
    document.getElementById("search").addEventListener("input", searchHander);
}

/**
 * Handle the real-time search display when typing, with 300ms latency for typing.
 */
let timeout, directorySearches = [];
function searchHander() {
    // clear the previous waiting
    clearTimeout(timeout);

    // clear directory search timeouts
    // if (directorySearches.length)
    //     for (let foo of directorySearches)
    //         clearTimeout(foo);

    let query = document.getElementById("search").value;

    // wait 300ms before doing anything
    timeout = setTimeout(() => {
        // if there is something in the search bar, search
        if (query) {
            search(query);
        }
        // if the user cleared out the search bar, show the explore page
        else {
            showExplorePage();
        }
    }, 300);
}

/**
 * Show data loaded text then hide it after one second.
 */
function showDataIsLoaded() {
    let loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.innerHTML = "Data loaded!";
    setTimeout(() => loadingIndicator.style.display = "none", 1000);
}

/**
 * Fetch a list of URLs.
 * @param {String[]} urls 
 * @returns {Promise}
 */
function fetchAll(urls) {
    let requests = [];

    urls.forEach(url => {
        requests.push(
            fetch(url)
            .then(res => res.text())
            .then(csv => {
                const year = url.replace("data/", "").split("_")[0];

                salaryData[year] = Papa.parse(csv).data;
            })
        );
    });

    return Promise.all(requests);
}

/**
 * Get the normalized name: trim, proper capital, period after middle initial.
 * @param {String} first 
 * @param {String} middle 
 * @param {String} last 
 * @returns {String} name
 */
function getNormalizedName(first, middle, last) {
    let name = getProperCapitalization(first.trim());

    if (middle && middle.trim() !== "" && middle != "NA")
        name += " " + middle.toUpperCase().trim() + ". ";
    else
        name += " ";
    
    name += getProperCapitalization(last.trim());

    return name;
}

/**
 * Proper capitalization for names.
 * @param {string} name 
 * @returns {String} capitalizedName
 */
function getProperCapitalization(name) {
    return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
}