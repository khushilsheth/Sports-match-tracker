const API_KEY = "YOUR API_KEY";
const API_HOST = 'cricbuzz-cricket.p.rapidapi.com';

// async await  function to fetch the matches
async function fetchLiveMatches() {
    const url = 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result);
        displayMatches(result);
    } catch (error) {
        console.error(error);
    }
}

// async await function to fetch the venue details
async function fetchVenueDetails() {
    const url = 'https://cricbuzz-cricket.p.rapidapi.com/series/v1/3718/venues';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Venue Data:', result);
        return result.seriesVenue;
    } catch (error) {
        console.error(error);
        return []; // extra checkpoint for any type errors
    }
}

let scheduleData = {};

//potential function which displays match card, cards are made and dsiplayed using DOM in this.
function displayMatches(data) {
    const matchesContainer = document.getElementById('matchesContainer');//main container which has all elements in it(whole page)
    matchesContainer.innerHTML = ''; // Clear previous matches data 

    data.typeMatches.forEach(matchType => {                          //for each iterates through the matchTypes array IN the typeMatches.
        const matchTypeContainer = document.createElement('div');    //new div container for each match type 
        matchTypeContainer.classList.add('match-type-container');    //for classname of that container

        const matchTypeDiv = document.createElement('div'); //div for holding Name of  match type.
        matchTypeDiv.classList.add('match-type');

        const matchTypeHeading = document.createElement('h2');  
        matchTypeHeading.textContent = matchType.matchType;   //to write the type of match in h2
        matchTypeDiv.appendChild(matchTypeHeading);         //appends heading IN the matchtype div  


        matchTypeContainer.appendChild(matchTypeDiv);  //appends the above div in the main div.

        const matchCardsWrapper = document.createElement('div');  //div for creating a horizontal wrapper for a whole row
        matchCardsWrapper.classList.add('match-cards-wrapper');

        const matchCardsDiv = document.createElement('div');  // div for holding all the match cardS
        matchCardsDiv.classList.add('match-cards');


        matchType.seriesMatches.forEach(series => {         //for iterating each series in the series ad wrapper from endpoints
            const seriesAdWrapper = series.seriesAdWrapper;

            if (seriesAdWrapper && seriesAdWrapper.seriesName && seriesAdWrapper.matches) {
                seriesAdWrapper.matches.forEach(match => {
                    const matchInfo = match.matchInfo;          
                    const matchScore = match.matchScore;        //getting matchscore and info    

                    const matchCard = document.createElement('div');  // div tag for each match card
                    matchCard.classList.add('match-card');       
                    matchCard.innerHTML = `
                        <h3>${seriesAdWrapper.seriesName}</h3>       //resulting the html card and displaying elements fetched by javascript in the html tags inside javascript 
                        <p>${matchInfo.team1.teamName} vs ${matchInfo.team2.teamName}</p>
                        <p>Status: ${matchInfo.status}</p>
                        ${matchScore ? `
                        <p>${matchInfo.team1.teamName} - ${matchScore.team1Score ? `${matchScore.team1Score.inngs1.runs}/${matchScore.team1Score.inngs1.wickets} (${matchScore.team1Score.inngs1.overs} overs)` : 'N/A'}</p>
                        <p>${matchInfo.team2.teamName} - ${matchScore.team2Score ? `${matchScore.team2Score.inngs1.runs}/${matchScore.team2Score.inngs1.wickets} (${matchScore.team2Score.inngs1.overs} overs)` : 'N/A'}</p>
                        ` : '<p>Score not available</p>'}
                    `;
                    matchCard.onclick = () => fetchDetailedScorecard(matchInfo.matchId);   // on clicking runs the function and takes match id.

                    matchCardsDiv.appendChild(matchCard);  //appending each match acrd inside the match cardS div
                });
            }
        });

        matchCardsWrapper.appendChild(matchCardsDiv);   //similarly appending match cards in match wrapper

        const leftButton = document.createElement('button');  //button function for scrolling.. on clicking 
        leftButton.classList.add('scroll-button', 'left');
        leftButton.innerHTML = '&#9664;';
        leftButton.onclick = () => {
            matchCardsWrapper.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        };

        const rightButton = document.createElement('button');   
        rightButton.classList.add('scroll-button', 'right');
        rightButton.innerHTML = '&#9654;';
        rightButton.onclick = () => {
            matchCardsWrapper.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        };

        matchTypeContainer.appendChild(leftButton);
        matchTypeContainer.appendChild(matchCardsWrapper);
        matchTypeContainer.appendChild(rightButton);

        matchesContainer.appendChild(matchTypeContainer);
    });
}

