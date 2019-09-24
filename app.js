/****************************   Module pattern ****************************/

//Budget controller
// var budgetController is assigned the return value which is an object thus it becomes an object. You can access it using the .(dot) operator
var budgetController = (function() { 

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

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        }
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

        calcBudget: function(){
                   
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
        expensesContainer: '.expenses__list'
    }
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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = dom.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // 3. insert html in dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
    };

    var updateBudget = function(){
        // 1. Calculate budget 


        // 2. return the budget

        // 3. Display the budget on the ui
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
            
            // 4. clear fields
            uiCtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();
        }
        
    }

    return {
        init: function(){
            console.log('Application has started');
            setupEventListeners();
        }
    }
})(budgetController, uiController);

controller.init();
