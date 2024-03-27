// JavaScript application that interacts with The Meal DB API to take and manage orders for the chef's favourite meals

// Function to initiate fetching meals by ingredient
function fetchMealsByIngredient() {
  // Ask the user for the main ingredient
  let mainIngredient = prompt(
    "Please enter the main ingredient you'd like for your meal:"
  );

  // Check if the user entered something or clicked 'cancel'
  if (mainIngredient === null || mainIngredient === "") {
    alert("Invalid input");
    return; // Exit function if input is invalid or canceled
  }

  // Format the user input to lowercase and replace spaces with underscores
  const formattedIngredient = mainIngredient.toLowerCase().replace(/\s/g, "_");
  const ingredientURL = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedIngredient}`;

  // Call the API using Fetch
  fetch(ingredientURL)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      if (data.meals === null) {
        console.log(
          "No meals found for the specified ingredient. Please try another one."
        );
        // Retry by calling the function recursively
        fetchMealsByIngredient();
      } else {
        // Log fetched data for demonstration
        console.log(data);

        // Get a random meal from the list of meals
        const randomIndex = Math.floor(Math.random() * data.meals.length);
        const randomMeal = data.meals[randomIndex];

        // Display the randomly selected meal
        console.log("Randomly selected meal:", randomMeal);

        // Define the order based on the meal description and assign a completion status
        const order = {
          description: randomMeal.strMeal, // Using the meal description as the order's description
          orderNumber: getOrderNumberFromStorage(), // Function to get the next unique order number
          completionStatus: "incomplete", // Initially marked as incomplete
        };

        // Store order details in sessionStorage with modified storage format
        storeOrderInSession(order);

        // Display the order details in the console
        console.log(`Order Description: ${order.description}`);
        console.log(`Order Number: ${order.orderNumber}`);
        console.log(`Completion Status: ${order.completionStatus}`);

        // Display incomplete orders using prompt when needed
        displayIncompleteOrders();

        // Prompt user to mark an order as complete or incomplete
        promptOrderCompletion();
      }
    })
    .catch((error) => {
      // Handle any errors that occurred during the fetch request
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Function to display incomplete orders using prompt
function displayIncompleteOrders() {
  // Retrieve existing orders from sessionStorage or initialize an empty array
  const existingOrders = JSON.parse(sessionStorage.getItem("orders")) || [];

  // Filter incomplete orders
  const incompleteOrders = existingOrders.filter(
    (order) => order.completionStatus === "incomplete"
  );

  if (incompleteOrders.length === 0) {
    alert("No incomplete orders found.");
    return;
  }

  // Prepare the message with order numbers and descriptions
  let ordersMessage = "Incomplete Orders:\n";
  incompleteOrders.forEach((order) => {
    ordersMessage += `Order Number: ${order.orderNumber} - Description: ${order.description}\n`;
  });

  // Display the incomplete orders using prompt()
  alert(ordersMessage);
}

// Function to prompt the user to mark an order as complete or incomplete
function promptOrderCompletion() {
  // Prompt the user to enter an order number or zero
  let orderNumberInput = prompt(
    "Enter the order number to mark as complete or enter zero to not complete an order:"
  );

  // Check if the user input is null or empty
  if (orderNumberInput === null || orderNumberInput === "") {
    alert("Invalid input");
    return; // Exit function if input is invalid or canceled
  }

  // Convert the user input to an integer
  orderNumberInput = parseInt(orderNumberInput);

  // Check if the user entered zero, indicating that the order is not completed
  if (orderNumberInput === 0) {
    alert("Order not marked as complete.");
    return; // Exit function if order is not completed
  }

  // Retrieve existing orders from sessionStorage or initialize an empty array
  let existingOrders = JSON.parse(sessionStorage.getItem("orders")) || [];

  // Use filter to find the order to update based on the entered order number
  const orderToUpdate = existingOrders.find(
    (order) => order.orderNumber === orderNumberInput
  );

  // Check if the entered order number was not found in the existing orders
  if (!orderToUpdate) {
    alert("Order number not found.");
    return; // Exit function if order number is not found
  }

  // Update the completion status of the found order to 'completed'
  orderToUpdate.completionStatus = "completed";

  // Commit the updated orders back to sessionStorage
  existingOrders = existingOrders.map((order) =>
    order.orderNumber === orderNumberInput ? orderToUpdate : order
  );
  sessionStorage.setItem("orders", JSON.stringify(existingOrders));

  // Notify the user that the specified order has been marked as completed
  alert(`Order number ${orderNumberInput} marked as completed.`);
}
// Function to store order details in sessionStorage with modified storage format
function storeOrderInSession(order) {
  // Retrieve existing orders from sessionStorage or initialize an empty array
  const existingOrders = JSON.parse(sessionStorage.getItem("orders")) || [];

  // Add the new order to the existing orders array
  existingOrders.push(order);

  // Store the updated orders back in sessionStorage as a single JSON array
  sessionStorage.setItem("orders", JSON.stringify(existingOrders));

  // Store the last order number separately in sessionStorage
  const lastOrderNumber = order.orderNumber;
  sessionStorage.setItem("lastOrderNumber", lastOrderNumber);
}

// Function to get the next unique order number from sessionStorage
function getOrderNumberFromStorage() {
  // Retrieve the last order number from sessionStorage or set it to 0 if not present
  let lastOrderNumber =
    parseInt(sessionStorage.getItem("lastOrderNumber")) || 0;

  // Increment the last order number to get the next unique order number
  lastOrderNumber++;

  // Store the updated last order number back in sessionStorage
  sessionStorage.setItem("lastOrderNumber", lastOrderNumber);

  return lastOrderNumber;
}

// Call the function to initiate fetching meals by ingredient
fetchMealsByIngredient();
