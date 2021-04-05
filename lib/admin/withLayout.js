import React from "react";
import PropTypes from "prop-types";
import Header from "../../components/admin/static/Header";
import Menu from "../../components/admin/static/Menu";
import TopMenu from "../../components/admin/static/TopMenu";
import Footer from "../../components/admin/static/Footer";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

function withLayout(BaseComponent) {
  class App extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext;
    }
    render() {
      const options = {
        position: "top center",
        timeout: 0,
        offset: "30px",
        transition: "fade"
      };
      return (
        <div>
          <AlertProvider template={AlertTemplate} {...options}>
            <Header {...this.props} />
            <div className="layout-navbar-fixed layout-fixed default-style">
              <div className="layout-wrapper layout-2">
                <div className="layout-inner">
                  <Menu {...this.props} />
                  <div className="layout-container">
                    <TopMenu {...this.props} />
                    <BaseComponent {...this.props} />
                    <Footer />
                  </div>
                </div>
              </div>
            </div>
          </AlertProvider>
        </div>
      );
    }
  }

  App.propTypes = {
    pageContext: PropTypes.object
  };

  App.defaultProps = {
    pageContext: null
  };

  App.getInitialProps = ctx => {
    if (BaseComponent.getInitialProps) {
      return BaseComponent.getInitialProps(ctx);
    }

    return {};
  };

  return App;
}

export default withLayout;
