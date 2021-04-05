import React from "react";
import PropTypes from "prop-types";
import Header from "../../components/steam/static/Header";
import Menu from "../../components/steam/static/Menu";
import ContactIcons from "../../components/steam/static/ContactIcons";
import Footer from "../../components/steam/static/Footer";
//import { Provider as AlertProvider } from "react-alert";
//import AlertTemplate from "react-alert-template-basic";
import Router from "next/router";
import NProgress from "nprogress";
import { trackBehavior } from "../../lib/api/steam";
import ReactGa from "react-ga";
import { Provider as TranslationProvider } from "react-translated";
import translation from "./i18n/trans";
import ReactPixel from "react-facebook-pixel";
import ReactPixelAds from "react-facebook-pixel";
import { hotjar } from "react-hotjar";

Router.events.on("routeChangeStart", url => {
  NProgress.start();
});

Router.events.on("routeChangeComplete", url => {
  NProgress.done();
  $(".modal-backdrop").remove();
  $("body")
    .removeClass("modal-open")
    .removeAttr("style");
  window.scrollTo(0, 0);
});

Router.events.on("routeChangeError", url => {
  NProgress.done();
});

function withLayout(BaseComponent) {
  class App extends React.Component {
    _gaInit = false;
    _fbInit = false;
    _hjInit = false;

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext;
      this.state = {
        isCheckout: false,
        locale: "en"
      };
    }

    componentDidMount() {
      const dev = process.env.NODE_ENV !== "production";
      if (!dev) {
        //live tracking
        if (!this._gaInit) {
          ReactGa.initialize("UA-144025535-1");
          this._gaInit = true;
        }
        ReactGa.pageview(Router.asPath);

        if (!this._fbInit) {
          ReactPixel.init("2423662111235811");
          ReactPixelAds.init("1171180266402725");
          this._fbInit = true;
        }
        ReactPixel.pageView();
        ReactPixelAds.pageView();

        if (!this._hjInit) {
          hotjar.initialize(1495139, 6);
        }
      } else {
        //dev tracking
        if (!this._gaInit) {
          ReactGa.initialize("UA-144025535-2");
          this._gaInit = true;
        }
        ReactGa.pageview(Router.asPath);

        if (!this._fbInit) {
          ReactPixel.init("423247071634613");
          this._fbInit = true;
        }
        ReactPixel.pageView();

        if (!this._hjInit) {
          hotjar.initialize(1495151, 6);
        }
      }

      const event = {
        action: "page view",
        page: Router.asPath
      };
      trackBehavior({ event });
      if (Router.route == "/steam/checkout") {
        this.setState({ isCheckout: true });
      }
    }

    setLocale = ({ locale }) => {
      if (locale == "en") {
        this.setState({ locale });
      } else if (locale == "zh") {
        this.setState({ locale });
      }
    };

    render() {
      const options = {
        position: "top center",
        timeout: 3000,
        offset: "30px",
        transition: "fade"
      };

      return (
        <div>
          {/*<AlertProvider template={AlertTemplate} {...options}>
            <Header {...this.props} />
            {this.state.isCheckout == false && <Menu {...this.props} />}
            <BaseComponent {...this.props} />
            {this.state.isCheckout == false && <Footer {...this.props} />}
      </AlertProvider>*/}
          <TranslationProvider
            translation={translation}
            language={this.state.locale}
          >
            <Header {...this.props} />
            {this.state.isCheckout == false && (
              <Menu {...this.props} setLocale={this.setLocale} />
            )}
            <ContactIcons />
            <BaseComponent {...this.props} />
            {this.state.isCheckout == false && <Footer {...this.props} />}
          </TranslationProvider>
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
