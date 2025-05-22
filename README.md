# E-commerce Website (Food Industry Project)

## Description

This project is a Node.js based e-commerce website specifically designed for the food industry. It allows users to browse a menu of food items, add them to a cart, proceed to checkout, and make payments. The application features a responsive design and integrates with backend services for product management, user sessions, and order processing.

## Features

*   **Homepage:** Displays featured products, offers, and a general introduction to the restaurant/food service.
*   **Product Listing (Menu):** Shows all available food items with options to filter by category (e.g., Burger, Pizza, Pasta, Fries).
*   **Single Product View:** Detailed information about a specific food item.
*   **Shopping Cart:**
    *   Add items to the cart.
    *   View cart contents.
    *   Edit product quantity in the cart.
    *   Remove items from the cart.
    *   View total price.
*   **Checkout Process:** Collects user information (name, email, phone, city, address) for order delivery.
*   **Payment Integration:** Uses PayPal SDK for processing payments.
*   **Order Confirmation:** Displays a "Thank You" page with an order ID upon successful payment.
*   **About Page:** Provides information about the restaurant/food service.
*   **Responsive Design:** Adapts to different screen sizes (desktop, tablet, mobile).

## Technologies Used

### Backend
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **EJS (Embedded JavaScript templates):** Templating engine to generate HTML.
*   **MySQL / MySQL2:** Relational database for storing product information, orders, etc.
*   **Express-session:** For managing user sessions.
*   **Body-parser:** Middleware for parsing incoming request bodies.
*   **Firebase:** Potentially used for real-time database features, authentication, or other backend services (exact usage depends on full implementation).
*   **Axios:** Promise-based HTTP client for making API requests.

### Frontend
*   **HTML5**
*   **CSS3**
    *   **Bootstrap v4.3.1:** Front-end framework for responsive design and UI components.
    *   **Font Awesome 4.7.0:** Icon library.
    *   Custom CSS (`style.css`, `responsive.css`, `main.css`)
*   **JavaScript (Client-side)**
    *   **jQuery 3.4.1:** JavaScript library for DOM manipulation and AJAX.
    *   **Popper.js:** For positioning tooltips and popovers (Bootstrap dependency).
    *   **Owl Carousel 2:** For creating carousels/sliders.
    *   **Isotope:** For filterable and sortable layouts.
    *   **Nice Select:** For custom select dropdowns.
    *   **PayPal SDK:** For payment processing.
    *   Custom JavaScript (`custom.js`)

## Project Structure


E-commerce Website (Food Industry Project)/
├── package.json
├── package-lock.json
├── public/
│ ├── css/
│ │ ├── bootstrap.css
│ │ ├── font-awesome.min.css
│ │ ├── main.css
│ │ ├── responsive.css
│ │ ├── style.css
│ │ └── style.scss (Sass source file)
│ ├── images/ (Contains images like hero-bg.jpg, product images, etc.)
│ └── js/ (Contains client-side JavaScript files like custom.js, bootstrap.js, etc.)
├── views/
│ └── pages/
│ ├── about.ejs
│ ├── cart.ejs
│ ├── checkout.ejs
│ ├── index.ejs
│ ├── payment.ejs
│ ├── products.ejs
│ ├── single_product.ejs
│ └── thank_you.ejs
└── index.js

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Saikumar1801/E-commerce-Website-Food-Industry-Project-.git
    cd "E-commerce-Website-Food-Industry-Project-"
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project if necessary and add configurations for:
    *   Database connection (MySQL host, user, password, database name)
    *   Firebase configuration (if used extensively beyond simple SDK inclusion)
    *   PayPal Client ID (for the payment page)
    *   Session secret

4.  **Database Setup:**
    *   Ensure you have a MySQL server running.
    *   Create the necessary database and tables. Schema details would typically be provided or managed via migrations (not included in the provided files).
    *   Populate the database with initial product data.

5.  **Firebase Setup (if applicable):**
    *   If Firebase services (like Firestore, Realtime Database, Authentication) are core to the backend logic beyond the client-side SDK, ensure your Firebase project is set up and configured in the backend.

## Running the Project

1.  **Start the server:**
    (Assuming your main server file is `app.js` or `server.js`)
    ```bash
    npm start
    ```
    or
    ```bash
    node index.js
    ```
    The command might vary based on the `scripts` section in your `package.json`.

2.  **Open your browser:**
    Navigate to `http://localhost:8080` (the PORT will be defined in your server configuration, commonly 3000 or 8080).

## Usage

*   Navigate through the **Home**, **Menu**, and **About** pages.
*   On the **Menu** page, browse products. Click on a product name to view its details (if `single_product.ejs` is linked and functional).
*   Add items to your cart using the cart icon/button associated with each product.
*   View your cart by clicking the main cart icon in the navigation bar.
*   Adjust quantities or remove items from the cart page.
*   Proceed to **Checkout**, fill in your details.
*   Complete the **Payment** using the PayPal integration.
*   Upon successful payment, you should be redirected to a **Thank You** page with your order details.
