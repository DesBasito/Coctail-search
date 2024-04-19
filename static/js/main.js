const cocktailResults = document.getElementById('cocktailResults');
const form = document.getElementById('searchCock');
const searchInput = document.querySelector("[data-search]")

searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    form.querySelector('input[name="cocktail"]').value = value;
    search(new Event('input'), value).then(r => new Error().cause);
});

async function search(event, value) {
    event.preventDefault();
    const formData = new FormData(form);
    let searchTerm = formData.get('cocktail');
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`);

        const data = await response.json();

        const drinks1 = data.drinks || [];
        const drinks2 = await byIngredients(searchTerm);

        const idSet = new Set();
        const uniqueDrinks = [];

        const addUniqueDrinks = (drinks) => {
            drinks.forEach((drink) => {
                if (!idSet.has(drink.idDrink)) {
                    idSet.add(drink.idDrink);
                    uniqueDrinks.push(drink);
                }
            });
        };

        if (drinks1 !== null) {
            addUniqueDrinks(drinks1);
        }
        if (drinks2 !== null) {
            addUniqueDrinks(drinks2);
        }

        if (uniqueDrinks.length === 0) {
            const nameSearchResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            const dataByName = await nameSearchResponse.json();

            const drinksByName = dataByName.drinks || [];
            addUniqueDrinks(drinksByName);
        }

        if (uniqueDrinks.length > 0) {
            renderCocktails(uniqueDrinks);
        } else {
            cocktailResults.innerHTML = '<p>No unique cocktails found.</p>';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}


async function byIngredients(searchTerm) {
    try {
        const responseByIngredients = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchTerm}`);
        let data = await responseByIngredients.json();
        data = data.drinks || []
        return data;
    } catch (error) {
        return null;
    }
}

function renderCocktails(cocktails) {
    cocktailResults.innerHTML = '';

    cocktails.forEach(cocktail => {
        const cocktailCard = `
                <div class="col-md-4 mb-4">
                    <div class="texas border-secondary border-0" >
                        <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}" style="cursor: pointer" onclick="showCocktailDetails('${cocktail.idDrink}')">
                        <div class="texas-body">
                            <h5 class="texas-title">${cocktail.strDrink}</h5>
                        </div>
                    </div>
                </div>
            `;
        cocktailResults.innerHTML += cocktailCard;
    });
}

async function ingredientsList(cocktail) {
    let ingredientsHTML = '';

    for (let i = 1; i <= 15; i++) {
        const ingredientKey = `strIngredient${i}`;
        const measureKey = `strMeasure${i}`;

        if (cocktail[ingredientKey]) {
            const ingredient = cocktail[ingredientKey];
            const measure = cocktail[measureKey];

            ingredientsHTML += `
                <div class="row align-items-center mb-2">
                    <div class="col-auto pr-3">
                        <img src="https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png" class="ingredientBorder" onclick="showIngredientDetails('${encodeURIComponent(ingredient)}')" alt="${ingredient} ">
                    </div>
                    <div class="col">
                        <div>${ingredient} (${measure})</div>
                    </div>
                </div>`;
        } else {
            break;
        }
    }

    return ingredientsHTML;
}

async function showCocktailDetails(cocktailId) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
        const data = await response.json();
        const cocktail = data.drinks[0];
        await showDetails('cocktail', cocktail);
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
    }
}

async function showIngredientDetails(ingredientName) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${ingredientName}`);
        const data = await response.json();
        const ingredient = data.ingredients[0];
        await showDetails('ingredient', ingredient);
    } catch (error) {
        console.error('Error fetching ingredient details:', error);
    }
}

async function showDetails(type, data) {
    const modalTitle = document.getElementById('detailModalLabel');
    const modalBody = document.getElementById('detailModalBody');
    const modalFooter = document.querySelector('#detailModal .modal-footer');

    if (type === 'cocktail') {
        modalTitle.textContent = 'Cocktail Details';
        modalBody.innerHTML = `
            <img src="${data.strDrinkThumb}" style="width: 430px;">
            <p><strong>Name:</strong> ${data.strDrink}</p>
            <p><strong>Category:</strong> ${data.strCategory}</p>
            <p><strong>Alcoholic:</strong> ${data.strAlcoholic}</p>
            <p><strong>Instructions:</strong> ${data.strInstructions}</p>
            <p><strong>Ingredients:</strong> <br></p>
            ${await ingredientsList(data)}
        `;
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        `;
    } else if (type === 'ingredient') {
        modalTitle.textContent = 'Ingredient Details';
        modalBody.innerHTML = `
            <img src="https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(data.strIngredient)}.png" style="width: 350px;" class="rounded-circle">
            <p><strong>Name:</strong> ${data.strIngredient}</p>
            <p><strong>Type:</strong> ${data.strType || 'just a regular ' + data.strIngredient}</p>
            <p><strong>Description:</strong> ${data.strDescription || '-'}</p>
        `;
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="searchByIngredient">Search by Ingredient</button>
        `;
        const searchByIngredientBtn = document.getElementById('searchByIngredient');

        searchByIngredientBtn.addEventListener('click', () => {
            $('#detailModal').modal('hide');
            form.querySelector('input[name="cocktail"]').value = data.strIngredient;
            search(new Event('search'));
        });
    }

    $('#detailModal').modal('show');
}


form.addEventListener('submit', search);

