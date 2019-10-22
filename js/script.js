// Declaring variables

let showAsteroids = document.getElementById('showAsteroids');
let startDate, endDate, startDateMiliseconds, endDateMiliseconds, dateDifference, closeApproach, filteredCloseApproach, dateData;
let asteroidTable = document.getElementById('asteroidTable');
let tableContent = document.getElementById('tableContent');
let autocompleteBox = document.getElementById('autocompleteBox');
let datalistAsteroids = document.getElementById('datalistAsteroids');
let inputDatalist = document.getElementById('inputDatalist');
let choosenAsteroids = document.getElementById('choosenAsteroids');
let numOfPasses = document.getElementById('numOfPasses');
let backButton = document.getElementById('backButton');
let asteroidChartContainer = document.getElementById('asteroidChartContainer');
let asteroidData = [];
let asteroidCloseAproachArray = [];
let asteroidChartArray = []

// Function that fetchs potentially hazardous asteroid data from public NASA API

let fetchAsteroidData = (url) => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let nearEarthObjects = data.near_earth_objects;  
            for(let key in nearEarthObjects) {
                asteroidData.push(nearEarthObjects[key].filter(isHazardous => isHazardous.is_potentially_hazardous_asteroid === true)); 
            }  
            createTable(); 
        }) 
}

// Function that fetchs data for choosen asteroids, data is showing how many times asteroids pass close to Earth from 1900 to 1999
// and pushing that data in array that is saved in session storage

let fetchCloseAproachAsteroidData = () => {
    var itr = 0;
    choosenAsteroids.childNodes.forEach(element => {
        fetch(element.dataset.self)
        .then(response => response.json())
        .then(data => {  
            itr++;        
            data.close_approach_data.map(() => {
                closeApproach = data.close_approach_data.map(date => {               
                    if(Number(date.close_approach_date.substring(0, 4)) >= 1900 && 
                       Number(date.close_approach_date.substring(0, 4)) <= 1999) {
                        return true;
                    } 
                });
                filteredCloseApproach = closeApproach.filter(function (el) {
                    return el != null;
                });  
            })  
            asteroidCloseAproachArray.push({'name': data.name, 'numberOfPasses': filteredCloseApproach.length});
            if (itr === choosenAsteroids.childNodes.length) {
                sessionStorage.setItem("asteroidCloseAproachArray", JSON.stringify(asteroidCloseAproachArray));
                setTimeout(() => { window.location.assign('asteroids-chart.html'); }, 100);
            }       
        })
    });
}

// Function that validates if user input is ok, maximum difference between end date and start date need to be 7 days

