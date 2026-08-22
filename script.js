const transactionForm =
    document.getElementById("transactionForm");

const descriptionInput =
    document.getElementById("description");

const amountInput =
    document.getElementById("amount");

const dateInput =
    document.getElementById("date");

const categoryInput =
    document.getElementById("category");

const noteInput =
    document.getElementById("note");

const transactionList =
    document.getElementById("transactionList");

const emptyState =
    document.getElementById("emptyState");

const incomeElement =
    document.getElementById("income");

const expensesElement =
    document.getElementById("expenses");

const balanceElement =
    document.getElementById("balance");

const transactionCount =
    document.getElementById("transactionCount");

const filterCategory =
    document.getElementById("filterCategory");

const filterType =
    document.getElementById("filterType");

const searchInput =
    document.getElementById("searchInput");

const typeButtons =
    document.querySelectorAll(".type-btn");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");

const categorySummary =
    document.getElementById("categorySummary");


// ================================================
// VARIABLES
// ================================================

let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];


let transactionType = "expense";

let editingId = null;


// ================================================
// SET TODAY'S DATE
// ================================================

const today =
    new Date()
        .toISOString()
        .split("T")[0];

dateInput.value = today;


// ================================================
// TRANSACTION TYPE
// ================================================

typeButtons.forEach(button => {

    button.addEventListener("click", () => {

        typeButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        transactionType =
            button.dataset.type;


        // Change categories based on type

        if (transactionType === "income") {

            categoryInput.value = "Salary";

        } else {

            categoryInput.value = "Food";

        }

    });

});


// ================================================
// ADD / EDIT TRANSACTION
// ================================================

transactionForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const description =
            descriptionInput.value.trim();

        const amount =
            parseFloat(amountInput.value);

        const date =
            dateInput.value;

        const category =
            categoryInput.value;

        const note =
            noteInput.value.trim();


        if (!description || !amount || !date) {
            return;
        }


        // EDIT EXISTING TRANSACTION

        if (editingId !== null) {

            transactions =
                transactions.map(transaction => {

                    if (
                        transaction.id === editingId
                    ) {

                        return {

                            ...transaction,

                            description,

                            amount,

                            date,

                            category,

                            note,

                            type: transactionType

                        };

                    }

                    return transaction;

                });


            editingId = null;

            submitBtn.textContent =
                "+ Add Transaction";

            cancelBtn.style.display =
                "none";

            formTitle.textContent =
                "Add Transaction";

        }


        // ADD NEW TRANSACTION

        else {

            const transaction = {

                id: Date.now(),

                description,

                amount,

                date,

                category,

                note,

                type: transactionType

            };


            transactions.unshift(transaction);

        }


        saveTransactions();

        transactionForm.reset();

        dateInput.value = today;

        transactionType = "expense";


        typeButtons.forEach(button =>
            button.classList.remove("active")
        );


        document
            .querySelector('[data-type="expense"]')
            .classList.add("active");


        render();

    }
);


// ================================================
// SAVE TO LOCAL STORAGE
// ================================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ================================================
// FORMAT CURRENCY
// ================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(amount);

}


// ================================================
// FORMAT DATE
// ================================================

function formatDate(date) {

    const dateObject =
        new Date(date + "T00:00:00");

    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ================================================
// CALCULATE SUMMARY
// ================================================

function calculateSummary() {

    let income = 0;

    let expenses = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expenses += transaction.amount;

        }

    });


    const balance =
        income - expenses;


    incomeElement.textContent =
        formatCurrency(income);

    expensesElement.textContent =
        formatCurrency(expenses);

    balanceElement.textContent =
        formatCurrency(balance);


    if (balance < 0) {

        balanceElement.style.color =
            "var(--red)";

    } else {

        balanceElement.style.color =
            "var(--text)";

    }

}


// ================================================
// FILTER TRANSACTIONS
// ================================================

function getFilteredTransactions() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        filterCategory.value;


    const type =
        filterType.value;


    return transactions.filter(
        transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search)

                ||

                transaction.category
                    .toLowerCase()
                    .includes(search)

                ||

                (transaction.note || "")
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all"
                ||
                transaction.category === category;


            const matchesType =
                type === "all"
                ||
                transaction.type === type;


            return (
                matchesSearch
                &&
                matchesCategory
                &&
                matchesType
            );

        }
    );

}


// ================================================
// RENDER TRANSACTIONS
// ================================================

