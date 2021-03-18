const token = config.MY_API_TOKEN;
const key = config.SECRET_API_KEY;

// SPA's behaviour
function renderPage(hashKey) {
  let pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.hidden = true;
  });

  let navList = document.querySelectorAll(".link");
  navList.forEach((nav) => {
    nav.classList.remove("active");
  });

  switch (hashKey) {
    case "":
      pages[0].hidden = false;
      navList[0].classList.add("active");
      break;
    case "#homePage":
      pages[0].hidden = false;
      navList[0].classList.add("active");
      break;
    case "#aboutPage":
      pages[1].hidden = false;
      navList[1].classList.add("active");
      break;
    case "#contactPage":
      pages[2].hidden = false;
      navList[2].classList.add("active");
      break;
    default:
      pages[0].hidden = false;
      navList[0].classList.add("active");
  }
}

window.onhashchange = () => {
  renderPage(window.location.hash);
};

// Main App Behaviour
const filterBtn = document.getElementById("filterBtn");
const resultList = document.getElementById("result-list");
const countryDetails = document.getElementById("country-details");
const countryStats = document.getElementById("country-stats");

// Checking if we have values in select
function isValid(fsValue, fcValue) {
  let warnMess = document.getElementById("warningmessage");
  if (fsValue === "" || fcValue === "") {
    warnMess.hidden = false;
    return false;
  }
  warnMess.hidden = true;
  return true;
}

// Filter Button Behaviour
filterBtn.addEventListener("click", (event) => {
  let fsort = document.getElementById("fsort");
  let fchoices = document.getElementById("fchoices");
  let fsVal = fsort.value;
  let fcVal = fchoices.value;

  if (!isValid(fsVal, fcVal)) return;

  // Hide initial Hero of the home page
  let heroStart = document.getElementById("hero-start");
  heroStart.hidden = true;

  fetchData(fsVal, fcVal);
});

// Getting Data using VACCOVIDE API
function fetchData(fsVal, fcVal) {
  const URL = `https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/${fcVal.toLowerCase()}`;

  fetch(URL, {
    method: "GET",
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host":token
    },
  })
    .then((response) => response.json())
    .then((data) => filterData(data, fsVal))
    .then((filteredData) => listData(filteredData))
    .catch((err) => {
      console.error(err);
    });
}

// Filter Data based on Select Sort of User
function filterData(data, fsVal) {
  let filter;
  switch (fsVal.toLowerCase()) {
    case "":
      filter = "Population";
      break;
    case "population":
      filter = "Population";
      break;
    case "cases":
      filter = "TotalCases";
      break;
    case "tests":
      filter = "TotalTests";
      break;
    case "csr":
      filter = "Case_Fatality_Rate";
      break;
    default:
      filter = "Population";
  }
  data.sort((A, B) => {
    let popA = parseInt(A[filter]);
    let popB = parseInt(B[filter]);
    return popB - popA;
  });
  return data;
}

// List data in result UL element from HTML
function listData(data) {
  resultList.innerHTML = "";

  data.forEach((country, currentIndex) => {
    let twoLetterSym = country["TwoLetterSymbol"];
    let countryName = country["Country"];
    let threeLetterSym = country["ThreeLetterSymbol"];
    let infectionRisk = country["Infection_Risk"];
    let newCases = country["NewCases"];
    let population = country["Population"];

    const listEl = document.createElement("li");
    listEl.classList.add("result-link");

    const linkEl = document.createElement("a");
    linkEl.href = "javascript:void(0)";
    linkEl.innerHTML = `${currentIndex + 1}. ${countryName}`;

    const statsEl = document.createElement("div");
    statsEl.innerHTML = "see stats";
    statsEl.classList.add("see-stats");

    const flagEl = document.createElement("span");
    flagEl.classList.add("flag-icon");
    flagEl.classList.add(`flag-icon-${twoLetterSym}`);

    listEl.appendChild(linkEl);
    listEl.appendChild(statsEl);
    listEl.appendChild(flagEl);

    // Adding necesarry details to DOM element for ease of data-transfer
    listEl.dataset.name = countryName;
    listEl.dataset.threelettersym = threeLetterSym;
    listEl.dataset.twolettersym = twoLetterSym;
    listEl.dataset.infectionrisk = infectionRisk;
    listEl.dataset.newcases = newCases;
    listEl.dataset.population = population;

    resultList.appendChild(listEl);
  });
}

// Getting Country Data
// JavaScript Event Delegation
let lastCountryChart = "";
const myChart = document.getElementById("myChart");

resultList.addEventListener("click", (event) => {
  if (
    event.target &&
    event.target.matches("li.result-link,span.flag-icon,a,div.see-stats")
  ) {
    // Getting main li element that contains necessary data
    let dataEl = event.target.parentNode.classList.contains("result-link")
      ? event.target.parentNode
      : event.target;

    // If the same country chart is shown do nothing
    if (lastCountryChart === dataEl.dataset.name) return;
    else {
      lastCountryChart = dataEl.dataset.name;
    }

    showData(dataEl);

    fetchCountryData(dataEl.dataset.threelettersym);
  }
});

function fetchCountryData(threeLetterSym) {
  const URL = `https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/covid-ovid-data/sixmonth/${threeLetterSym}`;

  fetch(URL,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": token
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      createChart(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

function createChart(data) {
  let casesSet=[];
  let dateSet=[];

  //Getting last 30days data
  for(let i = 0; casesSet.length < 30 && i < data.length; i++){
    if(data[i]["new_cases"] !== 0){
      casesSet.unshift(data[i]["new_cases"]);
      dateSet.unshift(data[i]["date"]);
    }
  }

  var newChart = new Chart(myChart, {
    type: "line",
    data: {
      labels: dateSet,
      datasets: [
        {
          data: casesSet,
          label: "New cases per day",
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function showData(data) {
  countryDetails.innerHTML = "";
  countryStats.innerHTML = "";
  // Adding Name and Flag to chart-details
  const flagEl = document.createElement("span");
  flagEl.classList.add("flag-icon");
  flagEl.classList.add(`flag-icon-${data.dataset.twolettersym}`);

  const nameEl = document.createElement("span");
  nameEl.classList.add(`country-name`);
  nameEl.innerHTML = data.dataset.name;

  countryDetails.appendChild(flagEl);
  countryDetails.appendChild(nameEl);

  //Adding New Cases and Infection risk
  const newCasesEl = document.createElement("span");
  newCasesEl.classList.add(`new-cases`);
  newCasesEl.innerHTML = `New cases: ${data.dataset.newcases}`;

  const infectionRiskEl = document.createElement("span");
  infectionRiskEl.classList.add(`infection-risk`);
  infectionRiskEl.innerHTML = `Infection risk: ${data.dataset.infectionrisk}`;

  const populationEl = document.createElement("span");
  populationEl.classList.add(`population`);
  populationEl.innerHTML = `Population: ${data.dataset.population}`;

  const br = document.createElement("br");

  countryStats.appendChild(newCasesEl);
  countryStats.appendChild(infectionRiskEl);
  countryStats.appendChild(br);
  countryStats.appendChild(populationEl);
}
