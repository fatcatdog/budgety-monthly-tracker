
// Function constructor for expense.
function Expense(id, description, value, paymentStatus) {
    this.id = id; // For deleting items
    this.description = description;
    this.value = value;
    this.paymentStatus = paymentStatus;
    this.percentage = -1;
}

Expense.prototype = {
    calculatePercentage: function(total) {
        if(total > 0) {
            this.percentage = Math.round(this.value / total * 100);
        } else {
            this.percentage = '--';
        }
        
        return this.percentage;
    }
}


// Function constructor for income
function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
}





// Function returns object with all of item-attributes (for incomes and expenses) 
function expenseController() { 
    
    return {
        allItems: [],
        total: 0,

        addItem: function(Constructor, des, val, paymentStatus) {
            var newID, newItem;
            
            // This logic makes next id which is added to list = last.id +1
            if (this.allItems.length > 0) {
                newID = this.allItems[this.allItems.length - 1].id + 1;
            } else {
                newID = 0;
            }
            
            // Notice this will be used by incomes and expenses because JS wont cause error if additional inputs are added
            newItem = new Constructor(newID, des, val, paymentStatus);
            this.allItems.push(newItem);
            return newItem;
        },
       
        deleteItem: function(id) {
            
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
            var ids = this.allItems.map(function(current, index) {
                return current.id;
            })

            var index = ids.indexOf(id);

            if(index >= 0) {
                this.allItems.splice(index, 1);
            }
        },

        calculateTotal: function() {
            var sum = 0;
            this.allItems.forEach(function(current) {
                sum += current.value;
            });
            this.total = sum;
        },

        getTotal: function() {
            return this.total;
        },
        
        calculatePercentages: function(totalIncome) {
            this.allItems.forEach(function(current) {
                current.percentage = current.calculatePercentage(totalIncome);
            });
        },
        
        getPercentages: function() {
            var all = [];
            this.allItems.map(function(current) {
                all.push(current.percentage);
            });
            return all;
        }
    };
}




// Function that returns income attributes. expenseController will be also be used for incomes
function incomeController() {
    
    return {
        allItems: [],
        total: 0
    };
} 





// Function returns an object containing properties and methods for manipulating UI
function UIController() {
    
    return {
        DOMSelectors: {}, 
        
        setDOMSelectors: function(DOM) {
            this.DOMSelectors = DOM;
        },
        
        displayMonth: function() {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var month = new Date().getMonth();
            
            document.querySelector(this.DOMSelectors.monthLabel).textContent = months[month];
        },
        
        getInput: function() {
            return {
                type: document.querySelector(this.DOMSelectors.inputType).value,
                description: document.querySelector(this.DOMSelectors.inputDescription).value,
                value: parseFloat(document.querySelector(this.DOMSelectors.inputValue).value),
                paymentStatus: document.querySelector(this.DOMSelectors.inputPaymentSatus).value
            };
        },
        
        clearFields: function() {
            // Just for showing sake: selecting many at once, convert to array using call and Array prototype (because it returns a list) and then iterate over that array with .forEach
            var fields = document.querySelectorAll(
                this.DOMSelectors.inputDescription + ', ' + this.DOMSelectors.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
            fieldsArr.forEach(function(current) {
                current.value = "";
            })
            
            fields[0].focus();
        },
        
        addListItem: function(obj, type) {
            var el, html;
            if (type === "expense") {
                el = this.DOMSelectors.expensesContainer;
                html = 
                    '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                html = html.replace('%percentage%', obj.percentage);
            } else {
                el = this.DOMSelectors.incomeContainer;
                html = 
                    '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', this.formatNumber(obj.value, type));
            
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
            document.querySelector(el).insertAdjacentHTML('beforeend', html);
            
            // Add unpaid class
            if(obj.paymentStatus === 'unpaid') {
                document.querySelector('#' + type + '-' + obj.id).classList.add('unpaid')
            }
        },

        deleteListItem: function(selectorID) {
            // To delete item, we go to parent of child, and then delete child 
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },

        displayTotals: function(budget, incomeTotal, expensesTotal, percentage) {
            var type;
            budget >= 0 ? type = 'income' : type = 'expense';
            
            document.querySelector(this.DOMSelectors.budgetLabel).textContent = this.formatNumber(budget, type);
            document.querySelector(this.DOMSelectors.incomeLabel).textContent = this.formatNumber(incomeTotal, 'income');
            document.querySelector(this.DOMSelectors.expensesLabel).textContent = this.formatNumber(expensesTotal, 'expense');
            document.querySelector(this.DOMSelectors.expensesPercLabel).textContent = percentage + '%';
        },
        
        displayExpensePercentages: function(percentages) {
            
            var fields = document.querySelectorAll(this.DOMSelectors.expensesPercentages);
            
            for (var i = 0; i < fields.length; i++) {
                fields[i].textContent = percentages[i] + '%';
            }
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                this.DOMSelectors.inputType + ', ' +
                this.DOMSelectors.inputDescription + ', ' +
                this.DOMSelectors.inputValue + ', ' + 
                this.DOMSelectors.inputPaymentSatus);
            
            for (var i = 0; i < fields.length; i++) {
                fields[i].classList.toggle('red-focus');
            }
            
            document.querySelector(this.DOMSelectors.inputPaymentSatus).classList.toggle('hidden');
            document.querySelector(this.DOMSelectors.inputBtn).classList.toggle('red');
        },
        
        formatNumber: function(num, type) {
            // We need: a) + or - in front of number, b) exactly 2 decimal points, c) comma separating thousands
            
            var sign, numSplit, int, intL, decimal;
            num = Math.abs(num);
            num = num.toString();
            numSplit = num.split('.');
            
            // Integer part
            int = numSplit[0];
            intL = int.length;
            if (intL > 3) {
                int = int.substr(0, intL - 3) + ',' + int.substr(intL - 3, intL);
            }
            
            // Decimal part
            numSplit.length === 2 ? decimal = numSplit[1] : decimal = '00';
            if (decimal.length > 2) {
                decimal = decimal.substr(0,2);
            } else if (decimal.length === 1) {
                decimal = decimal + '0';
            }
            
            // Sign
            type === 'expense' ? sign = '-' : sign = '+';
            
            // Output
            return sign + ' ' + int + '.' + decimal;
        }
    };
}





