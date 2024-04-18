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
        const responseByIngredients = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchTerm}`);

        const data = await response.json();
        console.log(data)
        const dataByIng = await responseByIngredients.json();

        const drinks1 = data.drinks || [];
        const drinks2 = dataByIng.drinks || [];

        const idSet = new Set();
        const uniqueDrinks = [];

        // Function to add unique drinks to the list
        const addUniqueDrinks = (drinks) => {
            drinks.forEach((drink) => {
                if (!idSet.has(drink.idDrink)) {
                    idSet.add(drink.idDrink);
                    uniqueDrinks.push(drink);
                }
            });
        };

        // Add drinks from both responses
        addUniqueDrinks(drinks1);
        addUniqueDrinks(drinks2);

        // If no unique cocktails found based on ingredients, search by name
        if (uniqueDrinks.length === 0) {
            const nameSearchResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            const dataByName = await nameSearchResponse.json();

            const drinksByName = dataByName.drinks || [];
            addUniqueDrinks(drinksByName);
        }

        // Render cocktails or display message if no cocktails found
        if (uniqueDrinks.length > 0) {
            renderCocktails(uniqueDrinks);
        } else {
            cocktailResults.innerHTML = '<p>No unique cocktails found.</p>';
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
            <p><strong>Ingredients:</strong> <br></p>
            ${ingredients}     
            <p><strong>Name:</strong> ${cocktail.strDrink}</p>
            <p><strong>Category:</strong> ${cocktail.strCategory}</p>
            <p><strong>Alcoholic:</strong> ${cocktail.strAlcoholic}</p>
            <p><strong>Instructions:</strong> ${cocktail.strInstructions}</p>
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

            const imageUrl = `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png`;

            try {
                const imageResponse = await fetch(imageUrl);

                if (imageResponse.ok) {
                    const imageBlob = await imageResponse.blob();
                    const imageSrc = URL.createObjectURL(imageBlob);

                    ingredientsHTML += `
                        <div class="row align-items-center mb-2">
                            <div class="col-auto pr-3">
                                <img src="${imageSrc}" class="ingredientBorder" style="width: 60px" alt="${ingredient}">
                            </div>
                            <div class="col">
                                <div>${ingredient} (${measure})</div>
                            </div>
                        </div>`;
                } else {
                    ingredientsHTML += `<div>${ingredient} (${measure})</div>`;
                    console.log(`Failed to fetch image for ${ingredient}`);
                }
            } catch (error) {
                console.error(`Error fetching image for ${ingredient}:`, error);
                ingredientsHTML += `<div>${ingredient} (${measure})</div>`;
            }
        } else {
            break;
        }
    }

    return ingredientsHTML;
}



form.addEventListener('submit', search);

