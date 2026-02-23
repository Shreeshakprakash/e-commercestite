import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProduct() {
  if (!productId) return;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  renderProduct(data);
}

loadProduct();

function renderProduct(product) {
  const container = document.getElementById('product-details');

  container.innerHTML = `
    <h1>${product.name}</h1>

    ${product.video
      ? `<video src="${product.video}" controls width="400"></video>`
      : `<img src="${product.image}" width="400">`
    }

    <h2>₹${product.price}</h2>
    <p>${product.description || ''}</p>

    <button onclick="addToCart({
      id: ${product.id},
      name: '${product.name}',
      price: ${product.price},
      image: '${product.image}',
      video: '${product.video || ''}'
    })">
      Add to Cart
    </button>
  `;
}