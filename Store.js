//Dead simple state management / observable state store  for React, Angular, Vue or Javascript apps in general
//Just 1.2kb minified and 516 bytes minified + gz

function Store() {

    this.subscribe = function(callback, action){
        if(typeof callback !== "function"){
            return null;
        }
        
        this._subscriptions = this._subscriptions || {};
        this._callback_id = this._callback_id || 0;
        
        this._callback_id++;
        var callback_id = this._callback_id;
        
        if(typeof action === "string"){
        
            this._subscriptions[callback_id] = (function(state, currentAction) {
                if(currentAction === action){
                    return callback(state, currentAction);
                }
            });     
        
        }else{
            this._subscriptions[callback_id] = callback;
        }
        if(this._hasSomeState){
            callback(this._state, null);
        }

        return (function(store, callback_id){
            return (function() { 
                delete store._subscriptions[callback_id]; 
            }); 
        })(this, callback_id);
    }

    this.getState = function(){
        return this._state;
    }

    this.initial = function(state){
        this._state = state;
        this._hasSomeState = true;
        return state;
    }

    this.dispatch = function(state, action){
        this._state = state;
        this._hasSomeState = true;
        
        var values = Object.values(this._subscriptions);
        
        for(var i in values){
            var callback = values[i];

            try{
                callback(state, action);
            }catch(ex){
                console.error(ex);
            } 
        }
        return state;
    }

    this.connect = function(reactComponent, stateName){
        if(!reactComponent)
            return null;

        var store = this;
        var _componentWillMount = reactComponent.componentWillMount;
        var unsubscribe = function(){};
        reactComponent.componentWillMount = function(){
        
            unsubscribe = store.subscribe(function(state){
                if(typeof stateName === "string"){
                    var obj = {};
                    obj[stateName] = state;
                    reactComponent.setState(obj);
                }else{
                    reactComponent.setState(state);
                }
            })

            if(typeof _componentWillMount === "function"){ _componentWillMount.apply(this, arguments); }
        };

        var _componentWillUnmount = reactComponent.componentWillUnmount;

        reactComponent.componentWillUnmount = function(){

            unsubscribe();

            if(typeof _componentWillUnmount === "function"){ _componentWillUnmount.apply(this, arguments); }
        };
        return reactComponent;
    }
}

Store.create = function(props){

    var store = new Store();

    for(var i in props){
        if(typeof props[i] == "function"){
            store[i] = props[i].bind(store);
        }else{
            store[i] = props[i];
        }
    }

    if(store.state){
        store.initial(store.state);
    }
    
    return store;
}

module.exports = {
    "default": Store,
    Store: Store,
    createStore: Store.create
};

import Store from 'stateux';
//or
//import { Store } from 'stateux';

class TodoListStore extends Store{

    constructor(){

        this.counter = 0;
        this.state = {
            items: []
        };
        //set as initial state
        this.initial(this.state);

        /*
        //you can set directly too and use this.getState() to get the state object
        this.initial({
            items: []
        });
        let state = this.getState();
        */
    }

    add(text){
        let id = this.counter++;
        this.state.items.push({ id, text });

        this.dispatch(this.state);
        //you can pass a action name as parameter too
        //this.dispatch(this.state, "add_item");    
        
        //this.dispatch function returns the state passed as parameter
        //so you can use a simplified dispatch and return
        //return this.dispatch(this.state);
    }

    remove(id){
        this.state.items = this.state.items.filter((item)=> item.id != id);

        this.dispatch(this.state);
        //or
        //this.dispatch(this.state, "remove_item");        
    }
}

export default new TodoListStore();

/*
    Example using Store.create utility
    ** state field its used as initial state 
    ** all functions are binded to the store object
    ** you can also use import { createStore } from 'stateux';
*/
export default Store.create({
    counter: 0,

    state: {
        items: []
    },

    add(text){
        this.state.items.push({ id: ++this.counter, text });

        this.dispatch(this.state);        
    },

    remove(id){
        this.state.items = this.state.items.filter((item)=> item.id != id);

        this.dispatch(this.state);
    }
});

import TodoListStore from './TodoListStore';

class TodoList extends React.Component{
    
    componentWillMount(){

        //TodoListStore.subscribe returns the unsubscribe function
        this.unsubscribeTodoList = TodoListStore.subscribe((state) => this.setState(state));
        /*
        //you can filter actions if you need
        //action parameter will be null if its the initial state

        this.unsubscribeTodoList = TodoListStore.subscribe((state, action) => {
            if(action == "add_item" || action == null){
                this.setState(state);
            }
        });
        
        //or you can subscribe passing a action name too
        //in this case will be called only if the action with this name is dispatched or if its the initial state

        this.unsubscribeTodoList = TodoListStore.subscribe((state) => this.setState(state), "add_item");

        */
    }

    componentWillUnmount(){
        this.unsubscribeTodoList();
    }

    updateText(e){
        this.setState({ text : e.target.value });
    }
        
    render(){
        
        return (
            <div>
                {this.state.items.map((item)=> {
                    return (
                    <div key={item.id}
                          onClick={()=> TodoListStore.remove(item.id)}>
                          
                            {item.text}
                    </div>)
                })}

                <input type="text" defaultValue="" onChange={(e)=> this.updateText(e)}/>
                <button onClick={()=> TodoListStore.add(this.state.text)}>
                    Add
                </button>
            </div>
        )
    }
}

export default TodoList;

/*
    Example using connect utility
*/

import TodoListStore from './TodoListStore';


class TodoList extends React.Component{
    
    updateText(e){
        this.setState({ text : e.target.value });
    }
        
    render(){
        
        return (
            <div>
                {this.state.items.map((item)=> {
                    return (
                    <div key={item.id}
                          onClick={()=> TodoListStore.remove(item.id)}>
                          
                            {item.text}
                    </div>)
                })}

                <input type="text" defaultValue="" onChange={(e)=> this.updateText(e)}/>
                <button onClick={()=> TodoListStore.add(this.state.text)}>
                    Add
                </button>
            </div>
        )
    }
}

export default TodoListStore.connect(TodoList);

//you can pass a stateName too for limit the setState to a property
//export default TodoListStore.connect(TodoList, "todoList");
//and use this.state.todoList