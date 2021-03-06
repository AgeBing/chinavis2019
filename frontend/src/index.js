import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from "./App";
import Layout  from "./Layout";

import * as serviceWorker from "./serviceWorker";

import { Provider } from "react-redux";
import { createStore } from "redux";
import appReducer from "./reducers";

const store = createStore(appReducer);

store.subscribe(() => {
  //传入数据变化的监听事件
  console.log("---------------state change log------------");
  console.log(store.getState());
});

ReactDOM.render(
  <Provider store={store}>
    <Layout />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
