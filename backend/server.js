const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const products = [
  { id: 1, name: "Rose Bouquet", price: 25 },
  { id: 2, name: "Tulip Basket", price: 20 }
];

app.get('/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});