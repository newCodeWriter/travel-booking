/** @format */

require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const { join } = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cityRouter = require("./routes/city");
const cors = require("cors");
const flightRouter = require("./routes/flight");
const userRoutes = require("./routes/users");
const uploadRouter = require("./routes/file-upload");
const sendEmail = require("./routes/email");
const checkoutPayment = require("./routes/payment");
const itineraryRouter = require("./routes/itinerary");
const trim = require("./middleware/trim");

//connect to Mongodb database
const mongoose = require("mongoose");

const { json, urlencoded } = express;

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(trim);
app.use(cookieParser());
app.use(express.static(join(__dirname, "public")));

app.use("/api/users", userRoutes);
app.use("/api/flights", flightRouter);
app.use("/api/cities", cityRouter);
app.use("/api/email", sendEmail);
app.use("/api", uploadRouter);
app.use("/api/checkout", checkoutPayment);
app.use("/api/itinerary", itineraryRouter);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(join(__dirname, "client/build")));
	app.get("*", (req, res) => {
		res.sendFile(join(__dirname, "client/build", "index.html"));
	});
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	res.json({ error: err });
});

const url = process.env.MONGO_URL;

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

app.listen(process.env.PORT || 3001, () => {
	console.log(`Express SERVER listening on port ${process.env.PORT} `);
});

module.exports = app;