// Controller 
function controller(incCtrl, expCtrl, UICtrl, Inc, Exp) {
    return {
        DOMSelectors: {
            monthLabel:          '.budget__title--month',
            budgetLabel:         '.budget__value',
            incomeLabel:         '.budget__income--value',
            expensesLabel:       '.budget__expenses--value',
            expensesPercLabel:   '.budget__expenses--percentage',
            inputType:           '.add__type',
            inputDescription:    '.add__description',
            inputValue:          '.add__value',
            inputPaymentSatus:   '.add__payment-status',
            inputBtn:            '.add__btn',
            container:           '.container',
            incomeContainer:     '.income__list',
            expensesContainer:   '.expenses__list',
            expensesPercentages: '.item__percentage',
            deleteBtn:           '.item__delete'
        },

        init: function() {
            this.handleType();
            this.handleInputBtn();
            this.handleInputPressEnter()
            this.handleDelete();
            UICtrl.setDOMSelectors(this.DOMSelectors);
            UICtrl.displayMonth();
            UICtrl.displayTotals(0, 0, 0, '--');
        },
        
        handleType: function() {
            document.querySelector(this.DOMSelectors.inputType).addEventListener('change', function() {
                UICtrl.changedType()
            });
        },
        
        handleInputBtn: function() {
            var newItem, self = this;
            document.querySelector(this.DOMSelectors.inputBtn).addEventListener('click', function() {
                // 1. Get field input data
                var input = UICtrl.getInput();
                
                if (input.description !== "" && input.value !== "" && self.isNumeric(input.value)) {
                    
                    // 2. Add item to corresponding object controller
                    if (input.type === "expense") {
                        newItem = expCtrl.addItem(Exp, input.description, input.value, input.paymentStatus);
                        
                    } else if (input.type === "income") {
                        // Method borrowing, be setting the 'this' var to the object that want to borrow the method. We will simply not pass the payment status, which will then be set as undefined, and ignored by the function constructor.
                        newItem = expCtrl.addItem.call(incCtrl, Inc, input.description, input.value)
                    }
                    
                    // 3. Add the new item to the UI
                    UICtrl.addListItem(newItem, input.type);
                    
                    // 4. Update and show the new totals
                    self.updateTotals();
                    
                    // 5. Update and show all expense percentages
                    self.updateExpensePercentages();
                    
                    // 6. Clear the fields
                    UICtrl.clearFields();
                }
            });
        },
        
        handleInputPressEnter: function() {
            // save the this value in a variable to prevent JS from pulling from global object 
            var self = this; 
            document.addEventListener('keypress', function(event) {
                if (event.which === 13 || event.keyCode === 13) {
                    document.querySelector(self.DOMSelectors.inputBtn).click();
                }
            });
        },  
        
        handleDelete: function() {
            var newItem, self = this;
            document.querySelector(this.DOMSelectors.container).addEventListener('click', function(event) {
                var clickID, splitID, type, id
                clickID = event.target.parentNode.parentNode.parentNode.parentNode.id;
                
                if (clickID) {
                    splitID = clickID.split('-');
                    type = splitID[0];
                    id = parseInt(splitID[1]);
                    
                    // Delete item from model
                    if (type === 'expense') {
                        expCtrl.deleteItem(id);
                    } else {
                        expCtrl.deleteItem.call(incCtrl, id);
                    }
                    
                    // Delete item from UI
                    UICtrl.deleteListItem(clickID);
                    
                    // Update and show the new totals
                    self.updateTotals();
                    
                    // Update and show all expense percentages
                    self.updateExpensePercentages();
                }
            });
        },
        
        updateTotals: function() {
            // Calculate incomes and expenses and call the function to update the UI
            expCtrl.calculateTotal();
            expCtrl.calculateTotal.call(incCtrl);
            budget = this.calculateBudget();
            
            UICtrl.displayTotals(budget.budget, expCtrl.getTotal.call(incCtrl), expCtrl.getTotal(), budget.percentage);
        },
        
        calculateBudget: function() {
            var budget, percentage;
            
            budget = expCtrl.getTotal.call(incCtrl) - expCtrl.getTotal();
            
            if(expCtrl.getTotal.call(incCtrl) > 0) {
                percentage = Math.round(expCtrl.getTotal() / expCtrl.getTotal.call(incCtrl) * 100);
            } else {
                percentage = '--';
            }

            return {
                budget: budget,
                percentage: percentage
            };
        },
        
        updateExpensePercentages: function() {
            // Percentages of each income, pass the total income, then retreieve these percentages, and push to UI
            expCtrl.calculatePercentages(expCtrl.getTotal.call(incCtrl));
            var perc = expCtrl.getPercentages();
            UICtrl.displayExpensePercentages(perc);
        },
        
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    };
}



var exp = expenseController(Expense);
var inc = incomeController(Income);
var UI = UIController();
var ctrl = controller(inc, exp, UI, Income, Expense);

ctrl.init()


