fetch('http://localhost:3000/products')
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById('products');
    products.forEach(p => {
      container.innerHTML += `<p>${p.name} - $${p.price}</p>`;
    });
  });