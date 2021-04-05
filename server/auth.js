const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const Moment = require("moment");
const User = require("./models/User");
const { mergeCartAndUpdateTracking } = require("./helper/cart");
const dev = process.env.NODE_ENV !== "production";
const callbackDomain = dev
  ? process.env.ROOT_URL_TEST
  : process.env.ROOT_URL_LIVE;

//checked 2019-06-03 - recheck merge cart
async function handleLogin({ req, res }) {
  if (req.user) {
    let user = req.user;
    if (
      req.session.marketingIds &&
      req.session.marketingIds.length > 0 &&
      Moment.duration(Moment().diff(Moment(user.created_at))).minutes() < 5
    ) {
      await User.findByIdAndUpdate(user._id, {
        marketingIds: req.session.marketingIds
      });
    }
    user.mobile = user.mobile ? user.mobile.substring(0, 3) : "";
    req.session.user = user;

    await mergeCartAndUpdateTracking({ req });

    if (req.session.redirectUrl) {
      req.session.message[req.session.redirectUrl] = {
        message: "Welcome to Tinkerer!",
        type: "success"
      };
      res.redirect("/" + req.session.redirectUrl);
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
}

//checked 2019-06-03
function auth({ server }) {
  const verify = async (token, refreshToken, profile, done) => {
    let email = null;
    let authId = null;
    let name = null;
    let registerType = null;
    let image = null;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.id) {
      authId = profile.id;
    }

    if (profile.displayName) {
      name = profile.displayName;
    }

    if (profile.provider) {
      registerType = profile.provider;
    }

    if (profile.photos[0]) {
      image = profile.photos[0].value;
    }

    try {
      if (email && registerType && authId) {
        const user = await User.authSignInOrSignUp({
          email,
          name,
          authId,
          registerType,
          image
        });
        done(null, user);
      } else {
        done(null, null);
      }
    } catch (err) {
      done(err);
    }
  };

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  passport.use(
    new FacebookStrategy(
      {
        clientID: "1315792411878658",
        clientSecret: "5cac4abeca30d89a8762cbe143b5c3c9",
        callbackURL: callbackDomain + "/auth/facebook/callback",
        profileFields: ["id", "displayName", "email", "photos"]
      },
      verify
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "50106730360-9gf5klobpvu8ihsl2vp41oq9kjis33fk.apps.googleusercontent.com",
        clientSecret: "_wXwR0pSuWABXBYVszuG57NJ",
        callbackURL: callbackDomain + "/auth/google/callback"
      },
      verify
    )
  );

  server.use(passport.initialize());

  server.get("/auth/facebook", (req, res, next) => {
    if (req.query && req.query.redirectUrl) {
      req.session.redirectUrl = req.query.redirectUrl;
    }
    passport.authenticate("facebook", {
      scope: ["email"],
      authType: "rerequest"
    })(req, res, next);
  });

  server.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      failureRedirect: "/login"
    }),
    async (req, res) => {
      await handleLogin({ req, res });
    }
  );

  server.get("/auth/google", (req, res, next) => {
    if (req.query && req.query.redirectUrl) {
      req.session.redirectUrl = req.query.redirectUrl;
    }
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })(req, res, next);
  });

  server.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login"
    }),
    async (req, res) => {
      await handleLogin({ req, res });
    }
  );
}

module.exports = auth;
