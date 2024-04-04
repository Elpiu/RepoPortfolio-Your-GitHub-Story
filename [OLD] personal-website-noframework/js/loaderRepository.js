window.onload = function () {
  fetchDataListOfRepository("Elpiu");
};

/**
 * Fetch sulla repository prende il readme della repo e lo mette nel divID passato
 * @param {*repository url to fetch} url
 * @param {*User of the repository} user
 * @param {*div to spawn content} divID
 */
function featchRepositoryReadme(url, user, divID) {
  //var user = 'Elpiu';
  var baseUri = "https://github.com/";

  //CORS Anywhere
  //Proxy CORS by https://github.com/Rob--W/cors-anywhere/#documentation
  //Video https://softauthor.com/how-to-fix-cors-issue-permanently-right-now/
  //Usato questo proxy https://allorigins.win/
  urlFetchProxy = "https://api.allorigins.win/raw?url=" + url;
  fetch(urlFetchProxy, {
    method: "GET",
    //headers : {'origin': window.location.href}
  })
    .then(function (response) {
      // The API call was successful!
      return response.text();
    })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      var divReadme = doc.getElementById("readme");

      var links = divReadme.querySelectorAll("img");
      links.forEach((link) => {
        var l = link.src.split(user)[1];

        link.src = baseUri + user + l;
        l.baseUri = baseUri;
      });

      var links = divReadme.querySelectorAll("a[target=_blank]");
      links.forEach((link) => {
        var l = link.href.split(user)[1];
        link.href = baseUri + user + l;
      });

      var htmlOld = document.getElementById(divID).innerHTML;
      document.getElementById(divID).innerHTML = divReadme.innerHTML + htmlOld;

      ele = document.getElementById(divID);
      ele
        .querySelector("[data-target='readme-toc.content']")
        .classList.remove("Box-body", "px-5", "pb-5");
    })
    .catch(function (err) {
      // There was an error
      console.warn("Something went wrong.", err);
    });
}

/**
 * Crea ultimo div della repository con icona e scritta con numeretto
 */
function createSubElementRepo(icon, count, text) {
  var strVar2 = "";
  strVar2 +=
    '                <div class="d-inline-flex p-3"><i class="fa ' +
    icon +
    '"></i>';
  strVar2 += "                    <p>" + text + " " + count + "</p>";
  strVar2 += "                </div>";
  return strVar2;
}
/**
 * Crea div di una singola repository con titolo e descrizione
 */
function createElementRepo(repoWatchers, repoStargazers_count, repoForks) {
  var strVar = "";
  strVar += '<div  style="bottom:0; right:0; text-align: right;">';
  strVar += createSubElementRepo("fa-eye", repoWatchers, "Watchers");
  strVar += createSubElementRepo("fa-star", repoStargazers_count, "Star");
  strVar += createSubElementRepo("fa-code", repoForks, "Forks");

  strVar += "            </div>";
  strVar += "        </div>";
  return strVar;
}

/**
 * Sfrutta API Github caricando le repository dell'utente in input
 */
function fetchDataListOfRepository(userNameGithub) {
  var requestURL = "https://api.github.com/users/" + userNameGithub + "/repos";
  var request = $.get(requestURL, function () {}).done(function () {
    request = request.responseJSON;
    for (let i = 0; i < request.length; i++) {
      //Supporta la speciale repository User/user
      if (request[i]["name"] == userNameGithub.toLowerCase()) continue;
      createBoxElementPortfolioItem(i + 1, request[i], userNameGithub);
    }
  });
}

/**
 * Crea Box della repository con nome e descrizione e il modal del Readme
 * @param {*} id
 * @param {*} data
 */
function createBoxElementPortfolioItem(id, data, userNameGithub) {
  var mainContainer = document.getElementById("myData");
  var repoID = data.id;
  var repoURL = data.svn_url;
  var containerID = id + "modalContainer";

  var strVar = "";
  strVar += "<!-- Portfolio Item " + id + "-->";
  strVar +=
    ' <div class="portfolio-item mx-auto my-2 item-background1" data-bs-toggle="modal"';
  strVar += ' data-bs-target="#portfolioModal' + id + '">';

  strVar += '  <p class="font-weight-bold fs-2 ">' + data.name + "</p>";
  strVar += '  <p class="mb-4">' + data.description + "</p>";

  strVar +=
    '  <div class="portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100 ">';
  strVar +=
    '    <div class="portfolio-item-caption-content text-center text-white"><i';
  strVar += '       class="fas fa-plus fa-3x"></i></div>';
  strVar += "     </div>";

  strVar += createElementRepo(data.watchers, data.stargazers_count, data.forks);
  //strVar += "    <img class=\"img-fluid \" src=\"assets\/fotoProgetti\/logoHorizzontal-removebg.png\">";

  strVar += "  </div>";

  strVar += "<!-- Portfolio Modal " + id + "-->";
  strVar +=
    '<div class="portfolio-modal modal fade " id="portfolioModal' +
    id +
    '" tabindex="-1"';
  strVar +=
    '    aria-labelledby="portfolioModal' + id + '" aria-hidden="true">';
  strVar += '    <div class="modal-dialog modal-xl">';
  strVar += '        <div class="modal-content">';
  strVar +=
    '            <div class="modal-header border-0"><button class="btn-close" type="button"';
  strVar +=
    '                    data-bs-dismiss="modal" aria-label="Close"></button></div>';
  strVar += '            <div class="modal-body text-center pb-5">';
  strVar += '                <div class="container">';
  strVar += '                    <div class="row justify-content-center">';

  strVar +=
    '                        <div id="' + containerID + '" class="col-lg-8">';
  strVar +=
    '                            <button class="btn btn-primary" data-bs-dismiss="modal">';
  strVar += '                                <i class="fas fa-times"></i>';
  strVar += "                                Go Back";
  strVar += "                            </button>";
  strVar += "";
  strVar +=
    '                            <button class="btn btn-primary" data-bs-dismiss="modal"';
  strVar +=
    "                                onclick=\"window.open('" +
    repoURL +
    "','_blank')\" ";
  strVar += '                                data-bs-dismiss="modal">';
  strVar += '                                <i class="fab  fa-github"></i>';
  strVar += "                                GitHub";
  strVar += "                            </button>";
  strVar += "";
  strVar += "";
  strVar += "                        </div>";
  strVar += "                    </div>";
  strVar += "                </div>";
  strVar += "            </div>";
  strVar += "        </div>";
  strVar += "    </div>";
  strVar += "</div>";

  //div.innerHTML= strVar;
  mainContainer.innerHTML += strVar;
  featchRepositoryReadme(repoURL, userNameGithub, containerID);
  //mainContainer.appendChild(div);
}
