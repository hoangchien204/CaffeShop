const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const coffeeImages = [
  {
    id: 1,
    name: "Americano 1",
    image: "http://localhost:3000/images/americano_pic_1_square.png",
  },
  {
    id: 2,
    name: "Americano 2",
    image: "http://localhost:3000/images/americano_pic_2_square.png",
  },
  {
    id: 3,
    name: "Americano 3",
    image: "http://localhost:3000/images/americano_pic_3_square.png",
  },
];

app.get("/", (req, res) => {
  res.send("Welcome to Coffee API!");
});

app.get("/coffees", (req, res) => {
  res.json(coffeeImages);
});

app.use("/images", express.static("images"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
