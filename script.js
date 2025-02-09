// constants :-)
const expenseForm = document.getElementById("expense-form");
const expenseLog = document.getElementById("expense-log");
const amountToConvert = document.getElementById("amount-to-convert");
const currencySelect = document.getElementById("currency-select");
const convertButton = document.getElementById("convert-button");
const conversionResult = document.getElementById("conversion-result");
const ctx = document.getElementById("spendingChart").getContext("2d");
const cryptoSelect = document.getElementById("crypto-select");
const cryptoPrice = document.getElementById("crypto-price");
const getCryptoButton = document.getElementById("get-crypto-button");

let expenses = [];

// to get the values from localStorage
function loadExpenses() {
  const storedExpenses = JSON.parse(localStorage.getItem("expenses"));
  if (storedExpenses) {
    expenses = storedExpenses;
    updateExpenseLog();
    updateChart();
  }
}

// saving to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// adding expenses
expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const expenseName = document.getElementById("expense-name").value;
  const expenseAmount = parseFloat(
    document.getElementById("expense-amount").value
  );
  const expenseCategory = document.getElementById("expense-category").value;

  expenses.push({
    name: expenseName,
    amount: expenseAmount,
    category: expenseCategory,
  });
  saveExpenses();
  updateExpenseLog();
  updateChart();
  expenseForm.reset();
});

// update the expense log display
function updateExpenseLog() {
  expenseLog.innerHTML = expenses
    .map(
      (expense, index) => `
        <div>
            ${expense.name}: $${expense.amount.toFixed(2)} (${expense.category})
            <button onclick="deleteExpense(${index})">Delete</button>
        </div>
    `
    )
    .join("");
}

// delete an expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  updateExpenseLog();
  updateChart();
}

// Initialize the chart
let spendingChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Spending by Category",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// update the chart with new data
function updateChart() {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  spendingChart.data.labels = Object.keys(categoryTotals);
  spendingChart.data.datasets[0].data = Object.values(categoryTotals);
  spendingChart.update();
}

// Currency conversion
convertButton.addEventListener("click", async function () {
  const amount = parseFloat(amountToConvert.value);
  const currency = currencySelect.value;

  if (isNaN(amount)) {
    conversionResult.innerText = "Please enter a valid amount.";
    return;
  }

  const exchangeRate = await getExchangeRate(currency);
  const convertedAmount = (amount * exchangeRate).toFixed(2);
  conversionResult.innerText = `${amount} USD = ${convertedAmount} ${currency}`;
});

// exchange rates
async function getExchangeRate(currency) {
  const response = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=236c789af61a41a4b7cb472e1b2369bf`
  );
  const data = await response.json();
  return data.rates[currency];
}

// Add this new function for crypto price checking
async function getCryptoPrice() {
    try {
        const selectedCrypto = cryptoSelect.value;
        const response = await fetch(
            `https://api.coinbase.com/v2/prices/${selectedCrypto}-USD/spot`
        );
        const data = await response.json();
        const price = parseFloat(data.data.amount).toFixed(2);
        cryptoPrice.innerHTML = `1 ${selectedCrypto} = $${price} USD`;
        
        // Add a helpful conversion of total expenses to crypto
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const cryptoAmount = (totalExpenses / price).toFixed(4);
        cryptoPrice.innerHTML += `<br>Your total expenses ($${totalExpenses.toFixed(2)}) = ${cryptoAmount} ${selectedCrypto}`;
    } catch (error) {
        cryptoPrice.innerHTML = "Unable to fetch crypto price";
        console.error("Crypto API Error:", error);
    }
}

// Add event listener for crypto button
getCryptoButton.addEventListener("click", getCryptoPrice);

// Load expenses on page load
loadExpenses();

