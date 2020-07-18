let react_instance = null;
function Store() {

    this.subscribe = function (callback, action) {
        if (typeof callback !== "function") {
            return null;
        }

        this._subscriptions = this._subscriptions || {};
        this._callback_id = this._callback_id || 0;

        this._callback_id++;
        var callback_id = this._callback_id;

        if (typeof action === "string") {

            this._subscriptions[callback_id] = (function (state, currentAction) {
                if (currentAction === action || action === null) {
                    return callback(state, currentAction);
                }
            });

        } else {
            this._subscriptions[callback_id] = callback;
        }
        if (this._hasSomeState) {
            callback(this._state, null);
        }

        return (function (store, callback_id) {
            return (function () {
                delete store._subscriptions[callback_id];
            });
        })(this, callback_id);
    }

    this.getState = function () {
        return this._state;
    }

    this.initial = function (state) {
        this._state = state;
        this._hasSomeState = true;
        return state;
    }

    this.dispatch = function (state, action) {
        this._state = state;
        this._hasSomeState = true;

        var values = Object.values(this._subscriptions);

        for (var i in values) {
            var callback = values[i];

            try {
                callback(state, action);
            } catch (ex) {
                console.error(ex);
            }
        }
        return state;
    }
}

Store.create = function (props) {

    var store = new Store();

    for (var i in props) {
        if (typeof props[i] == "function") {
            store[i] = props[i].bind(store);
        } else {
            store[i] = props[i];
        }
    }

    if (store.state) {
        store.initial(store.state);
    }

    return store;
}

const useStore = (store, action) => {
    const { useState, useEffect } = react_instance || require('react');

    let [state, setState] = useState(store.getState());

    useEffect(() => {
        const unsubscribe = store.subscribe((value)=> {
            setState(()=> ({ ...value }));
        } , action);
        return () => {
            // Clean up the subscription
            unsubscribe();
        };
    }, [store]);

    return state;
}

function createStore(props){
    return Store.create(props);
}

function setReactInstance(react){
    react_instance = react;
}

module.exports = {
    'default': Store,
    Store,
    createStore,
    useStore,
    setReactInstance
}

// export default Store;
// export { Store, createStore, useStore };