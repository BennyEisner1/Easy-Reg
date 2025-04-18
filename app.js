if(process.env.NODE_ENV !== "production") {
  require("dotenv").config(); 
}

const express = require("express");
const MongoStore = require("connect-mongo");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const { body, validationResult } = require("express-validator");
const mongoSanatize = require("express-mongo-sanitize");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");

const middleware = require("./middleware");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const User = require("./models/user");
const courseRoutes = require("./routes/courses");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const { he } = require("@faker-js/faker");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/EasyReg";
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
});

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(mongoSanatize());

const secret = process.env.SECRET || "tempsecret";
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: secret
  }
});

store.on("error", function(e) {
  console.log("Session Store");
})

app.use(
  session({
    store: store,
    name: "sess",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);



app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 
          "https://stackpath.bootstrapcdn.com",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"  
        ],
        fontSrc: ["'self'", 
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com" 
        ],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/courses", courseRoutes);
app.use("/courses/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});