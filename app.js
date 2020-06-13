// CSV Name Header Constants
const FIRST_NAME = 0, MIDDLE_INITIAL = 1, LAST_NAME = 2, SUFFIX = 3;

// CSV Earnings Header Constants
const ANNUAL_SALARY = 9, REGULAR_EARNINGS = 11, OVERTIME_EARNINGS = 12, OTHER_EARNINGS = 13, YTD_GROSS_EARNINGS = 14;

const DELAY = 100;
const PAGE_SIZE = 10;

// Salary data
let salaryData = {};
let people = {};

let pageNum = 0;
let directorySearches = [];

fetchAll([
    "2019_data.csv",
    "2018_data.csv",
    "2017_data.csv"
])
.then(() => {
    // show data loaded text then hide it after 1 second
    let loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.innerHTML = "Data loaded!";
    setTimeout(() => loadingIndicator.style.display = "none", 1000);

    // for (let [year, yearlyData] of Object.entries(salaryData)) {
    //     for (let entry of yearlyData) {
    //         // Get the person's first and last name
    //         let name = getName(entry[FIRST_NAME], entry[MIDDLE_INITIAL], entry[LAST_NAME]);

    //         // if the name has not been seen yet in other years
    //         if (!(name in people)) {
    //             people[name] = {};
    //         }

    //         // save the person's yearly salary data
    //         people[name][year] = entry;
    //         people[name].name = name;
    //     }
    // }

    // const currentYear = Object.keys(salaryData).reduce((a, b) => Math.max(a, b));
    // let foo = Object.values(people).sort((a, b) => {
    //     if (currentYear in a || currentYear in b) {
    //         if (!(currentYear in a))
    //             return -1;
    //         else if (!(currentYear in b))
    //             return 1;
    //         else
    //             return  b[currentYear][YTD_GROSS_EARNINGS] - a[currentYear][YTD_GROSS_EARNINGS];
    //     }
        
    //     return 0;
    // });

    // console.log(foo);

    // show the salary explore page
    showExplore();
});

/**
 * Whenever the document loads, the code inside the function will be executed.
 */
$(document).ready(function() {
    /**
     * Bind the search box to automatically search
     */
    let timeout = 0;
    $("#search").on("input", function() {
        // Clear the previous waiting
        clearTimeout(timeout);

        // Clear directory search timeouts
        if (directorySearches.length)
            for (let foo of directorySearches)
                clearTimeout(foo);

        // Get the text that was inputted into the search bar
        let query = $(this).val();

        // Wait 300ms before doing anything
        timeout = setTimeout(() => {
            // If there is something in the search bar, search
            if (query) {
                search(query);
                document.getElementById("page").style.display = "none";
            }
            // If the user cleared out the search bar, clear the results
            else {
                document.getElementById("results").innerHTML = "";
                showExplore();
            }
        }, 300);
    });
});

/**
 * Search the salary data for a user's query.
 * 
 * @param {string} query the user's search keyword
 */
function search(query) {
    let results = {};

    for (let [year, yearlyData] of Object.entries(salaryData)) {
        for (let entry of yearlyData) {
            // Get the person's first and last name
            let name = entry[FIRST_NAME] + " " + entry[LAST_NAME];

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
    showResults(results);
}

/**
 * Show the Salary Explore page.
 */
function showExplore() {
    // show the pagination
    document.getElementById("page").style.display = "";

    let resultsDisplay = document.getElementById("results");
    resultsDisplay.innerHTML = "<h4 class='mt-3'>Explore Salary Data</h4>";

    const currentYear = Object.keys(salaryData).reduce((a, b) => Math.max(a, b));
    const data = salaryData[currentYear].sort((a, b) => b[YTD_GROSS_EARNINGS] - a[YTD_GROSS_EARNINGS]);

    // show first page of results
    showResults(data.slice(0, PAGE_SIZE).map(x => {
        const a = {};
        
        a[currentYear] = x;

        return a;
    }));

    // setup pagination
    $("#page").pagination({
        items: salaryData[currentYear].length,
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        itemsOnPage: 10,
        onPageClick: function (page, event) {
            event.preventDefault();

            clearResults();

            let pageNum = page - 1;
            showResults(data.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE).map(x => {
                const a = {};

                a[currentYear] = x;

                return a;
            }));
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
                let name = nameCapitalize(entry[FIRST_NAME]);

                // Get the person's middle initial (if any)
                if (entry[MIDDLE_INITIAL] && entry[MIDDLE_INITIAL] != "NA")
                    name += " " + entry[MIDDLE_INITIAL] + ". ";
                else
                    name += " ";

                // Get the person's last name
                name += nameCapitalize(entry[LAST_NAME]);

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
            const headerRow = document.createElement("tr");
            [
                "YTD Gross Earnings",
                "Regular Earnings",
                "Annual Salary",
                "Overtime Earnings",
                "Other Earnings"
            ]
            .forEach(x => {
                const th = document.createElement("th");
                th.innerHTML = x;

                headerRow.appendChild(th);
            });

            // TODO abstract row creation to a function?
            const dataRow = document.createElement("tr");
            [
                "$" + addCommas(entry[YTD_GROSS_EARNINGS]),
                "$" + addCommas(entry[REGULAR_EARNINGS]),
                "$" + addCommas(entry[ANNUAL_SALARY]),
                "$" + addCommas(entry[OVERTIME_EARNINGS]),
                "$" + addCommas(entry[OTHER_EARNINGS])
            ]
            .forEach(x => {
                const td = document.createElement("td");
                td.innerHTML = x;

                dataRow.appendChild(td);
            });

            table.appendChild(headerRow);
            table.appendChild(dataRow);

            el.append(table);
        }

        resultsDisplay.appendChild(el);
    });
}

/**
 * Clear the results view.
 */
function clearResults() {
    document.getElementById("results").innerHTML = "";
}

/**
 * Get the formatted name.
 * @param {String} first 
 * @param {String} middle 
 * @param {String} last 
 * @returns {String} name
 */
function getName(first, middle, last) {
    let name = nameCapitalize(first);

    if (middle && middle != "NA")
        name += " " + middle.toUpperCase() + ". ";
    else
        name += " ";
    
    name += nameCapitalize(last);

    return name;
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
                const year = url.split("_")[0];

                salaryData[year] = Papa.parse(csv).data;
            })
        );
    });

    return Promise.all(requests);
}

/**
 * Proper capitalization for names.
 * @param {string} name 
 * @returns {String} capitalizedName
 */
function nameCapitalize(name) {
    return name.substring(0, 1) + name.substring(1).toLowerCase();
}

/**
 * Add commas for thousands.
 * https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
 * @param {Number} amount 
 */
function addCommas(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
}