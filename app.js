/****************************   Module pattern ****************************/

//Budget controller
// var budgetController is assigned the return value which is an object thus it becomes an object. You can access it using the .(dot) operator
var budgetController = (function() { 

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
        
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };    

    var calcTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function (cur){
            sum += cur.value;
            data.totals[type] = sum;
        });
        
    };    

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0 
        },
        budget: 0,
        percentage: -1 // non existant by default
    };

    return {
        addItem: function(type, desc, val){
            var newItem, id;

            //create new id
            //get the type array then the last item item in the array and lastly its id since its an object
            if (data.allItems[type].length > 0){
                id = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                id = 0;
            }

            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, val);
            }

            //push it into data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
                console.log(data.allItems[type]);
            }
        },        

        calcBudget: function(){
            // Calculate total income and expenses
            calcTotal('inc');
            calcTotal('exp');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calcPercentages: function(){
            /*
            a=20    a%=(20/x) * 100
            b=10    b%=(10/x) * 100
            c=20    c%=(20/x) * 100
            income = x
            */
           var totalInc = data.totals.inc;
           var expenses = data.allItems['exp'];
           expenses.forEach(function(current){
               current.calcPercentage(totalInc);
           });

        },

        getPercentages: function(){
             var allPercentages = data.allItems['exp'].map(function(current){
                return current.getPercentage();
             });
             return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();


//UI controller
var uiController = (function() {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        expPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        /**
         * + or - before a number
         * exactly 2 decimal points
         * comma separating thousands
         * 
         * 2310.4567 -> +2,310.46
         */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length -3, 3);
        }
        dec = numSplit[1];

        //ternary operator
        // type === 'exp' ? sign = '-' : sign = '+';
        
        // return type + ' ' + int + dec;

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback){
        for (var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            
            //inc for +
            //exp for -
             return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
             }
        },

        addListItem: function(obj, type, dom) {
            var html, newHtml, element;
            // 1. create html string with placeholder text
            if (type === 'inc') {
                element = dom.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = dom.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            

            // 3. insert html in dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;

            obj.budget > 0 ? type = 'inc' : type='exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0){
                document.querySelector(domStrings.expPercentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.expPercentageLabel).textContent = '---';
            }
        },

        // look at it again

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(domStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            month = now.getMonth();
            months = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sep', 'oct', 'nov', 'dec']
            month = months[month];
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = month + ', ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);

                nodeListForEach(fields, function(current){
                    current.classList.toggle('red-focus');
                });

                document.querySelector(domStrings.inputBtn).classList.toggle('red');

        },

        getDomStrings: function() {
            return domStrings;
        }
        
    }

})();

//Global app controller
// use params as placeholders for args so that args can change at any time
var controller = (function(budgetCtrl, uiCtrl) { 

    var dom = uiCtrl.getDomStrings();

    var setupEventListeners = function() {
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

        // enter click event happens on the global document
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which===13) {
                ctrlAddItem();
            }
        }); 

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
    };

    var updateBudget = function(){
        // 1. Calculate budget 
        budgetCtrl.calcBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the ui
        uiCtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calcPercentages();

        // 2. Read from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update ui with new percentages
        uiCtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){

        var input, newItem;
        // 1. Get field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to the ui
            uiCtrl.addListItem(newItem, input.type, dom);
            
            // 4. Clear fields
            uiCtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
        
    };

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId) {

            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, id);

            // 2. delete item from ui
            uiCtrl.deleteListItem(itemId);

            // 3. update and show new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function(){
            console.log('Application has started');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, uiController);

controller.init();
