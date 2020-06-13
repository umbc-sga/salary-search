# salary-search
Find the public salaries of employees at UMBC.

Data is pulled from [the Baltimore Sun Public Salaries Archive](https://salaries.news.baltimoresun.com/).

This was inspired in part by the [UMDCP Diamondback's Salary Guide Tool](https://salaryguide.dbknews.com/).

## To Add New Salary Data
1. Download the year's CSV file. 
2. Delete all rows of people who are not UMBC employees. 
3. Make sure the rows match the row constants in [app.js](js/app.js).
4. Name it "YEARNUMBER_data.csv" and upload it.
5. Add the year number to the ```dataYears``` array in [app.js](js/app.js).
