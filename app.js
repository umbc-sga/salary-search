// CSV Name Header Constants
const FIRST_NAME = 0, MIDDLE_INITIAL = 1, LAST_NAME = 2, SUFFIX = 3;

// CSV Earnings Header Constants
const ANNUAL_SALARY = 9, REGULAR_EARNINGS = 11, OVERTIME_EARNINGS = 12, OTHER_EARNINGS = 13, YTD_GROSS_EARNINGS = 14;

// Salary data
let data;

/**
 * Whenever the document loads, the code inside the function will be executed.
 */
$(document).ready(function() {
    // Request the data from the server
    $.ajax({
        type: "GET",
        url: "data.csv",
        dataType: "text",
        success: function(res) {
            // Show data loaded text then hide it after 1 second
            let loadingIndicator = document.getElementById("loadingIndicator");
            loadingIndicator.innerHTML = "Data loaded!";
            setTimeout(function() {
                loadingIndicator.style.display = "none";
            }, 1000);

            // Convert the CSV data into JSON format
            data = Papa.parse(res);
            data = data.data;
        }
    });

    /**
     * Bind the search box to automatically search
     */
    let timeout = 0;
    $("#search").on("input", function() {
        clearTimeout(timeout);

        let query = $(this).val();

        timeout = setTimeout(function() {
            search(query);
        }, 500);
    });
});

/**
 * 
 * @param {string} name 
 */
function nameCapitalize(name) {
    return name.substring(0, 1) + name.substring(1).toLowerCase();
}

/**
 * https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
 * @param {integer} amount 
 */
function addCommas(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
}

/**
 * Search the salary data for a user's query.
 * 
 * @param {string} query the user's search keyword
 */
function search(query) {
    let results = [];

    // Go through every single person in the salary data
    for (let entry of data) {
        // Get the person's first and last name
        let name = entry[FIRST_NAME] + " " + entry[LAST_NAME];

        // Convert the employee name and query to lowercase to be case insensitive
        name = name.toLowerCase();
        let caseInsensitiveQuery = query.toLowerCase();

        // If the name includes the search query
        if (name.includes(caseInsensitiveQuery)) 
            results.push(entry);
    }

    // Clear previous results from results display (if any)
    let resultsDisplay = document.getElementById("results");
    resultsDisplay.innerHTML = "";

    // Go through every single result
    for (let result of results) {
        // Create a list item
        let el = document.createElement("LI");
        el.className = "list-group-item";

        // Get the person's first name
        let name = nameCapitalize(result[FIRST_NAME]);
        
        // Get the person's middle initial (if any)
        if (result[MIDDLE_INITIAL])
            name += " " + result[MIDDLE_INITIAL] + ". ";
        else
            name += " ";
        
        // Get the person's last name
        name += nameCapitalize(result[LAST_NAME]);

        // Get the person's suffix (if any)
        if (result[SUFFIX])
            name += result[SUFFIX]

        // Add the person's name to the list item
        el.innerHTML += "<h4>" + name + "<h4>";

        // const ANNUAL_SALARY = 9, REGULAR_EARNINGS = 11, OVERTIME_EARNINGS = 12, OTHER_EARNINGS = 13, YTD_GROSS_EARNINGS = 14;
        el.innerHTML += "<p class='mb-0'>Annual Salary: $" + addCommas(result[ANNUAL_SALARY]) + "</p>";
        el.innerHTML += "<p class='mb-0'>Regular Earnings: $" + addCommas(result[REGULAR_EARNINGS]) + "</p>";
        el.innerHTML += "<p class='mb-0'>Overtime Earnings: $" + addCommas(result[OVERTIME_EARNINGS]) + "</p>";
        el.innerHTML += "<p class='mb-0'>Other Earnings: $" + addCommas(result[OTHER_EARNINGS]) + "</p>";
        el.innerHTML += "<p class='mb-0'>YTD Gross Earnings: $" + addCommas(result[YTD_GROSS_EARNINGS]) + "</p>";

        // Add the result list item to the results display
        resultsDisplay.appendChild(el);
    }
}