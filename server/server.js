const mongoSessionStore = require("connect-mongo");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const next = require("next");
const session = require("express-session");
const bodyParser = require("body-parser");
const api = require("./api");
//const auth = require("./auth");
//const endPoint = require("./endPoint");
//const FileStore = require("session-file-store")(session);
dotenv.config();
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
//const handle = app.getRequestHandler();
//const https = require("https");
//const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");

//ssl .well-known
//var serveIndex = require("serve-index");

const MONGO_URL = dev ? process.env.MONGO_URL_LIVE : process.env.MONGO_URL_LIVE;
//const ROOT_URL = dev ? process.env.ROOT_URL_TEST : process.env.ROOT_URL_LIVE;

mongoose.set("useFindAndModify", false);
mongoose
  .connect(MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log(`DB Connected!`))
  .catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
  });

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(express.static("public"));
    const MongoStore = mongoSessionStore(session);
    const sess = {
      name: "sealtech_steam",
      secret: "g45#&O*(&tre9FDWE33(*_",
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60, // save session 14 days
      }),
      /*store: new FileStore({
        ttl: 999 * 24 * 60 * 60, // save session 14 days
        logFn: function() {}
      }),*/
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 730 * 24 * 60 * 60 * 1000,
      },
    };

    server.set("trust proxy", true);
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());
    server.use(bodyParser.text());
    //server.use(bodyParser.raw({ type: "*/*" }));
    server.use(session(sess));
    server.use(compression());
    server.use(helmet());
    server.use(cors());

    /*const corsOptions = {
      origin: ["*"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Methods",
        "Access-Control-Request-Headers"
      ],
      credentials: true,
      enablePreflight: true
    };
    server.use(cors(corsOptions));
    server.options("*", cors(corsOptions));*/

    //endPoint({ server, app });
    //auth({ server });
    api({ server });

    /*server.get("*", (req, res) => {
      const url = URL_MAP[req.path];
      if (url) {
      } else {
      }
    });*/

    /*https
      .createServer(
        {
          ca: fs.readFileSync("server/ssl/ca_bundle.crt"),
          key: fs.readFileSync("server/ssl/private.key"),
          cert: fs.readFileSync("server/ssl/certificate.crt")
        },
        server
      )
      .listen(4000, err => {
        if (err) throw err;
        console.log(`> Ready on port 4000`);
      });*/

    server.listen(8800, "0.0.0.0", (err) => {
      if (err) throw err;
      //console.log(`> Ready on port 3000`);
    });
  })
  .catch((ex) => {
    //console.error(ex.stack);
    process.exit(1);
  });
