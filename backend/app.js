const fs = require("node:fs/promises");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.get("/products/published", async (req, res) => {
  const fileContent = await fs.readFile("./data/products.json");
  const productsData = JSON.parse(fileContent);
  const publishedProducts = productsData.filter((p) => p.published);

  const { groupBy, search } = req.query;

  const products = search
    ? filterBySearch(publishedProducts, search)
    : publishedProducts;

  if (groupBy) {
    const groupedProducts = groupProductsBy(products, groupBy);

    return res.status(200).json({ products: groupedProducts });
  }

  res.status(200).json({ products });
});

app.get("/products/all", async (req, res) => {
  const fileContent = await fs.readFile("./data/products.json");
  const productsData = JSON.parse(fileContent);

  const { groupBy, search } = req.query;

  const products = search ? filterBySearch(productsData, search) : productsData;

  if (groupBy) {
    const groupedProducts = groupProductsBy(products, groupBy);

    return res.status(200).json({ products: groupedProducts });
  }

  res.status(200).json({ products });
});

app.put("/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const product = req.body.product;

  if (!product || !product.id || !product.title || !product.description) {
    return res.status(422).json({
      message:
        "Invalid product data, required fields: [id, title, description]",
    });
  }

  const fileContent = await fs.readFile("./data/products.json");
  const products = JSON.parse(fileContent);
  const updatedProducts = products.map((p) =>
    String(p.id) === productId ? mergeObjects(p, product) : p
  );
  await fs.writeFile("./data/products.json", JSON.stringify(updatedProducts));

  res.status(200).json({ message: "Product updated!" });
});

app.get("/admin", async (req, res) => {
  const fileContent = await fs.readFile("./data/admin.json");
  const admin = JSON.parse(fileContent);
  res.status(200).json({ admin });
});

app.put("/admin", async (req, res) => {
  const admin = req.body.admin;

  if (!admin || !admin.username || !admin.password) {
    return res.status(422).json({
      message: "Invalid admin data, required fields: [username, password]",
    });
  }

  const fileContent = await fs.readFile("./data/admin.json");
  const adminData = mergeObjects(JSON.parse(fileContent), admin);
  await fs.writeFile("./data/admin.json", JSON.stringify(adminData));

  res.status(200).json({ message: "Admin User updated!" });
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

function groupProductsBy(products, key) {
  return products.reduce((acc, product) => {
    const group = product[key];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(product);
    return acc;
  }, {});
}

function filterBySearch(products, search) {
  return products.filter((p) =>
    Object.values(p).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );
}

function mergeObjects(obj1, obj2) {
  return {
    ...obj1,
    ...Object.fromEntries(
      Object.entries(obj2).filter(([_, value]) => value !== undefined)
    ),
  };
}

module.exports = app;
