var budgetController =(function(){
        
    var Incomes=function(id , description, value){
        this.id=id
        this.description=description
        this.value=value
    }
    var Expenses=function(id , description, value){
        this.id=id
        this.description=description
        this.value=value
        this.persentage=-1
    }
    Expenses.prototype.calcPersentage=function(totalincome){
        if(totalincome>0){
            this.persentage=Math.round((this.value/totalincome)*100)
        }
    }
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(curr => {
            sum+=curr.value
        });
        data.totlas[type]=sum
    }
    var data={
        allItems:{
            inc:[],
            exp:[]
        },
        totlas:{
            inc:0,
            exp:0
        },
        Budget:0 ,
        persentage:-1  // -1 meant doesn't exsist 
    }
return{
    addItem:function(type , des , val){
        var newItem,ID;
        if(data.allItems[type].length>0){
            ID=data.allItems[type][data.allItems[type].length-1].id+1
        }  else{ID=0}
        // create item 
        if(type=='exp'){
            newItem=new Expenses(ID,des,val)
        }else if(type=='inc'){
            newItem=new Incomes(ID,des,val)
        }
        // push item in my datastructue
        data.allItems[type].push(newItem)
        
        return newItem;
    },
    deleteItems:function(type , id){
        var ids , index
        ids=data.allItems[type].map((curr)=>{
            return curr.id
        }) 
        index=ids.indexOf(id)
        if(index!==-1){
            data.allItems[type].splice(index,1)
        }
    },
    calculateBudget:function(){
        // calculate total income and expences
        calculateTotal('exp')
        calculateTotal('inc')
        // calc the budget (inc - exp)
        data.Budget=(data.totlas.inc - data.totlas.exp)
        // calc the persentage of income that we spent
        if(data.totlas.inc>0){
            data.persentage = Math.round((data.totlas.exp / data.totlas.inc)*100) 
        }else{data.persentage = -1}
    },
    calculatePersentage:function(){
        data.allItems.exp.forEach((cur)=>{
            cur.calcPersentage(data.totlas.inc)
        })
    },
    getPersentage:function(){
        var allperc=data.allItems.exp.map((c)=>{return c.persentage})
        return allperc
    },
    getBudget:function(){
        return{
            budget:data.Budget , 
            totalInc:data.totlas.inc , 
            totalExp:data.totlas.exp ,
            persentage :data.persentage
        }
    },
    testing:function(){
        console.log(data)
    }
}
})()

