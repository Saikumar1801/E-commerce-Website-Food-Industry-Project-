const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');

// Create a MySQL connection pool to reuse connections
const pool = mysql.createPool({
   connectionLimit: 10, // max number of connections in pool
   host: "localhost",
   user: "root",
   password: "", 
   database: "node_project"
});

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
   secret: "replace_with_secure_random_secret", // Use environment variable in production
   resave: false,
   saveUninitialized: true
}));

// Utility function to check if product is already in cart
function isProductInCart(cart, id) {
   return cart.some(item => item.id == id);
}

// Calculate total price in cart and store it in session
function calculateTotal(cart, req) {
   let total = 0;
   for (let item of cart) {
      if (item.sale_price && item.sale_price !== '') {
         total += (parseFloat(item.sale_price) * parseInt(item.quantity));
      } else {
         total += (parseFloat(item.price) * parseInt(item.quantity));
      }
   }
   req.session.total = total;
   return total;
}

// Home page - display products
app.get('/', (req, res) => {
   pool.query("SELECT * FROM products", (err, results) => {
      if (err) {
         console.error("Error fetching products for /:", err);
         return res.status(500).send("Error fetching products");
      }
      res.render('pages/index', { result: results });
   });
});

// Add product to cart
app.post('/add_to_cart', (req, res) => {
   const { id, name, price, sale_price, quantity, image } = req.body;
   const product = { id, name, price, sale_price, quantity: parseInt(quantity), image };

   if (!req.session.cart) {
      req.session.cart = [];
   }

   const cart = req.session.cart;

   if (!isProductInCart(cart, id)) {
      cart.push(product);
   } else {
      // If product already in cart, increment quantity
      for (let item of cart) {
         if (item.id == id) {
            item.quantity += parseInt(quantity);
            break;
         }
      }
   }

   calculateTotal(cart, req);

   res.redirect('/cart');
});

// Show cart page
app.get('/cart', (req, res) => {
   const cart = req.session.cart || [];
   const total = req.session.total || 0;

   res.render('pages/cart', { cart, total });
});

// Remove product from cart
app.post('/remove_product', (req, res) => {
   const id = req.body.id;
   const cart = req.session.cart;

   if (cart) {
      const index = cart.findIndex(item => item.id == id);
      if (index !== -1) {
         cart.splice(index, 1);
      }
      calculateTotal(cart, req);
   }
   res.redirect('/cart');
});

// Edit product quantity in cart (increase or decrease)
app.post('/edit_product_quantity', (req, res) => {
   const { id, increase_product_quantity, decrease_product_quantity } = req.body;
   const cart = req.session.cart;

   if (cart) {
      for (let item of cart) {
         if (item.id == id) {
            if (increase_product_quantity) {
               item.quantity = parseInt(item.quantity) + 1;
            } else if (decrease_product_quantity) {
               if (item.quantity > 1) {
                  item.quantity = parseInt(item.quantity) - 1;
               }
            }
            break;
         }
      }
      calculateTotal(cart, req);
   }
   res.redirect('/cart');
});

// Checkout page
app.get('/checkout', (req, res) => {
   const total = req.session.total || 0;
   res.render('pages/checkout', { total });
});

// Place order
app.post('/place_order', (req, res) => {
   const { name, email, phone, city, address } = req.body;
   const cost = req.session.total;
   const status = "not paid";
   const date = new Date();
   const id = Date.now(); // You may want to replace with UUID in production
   req.session.order_id = id;

   const cart = req.session.cart;

   if (!cart || cart.length === 0) {
      console.log("Attempted to place order with an empty cart.");
      return res.redirect('/cart');
   }

   const products_ids = cart.map(item => item.id).join(',');

   pool.getConnection((err, con) => {
      if (err) {
         console.error("DB Connection error in /place_order:", err);
         return res.status(500).send("Database connection error");
      }

      const query = "INSERT INTO orders (id, cost, name, email, status, city, address, phone, date, products_ids) VALUES ?";
      const values = [[id, cost, name, email, status, city, address, phone, date, products_ids]];

      con.query(query, [values], (err, result) => {
         if (err) {
            console.error("Error inserting into orders:", err);
            con.release();
            return res.status(500).send("Error placing order");
         }

         // Insert each order item
         let itemsProcessed = 0;
         for (let item of cart) {
            const itemQuery = "INSERT INTO order_items (order_id, product_id, product_name, product_price, product_image, product_quantity, order_date) VALUES ?";
            const itemValues = [[
               id,
               item.id,
               item.name,
               item.sale_price && item.sale_price !== '' ? item.sale_price : item.price,
               item.image,
               item.quantity,
               new Date()
            ]];

            con.query(itemQuery, [itemValues], (itemErr, itemResult) => {
               itemsProcessed++;
               if (itemErr) {
                  console.error("Error inserting into order_items:", itemErr);
                  // You can add rollback logic here if needed
               }
               if (itemsProcessed === cart.length) {
                  // All items inserted
                  req.session.cart = [];
                  req.session.total = 0;
                  con.release();
                  res.redirect('/payment');
               }
            });
         }
      });
   });
});

// Payment page
app.get('/payment', (req, res) => {
   const total = req.session.total || 0;
   res.render('pages/payment', { total });
});

// Verify payment
app.get("/verify_payment", (req, res) => {
   const transaction_id = req.query.transaction_id;
   const order_id = req.session.order_id;

   if (!order_id || !transaction_id) {
      console.error("Missing order_id or transaction_id for payment verification");
      return res.redirect('/');
   }

   pool.getConnection((err, con) => {
      if (err) {
         console.error("DB Connection error in /verify_payment:", err);
         return res.status(500).send("Database connection error");
      }

      const query = "INSERT INTO payments (order_id, transaction_id, date) VALUES ?";
      const values = [[order_id, transaction_id, new Date()]];

      con.query(query, [values], (err, result) => {
         if (err) {
            console.error("Error inserting into payments:", err);
         }

         con.query("UPDATE orders SET status='paid' WHERE id=?", [order_id], (updateErr, updateResult) => {
            if (updateErr) {
               console.error("Error updating order status:", updateErr);
            }
            con.release();
            res.redirect('/thank_you');
         });
      });
   });
});

// Thank you page
app.get("/thank_you", (req, res) => {
   const order_id = req.session.order_id;
   // Optionally clear order_id after showing thank you page
   // delete req.session.order_id;
   res.render("pages/thank_you", { order_id });
});

// Single product page
app.get('/single_product', (req, res) => {
   const id = req.query.id;
   if (!id) {
      return res.status(400).send("Product ID is required.");
   }

   pool.query("SELECT * FROM products WHERE id=?", [id], (err, results) => {
      if (err) {
         console.error("Error fetching single product:", err);
         return res.status(500).send("Error fetching product data");
      }
      res.render('pages/single_product', { result: results });
   });
});

// Products listing page
app.get('/products', (req, res) => {
   pool.query("SELECT * FROM products", (err, results) => {
      if (err) {
         console.error("Error fetching products for /products:", err);
         return res.status(500).send("Error fetching products");
      }
      res.render('pages/products', { result: results });
   });
});

// About page
app.get('/about', (req, res) => {
   res.render('pages/about');
});

// Start the server
app.listen(8080, () => {
   console.log("Server started on port 8080");
});
