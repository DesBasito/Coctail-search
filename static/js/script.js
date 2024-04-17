const cocktailResults = document.getElementById('cocktailResults');
const form = document.getElementById('searchCock');
const errorContainer = document.getElementById('errorContainer');


async function search(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const searchTerm = formData.get('cocktail');
    errorContainer.textContent = ''
    if (!searchTerm) {
        errorContainer.textContent = 'Please enter a search term';
        return;
    }
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`);
        const data = await response.json();

        if (data.drinks) {
            renderCocktails(data.drinks);
        } else {
            cocktailResults.innerHTML = '<p>No cocktails found.</p>';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function renderCocktails(cocktails) {
    cocktailResults.innerHTML = '';

    cocktails.forEach(cocktail => {
        const cocktailCard = `
                <div class="col-md-4 mb-4">
                    <div class="texas border-secondary border-0" >
                        <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}"onclick="showCocktailDetails('${cocktail.idDrink}')">
                        <div class="texas-body">
                            <h5 class="texas-title">${cocktail.strDrink}</h5>
     
                        </div>
                    </div>
                </div>
            `;
        cocktailResults.innerHTML += cocktailCard;
    });
}

async function showCocktailDetails(cocktailId) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
        const data = await response.json();

        const cocktail = data.drinks[0];

        // Display modal or more detailed information
        alert(`Name: ${cocktail.strDrink}\nCategory: ${cocktail.strCategory}\nGlass: ${cocktail.strGlass}\nInstructions: ${cocktail.strInstructions}`);
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}

form.addEventListener('submit', search);

