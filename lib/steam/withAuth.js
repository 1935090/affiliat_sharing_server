import React from "react";
//import PropTypes from "prop-types";
import Router from "next/router";
import "@babel/polyfill/noConflict";
import { resetIdCounter } from "react-tabs";

let globalUser = null;
let globalCurrency = null;
let globalAllCurrency = null;
//let globalMenu = null;

function withAuth(BaseComponent, { loginRequired = true, userGroup = 1 } = {}) {
  class App extends React.Component {
    /*static propTypes = {
      isFromServer: PropTypes.bool.isRequired
    };*/

    /*static defaultProps = {
      user: null,
      currency: {
        iso: "HKD",
        multiplier: 1
      }
    };*/

    static async getInitialProps(ctx) {
      resetIdCounter();
      const isFromServer = !!ctx.req;
      let user = ctx.req && ctx.req.session ? ctx.req.session.user : globalUser;
      if (user) {
        delete user.password;
      }
      let currency =
        ctx.req && ctx.req.session && ctx.req.session.currency
          ? ctx.req.session.currency
          : globalCurrency;
      if (!currency) {
        currency = {
          iso: "HKD",
          multiplier: 1,
        };
      }
      const allCurrency =
        ctx.req && ctx.req.session && ctx.req.session.allCurrency
          ? ctx.req.session.allCurrency
          : globalAllCurrency;
      /*const currency = {
        iso: "HKD",
        multiplier: 1
      };*/
      //const menu = ctx.req ? ctx.req.menu : globalMenu;

      if (isFromServer && user) {
        // Convert "_id"(ObjectID from MongoDB) object to string
        user._id = user._id.toString();
      }

      const props = { user, isFromServer, currency, allCurrency };

      // Call child component's "getInitialProps", if it is defined
      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      if (this.props.isFromServer) {
        globalUser = this.props.user;
        globalCurrency = this.props.currency;
        globalAllCurrency = this.props.allCurrency;
        //globalMenu = this.props.menu;
      }

      // If login is required and not logged in, redirect to "/login" page
      if (loginRequired && !this.props.user) {
        /*const HOMEPAGE = {
          "1": "/login",
          "2": "/parent/home",
          "3": "/teacher/home",
          "4": "/headteacher/home"
        };*/
        Router.push("/login");
        //Router.push(HOMEPAGE[userGroup]);
        return;
      }

      if (userGroup != 1 && userGroup != this.props.user.userGroup) {
        Router.push("/404");
        return;
      }

      // If logout is required and user logged in, redirect to "/" page
      if (loginRequired && this.props.user) {
        //Router.push("/test");
      }
    }

    render() {
      if (
        (loginRequired && !this.props.user) ||
        (userGroup != 1 && userGroup != this.props.user.userGroup)
      ) {
        return null;
      }
      return <BaseComponent {...this.props} />;
    }
  }

  return App;
}

export default withAuth;
