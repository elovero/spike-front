import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";

// import redux and router deps
import { Provider } from "react-redux";
import store, { history } from "./store";

// import css
import "normalize.css";
import "./index.css";

// import components
import App from "./App";

Sentry.init({
  dsn: "https://a7b7f1b624b44a9ea537ec1069859393@sentry.io/1365884"
});

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    document.getElementById("root")
  );
};

render();
