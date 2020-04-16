
// *************** BUDGET CONTROLLER *************** //


var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };    

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };    
    
    // CUR means CURRENT VALUE
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };
    // des = description, val = value
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //CREATE NEW ID
            // We want to add 1 unit to the last item in a ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //NEW ITEM BASED ON INCOMES OR EXPENSES TYPE
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Expense(ID, des, val);
            }

            //PUSH IT INTO OUR DAATA STRUCTURE
            data.allItems[type].push(newItem);

            //RETURN TO A NEW ELEMENT
            return newItem;
            
        },

        calculateBudget: function() {

            // CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            // CALCULATE THE BUDGET: INCOME - EXPENSES
            data.budget = data.totals.inc - data.totals.exp;

            // CALCULATE THE PERCENTAGE OF THE INCOME THAT WE SPENT
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }



        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function() {
            console.log(data);
        }

    };
})();

// *************** UI CONTROLLER *************** //


var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
    };
    
    return {
        // It's going to be for INCOMES 'INC' or EXPENSES 'EXP'
        getinput: function() {
            return {
                
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            };                        
        },

        addListItem: function(obj, type) {
            var html, newHtml;
            // CREATE HTML STRING WITH PLACEHOLDER TEXT
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">$%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">$%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // INSEERT THE HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach( function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        }, 

        getDOMstrings: function() {
            return DOMstrings;
        },
    };
})();

// *************** GLOBAL APP CONTROLLER *********************//


var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
    });

    };
    
    var uptdateBudget = function() {

        // 1 CLEAR THE BUDGET
        budgetCtrl.calculateBudget();

        // 2. RETURN THE BUDGET
        var budget = budgetCtrl.getBudget();

        // 3. DISPLAY THE BUDGET ON THE UI
        UICtrl.displayBudget(budget);
    
    };

    var ctrlAddItem = function() {
        var input = UICtrl.getinput();

        // 1. GET THE FILED INPUT DATA
        input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. ADD THE ITEM TO THE BUDGET CONTROLLER
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. ADD THE ITEM TO THE UI
            UICtrl.addListItem(newItem, input.type);
            
            // 4. CALCULATE THE BUDGET
            UICtrl.clearFields();  

            // 5. CALCULATE AND UPDAATE BUDGET
            uptdateBudget();

        };
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    };    

})(budgetController, UIController);

controller.init();