let formValidation = () => {
    if (isNaN(startDateMiliseconds) || isNaN(endDateMiliseconds)) {
        alert("Please fill both inputs");
        return false;
    } else if (dateDifference > 7) {
        alert("The difference between dates must be maximum 7 days!");
        return false;
    } else if (dateDifference < 0) {
        alert("The start date must be before end date and difference between dates must be maximum 7 days!");
        return false;
    } else {
        fetchAsteroidData(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=x0HeIJzRCLm3lj0zrfXt2LltusKVCO7aoHmRkVq2`);
    }
}

// Function that is creating table with fetched asteroid data, and calling function for pagination

let createTable = () => {
    asteroidData.forEach(element => {
        element.forEach(element => {
            tableContent.innerHTML += `<tr>
                                        <td>${element.close_approach_data[0].close_approach_date}</td>
                                        <td>${element.name}</td>
                                        <td>${element.close_approach_data[0].relative_velocity.kilometers_per_hour}</td>
                                        <td>${element.estimated_diameter.meters.estimated_diameter_min}</td>
                                        <td>${element.estimated_diameter.meters.estimated_diameter_max}</td>
                                       </tr>`;
            datalistAsteroids.innerHTML += `<option value='${element.name}' data-name='${element.name}' data-self='${element.links.self}'>`
        })
    })
    if(tableContent.innerHTML) {
        asteroidTable.style.display = 'table';
        autocompleteBox.style.display = 'flex';
    }
    addPagerToTables('#asteroidTable', 10);
}

// Functions for sorting data in table 

let getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

let comparer = (idx, asc) => (a, b) => ((v1, v2) => 
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

// Functions for table pagination

function addPagerToTables(tables, rowsPerPage = 10) {
    tables = typeof tables == "string" ? document.querySelectorAll(tables) : tables;
    for (let table of tables) {
        addPagerToTable(table, rowsPerPage);
    }     
}

function addPagerToTable(table, rowsPerPage = 10) {
    let tBodyRows = table.querySelectorAll('tBody tr');
    let numPages = Math.ceil(tBodyRows.length/rowsPerPage);
    let colCount = [].slice.call(
        table.querySelector('tr').cells
    ).reduce((a,b) => a + parseInt(b.colSpan), 0);
    table.createTFoot().insertRow().innerHTML = `<td colspan=${colCount}><div class="nav" id="nav"></div></td>`;
    if(numPages == 1) {
        return;
    }
    for(let i = 0;i < numPages;i++) {
        let pageNum = i + 1;
        table.querySelector('.nav').insertAdjacentHTML(
            'beforeend',
            `<a href="#" rel="${i}">${pageNum}</a> `        
        );
    }
    changeToPage(table, 1, rowsPerPage);
    for (let navA of table.querySelectorAll('.nav a')) {
        navA.addEventListener('click', e => changeToPage(table, parseInt(e.target.innerHTML), rowsPerPage));
    }
}

function changeToPage(table, page, rowsPerPage) {
    let startItem = (page - 1) * rowsPerPage;
    let endItem = startItem + rowsPerPage;
    let navAs = table.querySelectorAll('.nav a');
    let tBodyRows = table.querySelectorAll('tBody tr');
    for (let nix = 0; nix < navAs.length; nix++) {
        if (nix == page - 1) {
            navAs[nix].classList.add('active');
        } else  {
            navAs[nix].classList.remove('active');
        }
        for (let trix = 0; trix < tBodyRows.length; trix++) {
            tBodyRows[trix].style.display = (trix >= startItem && trix < endItem) ? 'table-row' : 'none'; 
        }
    }
}

// Function that is used for deleting elements from list of choosen asteroids

let deleteAsteroidsFromList = () => {
    let deleteFromList = document.getElementsByClassName("delete-from-list");
    Array.from(deleteFromList).forEach(element => {
        element.addEventListener('click', (e) => {
            datalistAsteroids.innerHTML += `<option value='${e.target.parentElement.childNodes[0].nodeValue}' data-name='${e.target.parentElement.dataset.name}' data-self='${e.target.parentElement.dataset.self}'>`
            e.target.parentElement.remove();
            if (!choosenAsteroids.innerHTML) {
                choosenAsteroids.style.border = 'none';
            }
        });
    });
}

// Adding event listeners to elements on Index page

if(document.getElementById('indexPage')) {

    // Window object onload is getting start date and end date from session storage if dataDate is initialized

    window.addEventListener('load', () => {
        dateData = JSON.parse(sessionStorage.getItem("dateData"))
        if(dateData) {
            showAsteroids.click();
        }
    })
    
    // Add click event to Show Asteroids button which show asteroid data if the validation is ok

    showAsteroids.addEventListener('click', () => {
        if(!dateData) {
            startDate = document.getElementById('startDate').value;
            endDate = document.getElementById('endDate').value;
        } else {
            startDate = dateData.startDate;
            endDate = dateData.endDate;
            document.getElementById('startDate').value = dateData.startDate;
            document.getElementById('endDate').value = dateData.endDate;
            dateData = null;
        }  
        sessionStorage.setItem("dateData", JSON.stringify({'startDate': startDate, 'endDate': endDate}));
        startDateMiliseconds = new Date(startDate).getTime();
        endDateMiliseconds = new Date(endDate).getTime();
        dateDifference = Math.round((endDateMiliseconds - startDateMiliseconds) / (1000 * 60 * 60 * 24));
        tableContent.innerHTML = '';
        asteroidData = [];
        if(document.getElementsByTagName('tfoot')[0]) {
            document.getElementsByTagName('tfoot')[0].innerHTML = '';
        }
        datalistAsteroids.innerHTML = '';
        asteroidTable.style.display = 'none';
        autocompleteBox.style.display = 'none';
        choosenAsteroids.innerHTML = '';
        choosenAsteroids.style.border = 'none';
        if(document.getElementById('nav')) {
            document.getElementById('nav').innerHTML = '';
        }   
        formValidation();
    })

    // Add change event to datalist input which is used for choosing asteroids from table, and when asteroid is choosed it's added to a list of asteroids

    inputDatalist.addEventListener('change', () => {
        datalistAsteroids.childNodes.forEach(element => {
            if(element.dataset.name === inputDatalist.value) {
                choosenAsteroids.innerHTML += `<li data-name='${element.dataset.name}' data-self='${element.dataset.self}'>${inputDatalist.value}<span class='delete-from-list'>x</span></li>`
                choosenAsteroids.style.border = '1px solid #34C7A0';
                datalistAsteroids.childNodes.forEach(element => {
                    if(inputDatalist.value === element.value) {
                        element.remove();
                    }
                });
            }
        })
        inputDatalist.value = '';
        deleteAsteroidsFromList();
    })

    // Add click event to Number of passes by Earth button which redirect user to Asteroid page and pass data from those elements, if there is elements in list of asteroids

    numOfPasses.addEventListener('click', () => { 
        if(choosenAsteroids.childNodes.length) {
            asteroidCloseAproachArray = [];
            fetchCloseAproachAsteroidData();
        } else {
            alert('Please choose asteroids from table');
        } 
    })
    
    // Adding event listeners to th elements for sorting table

    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        let table = th.closest('table');
        let tbody = table.querySelector('tbody');
        Array.from(tbody.querySelectorAll('tr'))
          .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
          .forEach(tr => tbody.appendChild(tr) );
    })));
}

// Function that adding progress bar effect to a chart bar 

let animateChartBar = (element, elementNum) => {
    let width = 0;
    let frame = () => {
      if (width >= elementNum) {
        clearInterval(id);
      } else {
        width++; 
        element.style.width = width + '%';   
      }
    }
    let id = setInterval(frame, 10);
}

// Function used for showing chart bars and deciding what color bar will be depending on number of passes

let showChartBar = () => {
    let chartAsteroidBar = document.getElementsByClassName('chart-asteroid-bar');
    [].forEach.call(chartAsteroidBar, element => {
        let elementNumber = Number(element.innerHTML);
        if(elementNumber <= 25) {
            element.style.backgroundColor = '#78f038';
        } else if (25 < elementNumber && elementNumber <= 45) {
            element.style.backgroundColor = '#ecf53b';
        } else if (45 < elementNumber && elementNumber <= 75) {
            element.style.backgroundColor = '#f07538';
        } else {
            element.style.backgroundColor = '#f02416';
        }
        animateChartBar(element, elementNumber);
    });
}

// Function that is used for showing chart and puting all data in it which is collected from session storage 

let showChart = () => {
    asteroidChartArray = JSON.parse(sessionStorage.getItem("asteroidCloseAproachArray"));
    asteroidChartArray.forEach(element => {
        asteroidChartContainer.innerHTML += `<div class="chart-container"><div class="chart-asteroid-name">${element.name}</div><div class="chart-asteroid-bar">${element.numberOfPasses}</div></div>` 
    });
    showChartBar();
}

// Addin event listeners for Asteroid page

if(document.getElementById('asteroidsChartPage')) {

    // Add click event to Back button which redirect user to Index page and clear saved data from session storage
    
    backButton.addEventListener('click', () => { 
        sessionStorage.removeItem("asteroidCloseAproachArray");
        setTimeout(() => { window.location.assign('index.html'); }, 100);
    })

    // Window object onload is showing chart

    window.addEventListener('load', showChart());
}














