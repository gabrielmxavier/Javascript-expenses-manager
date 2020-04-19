
// *************** BUDGET CONTROLLER *************** //


var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };  

    Expense.prototype.calcPercentage = function(toltalIncome) {

        if (toltalIncome > 0) {
            this.percentage = Math.round((this.value / toltalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

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

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

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

        calculatePercentages: function() {
            // CUR means Current
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        container:'.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    // IT'S GOING TO SHOW + AND - BEFORE THE NUMBERS AND ALSO POINTS AND COMMA
    var formatNumber = function(number, type) {

        var numberSplit, int, decimal, type;

        number = Math.abs(number);
        number = number.toFixed(2);

        numberSplit = number.split('.');

        int = numberSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + '.' + int.substr(int.length - 3, 3); 
        }

        decimal = numberSplit[1];

        return (type === 'exp' ? '- $' : '+ $') + ' ' + int + ',' + decimal;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // INSEERT THE HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            
            // el = element
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

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

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        }, 

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayMonth: function() {
            var now, day, months, month, year;
            var now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            //dates = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th', '21st', '22nd', '23rd', '24th', '25th', '26th', '27th', '28th', '29th', '30th', '31st', '32nd'];

            month = now.getMonth();
            day = now.getDate();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            //document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + dates[day] + ''+ ', ' + year;

        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType, + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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
            }
    });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };
    
    var uptdateBudget = function() {

        // 1 CLEAR THE BUDGET
        budgetCtrl.calculateBudget();

        // 2. RETURN THE BUDGET
        var budget = budgetCtrl.getBudget();

        // 3. DISPLAY THE BUDGET ON THE UI
        UICtrl.displayBudget(budget);
    
    };

    var updatePercentages = function() {

        // 1. CALCULATE PERCENTAGE
        budgetCtrl.calculatePercentages();       

        // 2. READ PERCENTAGES FROM THE BUDGET CONTROLLER
        var percentages = budgetCtrl.getPercentages();

        // 3. UPDATE THE UI WITH THE NEW PERCENTAGES
        UICtrl.displayPercentages(percentages);

    }

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

            // 6. PERCENTAGES UPDATING AND CALCULATION
            updatePercentages();

        };
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
 
        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. DELETE A ITEM FROM THE DATA STRUCTURE
            budgetCtrl.deleteItem(type, ID);

            // 2. DELETE A ITEM FROM UI 
            UICtrl.deleteListItem(itemID);

            // 3. UPDATE AND SHOW THE BUDGET UPDATED
            uptdateBudget();

            // 4. PERCENTAGES UPDATING AND CALCULATION
            updatePercentages();

        }

    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
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





