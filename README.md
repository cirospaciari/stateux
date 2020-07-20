[![npm package](https://nodei.co/npm/stateux.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stateux/)

[![NPM version](https://img.shields.io/npm/v/stateux.svg)](https://img.shields.io/npm/v/stateux.svg)
[![NPM License](https://img.shields.io/npm/l/stateux.svg)](https://img.shields.io/npm/l/stateux.svg)
[![NPM Downloads](https://img.shields.io/npm/dm/stateux.svg?maxAge=43200)](https://img.shields.io/npm/dm/stateux.svg?maxAge=43200)

Support me for future versions:

[![BMC](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/i2yBGw7)

[![PAGSEGURO](https://stc.pagseguro.uol.com.br/public/img/botoes/doacoes/209x48-doar-assina.gif)](https://pag.ae/7VxyJphKt)

# stateux
Really simple Redux like lib without reducers for state control


```javascript

/*
    Example using createStore utility
    ** state field its used as initial state 
    ** all functions are binded to the store object
    ** you can also use Store.create
*/
import { createStore } from 'stateux';

export default createStore({
    counter: 0,

    //initialState
    state: {
        items: []
    },

    add(text){
        this.state.items.push({ id: ++this.counter, text });

        //the second parameter its the action name
        //its optional but can be usefull to subscribe ONLY to this action update if you want
        this.dispatch(this.state, 'add');   
        //this.dispatch function returns the state passed as parameter
        //so you can use a simplified dispatch and return
        //return this.dispatch(this.state);     
    },

    remove(id){
        this.state.items = this.state.items.filter((item)=> item.id != id);

        this.dispatch(this.state, 'remove');
    }
});

/*
    Example using useStore utility
*/
import { setState } from 'react';
import { useStore } from 'stateux';

function TodoList(){


    const todoList = useStore(TodoListStore);
    //you can also subscribe only to an action like add or remove
    //const todoList = useStore(TodoListStore, 'add');

    const [state, setState] = useState({text: ''});

    return (
            <div>
                {todoList.items.map((item)=> {
                    return (
                    <div key={item.id}
                          onClick={()=> TodoListStore.remove(item.id)}>
                          
                            {item.text}
                    </div>)
                })}

                <input type="text" defaultValue="" onChange={(e)=> setState({ text : e.target.value })}/>
                <button onClick={()=> TodoListStore.add(state.text)}>
                    Add
                </button>
            </div>
        )
    }
}

/*
    Example using subscribe and unsubscribe + useEffect utility
*/
import { setState } from 'react';

function TodoList(){
    
    //you can also subscribe only to an action like add or remove
    //const todoList = useStore(TodoListStore, 'add');

    const [state, setState] = useState({text: ''});

    //more about useEffect: https://reactjs.org/docs/hooks-reference.html#cleaning-up-an-effect
    useEffect(()=> {
        //if its a initialState, some previous state set or a update the callback will be called
        //subscribe function returns the unsubscribe function
        return TodoListStore.subscribe((storeState, action)=>{
            //action name will be null if its the initialState
            //you can check the action name if you want ex: action === 'add' || action === null
            //merge the states or replace if you want
            setState({ ...state, ...storeState}); 
        });

        //you can subscribe only to an action updates if you want 
        //const unsubscribe = TodoListStore.subscribe(callback, actionName)
        
    }, [TodoListStore])

    return (
            <div>
                {todoList.items.map((item)=> {
                    return (
                    <div key={item.id}
                          onClick={()=> TodoListStore.remove(item.id)}>
                          
                            {item.text}
                    </div>)
                })}

                <input type="text" defaultValue="" onChange={(e)=> setState({ text : e.target.value })}/>
                <button onClick={()=> TodoListStore.add(state.text)}>
                    Add
                </button>
            </div>
        )
    }
}

/*

 Using class to create a Store
 
 */ 

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
        this.state.items.push({ id: ++this.counter, text });

        //the second parameter its the action name
        //its optional but can be usefull to subscribe ONLY to this action update if you want
        this.dispatch(this.state, 'add');   
        //this.dispatch function returns the state passed as parameter
        //so you can use a simplified dispatch and return
        //return this.dispatch(this.state);   ;
    }

    remove(id){
        this.state.items = this.state.items.filter((item)=> item.id != id);

        this.dispatch(this.state, 'remove');    
    }
}

export default new TodoListStore();

/*
 Using class components
*/


import TodoListStore from './TodoListStore';

class TodoList extends React.Component{
    
    constructor(props, context){
        super(props, context);

        //TodoListStore.subscribe returns the unsubscribe function
        this.unsubscribeTodoList = TodoListStore.subscribe((state) => this.setState(state));
        /*
        //you can filter actions if you need
        //action parameter will be null if its the initial state

        this.unsubscribeTodoList = TodoListStore.subscribe((state, action) => {
            if(action === "add" || action === null){
                this.setState(state);
            }
        });
        
        //or you can subscribe passing a action name too
        //in this case will be called only if the action with this name is dispatched or if its the initial state

        this.unsubscribeTodoList = TodoListStore.subscribe((state) => this.setState(state), "add");

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

```
