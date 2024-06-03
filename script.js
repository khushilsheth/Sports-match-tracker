
const API_KEY ='f8cefc0121msh830ddf765c49112p14571ajsnecaedd89619b';
const API_HOST = 'cricbuzz-cricket.p.rapidapi.com';



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
        return [];
    }
}

let scheduleData = {}; 
function displayMatches(data) {
    const matchesContainer = document.getElementById('matchesContainer');
    matchesContainer.innerHTML = ''; // Clear previous matches

    data.typeMatches.forEach(matchType => {
        const matchTypeContainer = document.createElement('div');
        matchTypeContainer.classList.add('match-type-container');

        const matchTypeDiv = document.createElement('div');
        matchTypeDiv.classList.add('match-type');

        const matchTypeHeading = document.createElement('h2');
        matchTypeHeading.textContent = matchType.matchType;
        matchTypeDiv.appendChild(matchTypeHeading);

        matchTypeContainer.appendChild(matchTypeDiv);

        const matchCardsWrapper = document.createElement('div');
        matchCardsWrapper.classList.add('match-cards-wrapper');

        const matchCardsDiv = document.createElement('div');
        matchCardsDiv.classList.add('match-cards');

        matchType.seriesMatches.forEach(series => {
            const seriesAdWrapper = series.seriesAdWrapper;

            if (seriesAdWrapper && seriesAdWrapper.seriesName && seriesAdWrapper.matches) {
                seriesAdWrapper.matches.forEach(match => {
                    const matchInfo = match.matchInfo;

                    const matchCard = document.createElement('div');
                    matchCard.classList.add('match-card');
                    matchCard.innerHTML = `
                        <h3>${seriesAdWrapper.seriesName}</h3>
                        <p>${matchInfo.team1.teamName} vs ${matchInfo.team2.teamName}</p>
                        <p>Status: ${matchInfo.status}</p>
                    `;
                    matchCard.onclick = () => fetchDetailedScorecard(matchInfo.matchId);

                    matchCardsDiv.appendChild(matchCard);
                });
            }
        });

        matchCardsWrapper.appendChild(matchCardsDiv);




        const leftButton = document.createElement('button');
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
    const modal = document.getElementById('scorecardModal');
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

    const scoreCard = data.scoreCard[0]; // Example: Get the first scoreCard (adjust as needed)
    const batTeamDetails = scoreCard.batTeamDetails;
    const bowlTeamDetails = scoreCard.bowlTeamDetails;

    battingTeamElem.textContent = batTeamDetails.batTeamName || 'N/A';
    bowlingTeamElem.textContent = bowlTeamDetails.bowlTeamName || 'N/A';

    matchStatusElem.textContent = data.status || 'N/A';

    let venueName = 'N/A';
    let venueLocation = 'N/A';

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

    battingScoreElem.innerHTML = `
        <li>Total: ${batTeamDetails.runs || 0}/${batTeamDetails.wickets || 0}</li>
        <li>Overs: ${batTeamDetails.overs || 'N/A'}</li>
    `;

    bowlingScoreElem.innerHTML = `
        <li>Total: ${bowlTeamDetails.runs || 0}/${bowlTeamDetails.wickets || 0}</li>
        <li>Overs: ${bowlTeamDetails.overs || 'N/A'}</li>
    `;

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

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('scorecardModal').style.display = 'none';
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    const modal = document.getElementById('scorecardModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Fetch and display live matches on page load
fetchLiveMatches();

