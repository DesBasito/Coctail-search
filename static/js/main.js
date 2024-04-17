const baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php';
const form = document.getElementById('searchCocktail');
const errorContainer = document.getElementById('errorContainer');

async function makeRequest(url, method = 'GET') {
    try {
        const response = await fetch(url, { method });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Network error: ${error.message}`);
    }
}

async function clickSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const searchTerm = formData.get('cocktail');

    if (!searchTerm) {
        errorContainer.textContent = 'Please enter a search term';
        return;
    }

    const url = `${baseUrl}?s=${encodeURIComponent(searchTerm)}`;

    try {
        const {drinks} = await makeRequest(url);
        console.log(drinks)
        const cocktailsList = document.getElementById('cocktails');
        cocktailsList.innerHTML = ''; // Clear previous results

        if (drinks) {
            drinks.forEach(cocktail => {
                const cocktailName = cocktail.strDrink;
                const cocktailImage = cocktail.strDrinkThumb;

                const cocktailItem = document.createElement('div');

                const cocktailImg = document.createElement('img');
                cocktailImg.src = cocktailImage;
                cocktailImg.alt = cocktailName;
                cocktailImg.id = cocktail.idDrink;
                cocktailImg.className = 'image'


                const cocktailNameElement = document.createElement('span');
                cocktailNameElement.textContent = cocktailName;

                cocktailItem.appendChild(cocktailImg);
                cocktailItem.appendChild(cocktailNameElement);

                cocktailsList.appendChild(cocktailItem);

                cocktailItem.addEventListener('click', () => {
                    displayCocktailModal(cocktail.idDrink);
                });

                cocktailsList.appendChild(cocktailItem);
            });
        } else {
            errorContainer.textContent ='No cocktails found';
        }
    } catch (error) {
        console.log('Error fetching cocktails:', error);
    }
}

async function displayCocktailModal(id) {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch cocktail details');
    }

    const data = await response.json();
    const cocktail = data.drinks[0]; // Assuming only one drink is returned


    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');

    // Set modal title to the cocktail name
    modalTitle.textContent = cocktail.strDrink;

    // Clear previous modal body content
    modalBody.innerHTML = '';

    // Create a list element to display ingredients
    const ingredientsList = document.createElement('ul');

    // Loop through ingredients (assuming they are in strIngredient1 to strIngredient15)
    for (let i = 1; i <= 15; i++) {
        const ingredientName = cocktail[`strIngredient${i}`];
        const ingredientMeasure = cocktail[`strMeasure${i}`];

        // Check if ingredient exists
        if (ingredientName && ingredientName.trim() !== '') {
            const listItem = document.createElement('li');
            listItem.textContent = `${ingredientMeasure ? ingredientMeasure.trim() + ' ' : ''}${ingredientName}`;
            ingredientsList.appendChild(listItem);
        }
    }

    // Append ingredients list to modal body
    modalBody.appendChild(ingredientsList);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
}


form.addEventListener('submit', clickSubmit);