function renderTransactions() {

    const filtered =
        getFilteredTransactions();


    transactionList.innerHTML = "";


    transactionCount.textContent =
        filtered.length;


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filtered.forEach(transaction => {

        const element =
            document.createElement("div");


        element.className =
            `transaction ${transaction.type}`;


        const icon =
            getCategoryIcon(
                transaction.category
            );


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        element.innerHTML = `

            <div class="transaction-icon">

                ${icon}

            </div>


            <div class="transaction-details">

                <h3>
                    ${escapeHTML(
                        transaction.description
                    )}
                </h3>

                <p>

                    ${icon}
                    ${transaction.category}

                    &nbsp; • &nbsp;

                    ${formatDate(
                        transaction.date
                    )}

                </p>

            </div>


            <div class="transaction-amount">

                ${sign}
                ${formatCurrency(
                    transaction.amount
                )}

            </div>


            <div class="transaction-actions">

                <button
                    class="action-btn"
                    onclick="editTransaction(
                        ${transaction.id}
                    )">

                    ✏️

                </button>


                <button
                    class="action-btn"
                    onclick="deleteTransaction(
                        ${transaction.id}
                    )">

                    🗑️

                </button>

            </div>

        `;


        transactionList.appendChild(element);

    });

}


// ================================================
// CATEGORY ICONS
// ================================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Shopping: "🛍️",

        Transport: "🚗",

        Bills: "🧾",

        Entertainment: "🎬",

        Health: "❤️",

        Education: "📚",

        Salary: "💼",

        Freelance: "💻",

        Other: "📦"

    };


    return icons[category] || "📦";

}


// ================================================
// EDIT TRANSACTION
// ================================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) return;


    editingId = id;


    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    dateInput.value =
        transaction.date;

    categoryInput.value =
        transaction.category;

    noteInput.value =
        transaction.note || "";


    transactionType =
        transaction.type;


    typeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.type ===
                transactionType
        );

    });


    formTitle.textContent =
        "Edit Transaction";

    submitBtn.textContent =
        "Save Changes";

    cancelBtn.style.display =
        "block";


    document
        .querySelector(".form-card")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ================================================
// CANCEL EDIT
// ================================================

cancelBtn.addEventListener(
    "click",
    () => {

        editingId = null;

        transactionForm.reset();

        dateInput.value = today;

        formTitle.textContent =
            "Add Transaction";

        submitBtn.textContent =
            "+ Add Transaction";

        cancelBtn.style.display =
            "none";


        transactionType =
            "expense";


        typeButtons.forEach(button =>
            button.classList.remove("active")
        );


        document
            .querySelector(
                '[data-type="expense"]'
            )
            .classList.add("active");

    }
);


// ================================================
// DELETE TRANSACTION
// ================================================

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) return;


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    render();

}


// ================================================
// CATEGORY SPENDING SUMMARY
// ================================================

function renderCategorySummary() {

    const expenses =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const totals = {};


    expenses.forEach(transaction => {

        if (!totals[transaction.category]) {

            totals[transaction.category] = 0;

        }


        totals[transaction.category] +=
            transaction.amount;

    });


    const categories =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1]);


    categorySummary.innerHTML = "";


    if (categories.length === 0) {

        categorySummary.innerHTML = `

            <p style="
                color: var(--muted);
                padding: 10px 0;
            ">

                No expense data available yet.

            </p>

        `;

        return;

    }


    const totalExpenses =
        expenses.reduce(
            (sum, transaction) =>
                sum + transaction.amount,
            0
        );


    categories.forEach(
        ([category, amount]) => {

            const percentage =
                totalExpenses === 0
                    ? 0
                    : (amount / totalExpenses) * 100;


            const item =
                document.createElement("div");


            item.className =
                "category-item";


            item.innerHTML = `

                <div class="category-top">

                    <span class="category-name">

                        ${getCategoryIcon(category)}

                        ${category}

                    </span>

                    <span class="category-amount">

                        ${formatCurrency(amount)}

                    </span>

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="
                            width:${percentage}%
                        ">

                    </div>

                </div>

            `;


            categorySummary.appendChild(item);

        }
    );

}


// ================================================
// ESCAPE HTML
// ================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ================================================
// FILTER EVENTS
// ================================================

searchInput.addEventListener(
    "input",
    renderTransactions
);


filterCategory.addEventListener(
    "change",
    renderTransactions
);


filterType.addEventListener(
    "change",
    renderTransactions
);


// ================================================
// MAIN RENDER
// ================================================

function render() {

    calculateSummary();

    renderTransactions();

    renderCategorySummary();

}


// ================================================
// INITIAL LOAD
// ================================================

render();