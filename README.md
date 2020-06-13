# salary-search
Find the public salaries of employees at UMBC.

Data is pulled from [the Baltimore Sun Public Salaries Archive](https://salaries.news.baltimoresun.com/) currently from the 2018 year.

This was inspired in part by the [UMDCP Diamondback's Salary Guide Tool](https://salaryguide.dbknews.com/).

## To Add New Salary Data
1. Download the year's CSV file. 
2. Delete all rows of people who are not UMBC employees. 
3. If the first column is "id" delete the column.
4. Name it "YEAR_NUM.csv" and upload it.
5. Add the file name to the fetchAll array in app.js. 