// *** UI controller
var UIcontroller =(function(){
    var formatNumber=function(num,type){
        num=Math.abs(num)       
        num=num.toFixed(2)
        numSplit=num.split('.')
        
        int=numSplit[0]
        dec=numSplit[1]
        if(int.length>3){
            int=int.substr(0,int.length-3) +','+int.substr(int.length-3,3)// 24603 >> 24,603
        }
        return (type=='exp' ? '-':'+') + int + '.' + dec
    }
    //_____nice trick to loop over a list_____
            
    var nodelist=function(list,callback){
        for (let i = 0; i < list.length; i++) {
            callback(list[i],i)
        }
    }
    return {
        getInputs:function(){
            return{
                type:document.querySelector('.add__type').value ,
                description:document.querySelector('.add__description').value,
                value:parseFloat( document.querySelector('.add__value').value)
            }
        },
        // display elements to app .
        addListItem : function (obj , type){
            var html , newHTML , element;
            //  create html string
            if (type=='inc'){
                element='.income__list'
                html='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
            }else if(type=='exp') {
                element='.expenses__list'   
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } 
           // replace text with actual data\
            newHTML = html.replace('%id%' , obj.id)
            newHTML=newHTML.replace('%description%'  , obj.description)
            newHTML=newHTML.replace('%value%'  ,formatNumber(obj.value , type))
            // insert html into dom
            // ****************insertAdjacentElement**************** *
            document.querySelector(element).insertAdjacentHTML('beforeend' , newHTML)
        },
        deleteListItem:function(selsctedId){
            var elem= document.getElementById(selsctedId)
            elem.parentNode.removeChild(elem)

        },
        clearfields:function(){
            var fields , fieldArr
            fields= document.querySelectorAll('.add__value , .add__description')
            // converting list (fields) into an array(fieldArr) ; to loop over it 
           fieldArr = Array.prototype.slice.call(fields)
            fieldArr.forEach( (curr)=> {
                curr.value=''
                fieldArr[0].focus() 
            });   
        },
        displayBudget:function(obj){
            var type
            obj.budget>0 ? type='inc' :type='exp'
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget,type)
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc,'inc')
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp,'exp')
            if(obj.persentage>0){
                document.querySelector('.budget__expenses--percentage').textContent = obj.persentage +'%'
            }else{ document.querySelector('.budget__expenses--percentage').textContent = '-'  }          
        },
        displaypersentages : function(persentage){
            var fields=document.querySelectorAll('.item__percentage')
         
            nodelist(fields,function(currentElement,index){
                if(persentage[index]>0){
                    currentElement.textContent=persentage[index]+' %'
                }else{currentElement.textContent='--'}
            })
            // var mod=Array.prototype.slice.call(fields)
        },
        displayMonth:function(){
            var now ,month, year ,months
            now=new Date()
            months=['jan','february','marc','april']
            month=now.getMonth()
            year=now.getFullYear()
            document.querySelector('.budget__title--month').textContent=months[month]+' '+year
        
        },
        changeType:function(){
            var fields=document.querySelectorAll('.add__description, .add__value , .add__type ')
            nodelist(fields,function(curr){
                curr.classList.toggle('red-focus')
            })       
        document.querySelector('.add__btn').classList.toggle('red')    
        }
    }
})()

    // global app controller
    var controller=(function(bugetctrl,UIctrl){ 

        var setUpEventListeners=function(){
            document.querySelector('.add__btn').addEventListener('click',addItem)    
            document.addEventListener('keypress',function(event){
                if(event.keyCode==13){
                addItem()
                }
            })
            document.querySelector('.container').addEventListener('click',ctrlDeletItem)
            document.querySelector(".add__type").addEventListener('change' , UIctrl.changeType)
        }
        var updateBudget=function(){
            // calulate budget
            bugetctrl.calculateBudget();
            // return budget
            var budget = bugetctrl.getBudget()
            // display budget
            UIctrl.displayBudget(budget)
        }
        var updatePersentages=function(){
            // calc %
             bugetctrl.calculatePersentage()
            // read % from budget ctr
            var pers=bugetctrl.getPersentage()
            UIctrl.displaypersentages(pers)

        }
        var addItem=function(){
            var inputs ,newItem
            // get inputs
            inputs=UIctrl.getInputs()   
            if(inputs.value >0 && inputs.description!=='' && !isNaN(inputs.value)){
                // add iteam to rhe budget controller
                newItem= bugetctrl.addItem(inputs.type , inputs.description , inputs.value)
                // add the iteam to the UI
                UIctrl.addListItem(newItem , inputs.type)
                // cear fields
                UIctrl.clearfields()
                // calculate and update budget
                updateBudget( )

                updatePersentages()
//---------------------------------------------------------------------------------------\
//|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||>
// --------------------------------------------------------------------------------------/
            }
        }
        var ctrlDeletItem=function(event){
            var itemID , spliter, type , id 
            itemID=(event.target.parentNode.parentNode.parentNode.parentNode.id)
            if (itemID){
                spliter=itemID.split('-')
                type=spliter[0]
                id=parseInt( spliter[1])
                // delete item from data structue
                bugetctrl.deleteItems(type,id)
                // delete item from UI-
              UIctrl.deleteListItem(itemID)
                // update budget
                updateBudget( )       
                
                updatePersentages()
            }
        }
        return {
        init:function(){
                console.log('App started successfully')    
                UIctrl.displayMonth() 
                UIctrl.displayBudget({
                    budget:0 , 
                    totalInc:0 , 
                    totalExp:0 ,
                    persentage :0
                })       
                setUpEventListeners()          
            }
        }        
    })(budgetController,UIcontroller)
    controller.init()









    // controller.init() >>  setUpEventListeners() -gets events 
    // >> addItem() - get inputs from UIctrl.getInputs() then push it to ...
    // >>budgetController.addItem(type ,description ,value) << uses cosntructors to creat exp or inc
    // >>store it in data structure



    // incomecontainer :income__list'
    // expencescontainer :expenses__list'