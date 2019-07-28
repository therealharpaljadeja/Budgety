var budgetController = (function() {

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage  = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else if (totalIncome === 0){
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum += cur.value
    });
    data.totals[type] = sum;
  }

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems : {
      exp : [],
      inc : []
    },
    totals: {
        exp : 0,
        inc : 0
    },
    budget : 0,
    percentage : -1
  };

  return {
    addItem : function(type, des, val){
        var newItem;
        //Create new ID
        if (data.allItems[type].length > 0) {
            id = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          id = 0;
        }
        //Create new object based on type
        if (type === 'exp') {
          newItem = new Expense(id, des, val);
        }else if (type === 'inc') {
          newItem = new Income(id, des, val);
        }
        //Add object to array based on type
        data.allItems[type].push(newItem);
        //return new object
        return newItem;
    },
    calculateBudget: function(){
      //Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      };

    },
    calculatePercentage: function(){
      data.allItems.exp.forEach(function(cur)
      {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function(){
        var allPercentages = data.allItems.exp.map(function(cur){
          return cur.getPercentage();
        });
        return allPercentages;
    },

    deleteItem: function(type,id){
      var ids,index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }
    },
    testing: function(){
      return data;
    },
    getBudget: function(){
      return {
        budget : data.budget,
        totalInc : data.totals.inc,
        totalExp : data.totals.exp,
        percentage : data.percentage
      }
    }
  }

})();


var UIController = (function() {

  var DOMstring = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel : '.budget__value',
    incomeLabel : '.budget__income--value',
    expenseLabel : '.budget__expenses--value',
    percentageLabel : '.budget__expenses--percentage',
    container: '.container',
    expensesPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function(num, type){
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ','+int.substr(int.length - 3, 3);
      }
      dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  }

  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length ; i++){
      callback(list[i],i);
    }
  };

  return {
    getInput: function(){

      return {
        type: document.querySelector(DOMstring.inputType).value, // inc = Income exp = Expense
        description : document.querySelector(DOMstring.inputDescription).value,
        value : parseFloat(document.querySelector(DOMstring.inputValue).value)
      }
    },
    addListItem: function(obj,type){

      //Create HTML String with placeholder text
      var html, element;
      if (type === 'inc') {
        element = DOMstring.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstring.expenseContainer;
        html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace the placeholder text with some actual Data
      newHTML = html.replace('%id%',obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value,type));
      // Insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },
    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID)
      el.parentNode.removeChild(el);
    },
    clearFields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      fieldsArr[0].focus();
      });
    },
    displayBudget: function(obj){
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');


      if(obj.percentage > 0){
          document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
      }
      else{
        document.querySelector(DOMstring.percentageLabel).textContent = '---';
      }

    },
    displayPercentage: function(percentages){
      var fields = document.querySelectorAll(DOMstring.expensesPercentage);

      nodeListForEach(fields, function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index]  + '%';
        }
        else {
          current.textContent = '---';
        }
      });
    },
    displayMonth: function(){
      var now, year;
      var now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;

    },
    changeType: function(){
      var fields = document.querySelectorAll(
        DOMstring.inputType + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue
      );
      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMstring.inputBtn).classList.toggle('red');
    },
    getDOMstrings: function(){
      return DOMstring;
    }
  };

})();

var controller = (function(budgetCtrl, UICtrl){
  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13){
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  var updateBudget = function(){
    // 1. Calculate budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    console.log(budget);
    UICtrl.displayBudget(budget);

  };

  var updatePercentages = function(){

    // 1. Calculate Percentage
    budgetCtrl.calculatePercentage();
    // 2. Read the percentage from the budget budgetController
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentage(percentages);
  };

  var ctrlAddItem = function() {
    // 1. Get Input Data
    var newItem;
    var input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2. Add the item to the budget budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear fields
      UICtrl.clearFields();
      updateBudget();

      // 5. Calculate and update percentages
      updatePercentages();

    };


  };
  var ctrlDeleteItem = function(event){
    var splitID;
    var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      type = itemID.split('-')[0];
      id = parseInt(itemID.split('-')[1]);

      //1. delete the item from the data structure
      budgetCtrl.deleteItem(type,id);
      //2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      //3. Update and show the new budget
      updateBudget();
    }

  };

  return{
    init : function(){
      UICtrl.getDOMstrings().inputType.value = 'inc';
      var budget = budgetCtrl.getBudget();
      UICtrl.displayBudget(budget);
      setupEventListeners();
      UICtrl.displayMonth();
    }
  };

})(budgetController, UIController);

controller.init();
