const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

//Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/api/onlineusers", require("./routes/api/onlineusers"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    
});