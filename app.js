// ========== Shop-Site Application Logic ==========
// NOTE TO STUDENTS:
// You must implement ALL the functions below.
// The HTML, CSS, and products.js files are already provided.
// DO NOT modify those files — only edit this file (app.js).

// ========== Navigation ==========

/**
 * goToProducts(category)
 * ----------------------
 * Redirect user to products.html with the selected category.
 * Example: products.html?category=Fruits
 */
function goToProducts(category) {
  // TODO: Implement redirection logic
  window.location.href="products.html?category="+category;
}

// ========== Rendering Products ==========

/**
 * renderProducts(list)
 * --------------------
 * Display all products in the given list as cards inside #product-list.
 * Each card should contain:
 *  - Product image
 *  - Product name
 *  - Product brand
 *  - Product cost
 *  - "Add to Cart" button (button should call addToCart(index))
 */
function renderProducts(list) {
  // TODO: Implement product rendering
  let productsHtml='';
  list.forEach((product,i)=>{
    productsHtml+=`
    <div class="item">
    <img src="${product.image}">
    <h3>${product.name}</h3>
    <p>Brand: ${product.brand}</p>
    <p>Cost: ₹${product.cost}</p>
    <button class="button" onclick="addToCart(${i})">Add to Cart</button>
    </div>
    `;
  });
  document.getElementById('product-list').innerHTML=productsHtml;
  console.log(productsHtml);

}

// ========== Sorting ==========

/**
 * sortProducts()
 * --------------
 * Sort the current product list based on the selected option:
 *  - Name (A-Z)
 *  - Price (Low to High)
 *  - Price (High to Low)
 * Then re-render the products.
 */
function sortProducts() {
  // TODO: Implement sorting
  const sortValue = document.getElementById('sort-select').value;
  console.log(sortValue);
  if(sortValue === 'name'){
    filteredByCategory.sort((a,b)=> a.name.localeCompare(b.name));
  }else if(sortValue === 'price-asc'){
    filteredByCategory.sort((a,b)=> a.cost - b.cost);
  }else if(sortValue === 'price-desc'){
    filteredByCategory.sort((a,b)=> b.cost - a.cost);
  }
  renderProducts(filteredByCategory);
}

// ========== Filtering ==========

/**
 * filterProducts()
 * ----------------
 * Filter the product list by brand based on the dropdown value (#filter-select).
 * If "all" is selected, show all products for the current category.
 * Otherwise, show only products of the chosen brand.
 */
function filterProducts() {
  // TODO: Implement filtering
  const filterValue=document.querySelector('#filter-select').value;
  if(filterValue === 'all'){
    renderProducts(filteredByCategory);
    return;
  } //if(filterValue === 'Apple'){
  //   filteredByCategory.sort((a,b)=> a.cost - b.cost);
  // }else if(filterValue === 'Banana'){
  //   filteredByCategory.sort((a,b)=> b.cost - a.cost);
  // }
  let temp=filteredByCategory.filter((a)=>a.brand===filterValue)
  renderProducts(temp)

}

// ========== Cart Management ==========

let cart = [];

/**
 * addToCart(index)
 * ----------------
 * Add the product at the given index (from filteredByCategory) to the cart.
 * If the product is already in the cart, increase its quantity.
 * Otherwise, add it with quantity = 1.
 */
function addToCart(index) {
  // TODO: Implement add-to-cart logic
  // HINT: Use cart.find() to check if the item exists
  for(let i of cart){
    if(i.name==filteredByCategory[index].name){
      i.qty+=1;
      renderCart();
      return;
    }
  }
  let temp={...filteredByCategory[index],qty:1}
  cart.push(temp);
  renderCart();
}

/**
 * renderCart()
 * ------------
 * Render the cart table inside #cart-items.
 * Each row should show:
 *  - Product image
 *  - Product name
 *  - Product brand
 *  - Product cost
 *  - Quantity
 *  - Total (cost × quantity)
 */
function renderCart() {
  let productsHtml='';
  cart.forEach((product,i)=>{
    productsHtml+=`
    <tr>
    <td><img src="${product.image}" class="cart-img"></td>
    <td>${product.name}</td>
    <td>${product.brand}</td>
    <td>₹${product.cost}</td>
    <td>${product.qty}</td>
    <td>₹${product.cost*product.qty}</td>
    </tr>
    `;
  });
  document.getElementById('cart-items').innerHTML=productsHtml;
  console.log(productsHtml);
}

// ========== Initialization ==========

const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get("category");

let filteredByCategory = [];

const categoryHeader=document.getElementById('category-title');
/**
 * On page load:
 *  - If a category is selected (from URL), set the page title
 *  - Load products of that category into filteredByCategory
 *  - Render them using renderProducts()
 */
if (category) {
  // TODO: Implement initial category setup
  categoryHeader.innerText=category+" Products";
  filteredByCategory=products.filter((a)=>a.category===category);
  renderProducts(filteredByCategory);
}