async function fetchDetailedScorecard(matchId) {
    const url = `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Scorecard Data:', result);
        const venueData = await fetchVenueDetails();
        displayScorecard(result, matchId, venueData);
    } catch (error) {
        console.error(error);
    }
}

function displayScorecard(data, matchId, venueData) {          
    const modal = document.getElementById('scorecardModal');     // getting html id 
    const battingTeamElem = document.getElementById('battingTeam');
    const battingScoreElem = document.getElementById('battingScore');
    const matchStatusElem = document.getElementById('matchStatus');
    const matchInfoElem = document.getElementById('matchInfo');
    const bowlingTeamElem = document.getElementById('bowlingTeam');
    const bowlingScoreElem = document.getElementById('bowlingScore');
    const battingDetailsElem = document.getElementById('battingDetails');
    const bowlingDetailsElem = document.getElementById('bowlingDetails');

    // Clear previous content
    battingTeamElem.textContent = '';
    battingScoreElem.innerHTML = '';
    matchStatusElem.textContent = '';
    matchInfoElem.innerHTML = '';
    bowlingTeamElem.textContent = '';
    bowlingScoreElem.innerHTML = '';
    battingDetailsElem.innerHTML = '';
    bowlingDetailsElem.innerHTML = '';

    if (!data || !data.scoreCard || data.scoreCard.length === 0) {
        console.error('Invalid data format:', data);
        return;
    }

    const scoreCard = data.scoreCard[0]; //  get the first scoreCard (adjust as needed), initiaalize
    const batTeamDetails = scoreCard.batTeamDetails;
    const bowlTeamDetails = scoreCard.bowlTeamDetails;

    battingTeamElem.textContent = batTeamDetails.batTeamName || 'N/A'; // setting the name
    bowlingTeamElem.textContent = bowlTeamDetails.bowlTeamName || 'N/A';

    matchStatusElem.textContent = data.status || 'N/A';

    let venueName = 'N/A';
    let venueLocation = 'N/A';
//some issue while displaying venue
    if (data.venue && data.venue.id && venueData) {
        const venueDetails = venueData.find(venue => venue.id === data.venue.id);
        if (venueDetails) {
            venueName = venueDetails.ground || 'N/A';
            venueLocation = `${venueDetails.city}, ${venueDetails.country}` || 'N/A';
        }
    }

    matchInfoElem.innerHTML = `
        <li>Match: ${data.seriesName || 'N/A'}</li>
        <li>Date: ${scheduleData[matchId] || 'N/A'}</li>
        <li>Venue: ${venueName}, ${venueLocation}</li>
    `;
// commmented since the score was not able to fetch in the detaield score card.
    // battingScoreElem.innerHTML = `                                          
    //     <li>Total: ${batTeamDetails.runs || 0}/${batTeamDetails.wickets || 0}</li>
    //     <li>Overs: ${batTeamDetails.overs || 'N/A'}</li>
    // `;

    // bowlingScoreElem.innerHTML = `
    //     <li>Total: ${bowlTeamDetails.runs || 0}/${bowlTeamDetails.wickets || 0}</li>
    //     <li>Overs: ${bowlTeamDetails.overs || 'N/A'}</li>
    // `;

    battingDetailsElem.innerHTML = `
        <h3>${batTeamDetails.batTeamName || 'N/A'} Innings</h3>
        ${Object.values(batTeamDetails.batsmenData).map(batsman => `
            <p>${batsman.batName || 'N/A'}: ${batsman.runs || 0} (${batsman.balls || 0}) - ${batsman.outDesc || 'N/A'}</p>
        `).join('')}
    `;

    bowlingDetailsElem.innerHTML = `
        <h3>${bowlTeamDetails.bowlTeamName || 'N/A'} Bowling</h3>
        ${Object.values(bowlTeamDetails.bowlersData).map(bowler => `
            <p>${bowler.bowlName || 'N/A'}: ${bowler.overs || 'N/A'} overs, ${bowler.runs || 0} runs, ${bowler.wickets || 0} wickets</p>
        `).join('')}
    `;
//to display the whole detailed score card 
    modal.style.display = 'block';  // css display block so that this function will overlap and show its content over the background, also we can mondify on clicking
}

function closeModal() {               //to close it with arrorw button this is the arrow function
    document.getElementById('scorecardModal').style.display = 'none';
}

// Close the modal when clicking anywhere outside of the modal

// document.addEventListener('click', (event) => {             //an event occurs which satisfies and close the modal
//   const modal = document.getElementById('scorecardModal');  
//   if (event.target !== modal) {              // to determine weather clicked outside     
//     // User clicked outside the modal
//      modal.style.display = 'none';
//   }
// }); 

//modified works.
window.onclick = function(event) {         
    const modal = document.getElementById('scorecardModal');
    if (event.target == modal) {          
        modal.style.display = 'none';   
    }
}

// Fetch and display live matches on page load
fetchLiveMatches();

