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
        let ingredients = await ingredientsList(cocktail);
        let size = ingredients.length;


        const modalContent = `
            <p><strong>Name:</strong> ${cocktail.strDrink}</p>
            <p><strong>Category:</strong> ${cocktail.strCategory}</p>
            <p><strong>Alcoholic:</strong> ${cocktail.strAlcoholic}</p>
            <p><strong>Instructions:</strong> ${cocktail.strInstructions}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>
            <list>
            ${ingredients}</list></ul>
     
        `;

        const modalBody = document.getElementById('cocktailModalBody');
        modalBody.innerHTML = modalContent;

        // Show the modal
        $('#cocktailModal').modal('show');

    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}

async function ingredientsList(cocktail) {
    let ingredientsHTML = '';

    for (let i = 1; i <= 15; i++) {
        const ingredientKey = `strIngredient${i}`;
        const measureKey = `strMeasure${i}`;

        if (cocktail[ingredientKey]) {
            const ingredient = cocktail[ingredientKey];
            const measure = cocktail[measureKey];

            ingredientsHTML += `<li>${ingredient} - ${measure}</li>`;
        } else {
            break;
        }
    }

    return ingredientsHTML;
}


form.addEventListener('submit', search);

