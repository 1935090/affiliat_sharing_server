import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import "@babel/polyfill/noConflict";
import { resetIdCounter } from "react-tabs";

let globalUser = null;
//let globalMenu = null;

function withAuth(BaseComponent, { loginRequired = true, userGroup = 0 } = {}) {
  class App extends React.Component {
    static propTypes = {
      isFromServer: PropTypes.bool.isRequired
    };

    static defaultProps = {
      admin: null
      //,menu: null
    };

    static async getInitialProps(ctx) {
      resetIdCounter();
      const isFromServer = !!ctx.req;
      const admin = ctx.req ? ctx.req.session.admin : globalUser;
      //const menu = ctx.req ? ctx.req.menu : globalMenu;

      if (isFromServer && admin) {
        // Convert "_id"(ObjectID from MongoDB) object to string
        admin._id = admin._id.toString();
      }

      const props = { admin, isFromServer };

      // Call child component's "getInitialProps", if it is defined
      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      if (this.props.isFromServer) {
        globalUser = this.props.admin;
        //globalMenu = this.props.menu;
      }

      // If login is required and not logged in, redirect to "/login" page
      if (loginRequired && !this.props.admin) {
        /*const HOMEPAGE = {
          "1": "/login",
          "2": "/parent/home",
          "3": "/teacher/home",
          "4": "/headteacher/home"
        };*/
        Router.push("/admin/signin");
        //Router.push(HOMEPAGE[userGroup]);
        return;
      }

      if (userGroup !== 0 && userGroup != this.props.admin.userGroup) {
        Router.push("/404");
        return;
      }

      // If logout is required and user logged in, redirect to "/" page
      if (loginRequired && this.props.admin) {
        //Router.push("/test");
      }
    }

    render() {
      if (
        (loginRequired && !this.props.admin) ||
        (userGroup !== 0 && userGroup != this.props.admin.userGroup)
      ) {
        return null;
      }
      return <BaseComponent {...this.props} />;
    }
  }

  return App;
}

export default withAuth;
