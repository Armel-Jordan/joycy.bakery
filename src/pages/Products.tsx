import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData.filter(p => p.available));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Cookies', 'Crêpes', 'Gâteaux', 'Pains'];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>🍰 Nos Produits</h1>
        <p>Découvrez toutes nos délicieuses créations artisanales</p>
        <p className="info-note">Pour commander, visitez nos <a href="/promotions">Promotions</a> ou créez une <a href="/personnalisation">Commande Personnalisée</a></p>
      </div>

      <div className="products-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>Aucun produit disponible dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.imageUrl && (
                <div className="product-image">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
              )}
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2)} $</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pricing-info">
        <h2>💰 Tarifs Spéciaux</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>🍪 Cookies</h3>
            <ul>
              <li>À l'unité : <strong>4,00 $</strong></li>
              <li>Boîte de 3 : <strong>11,00 $</strong></li>
              <li>Boîte de 6 : <strong>20,00 $</strong></li>
              <li>Boîte de 12 : <strong>40,00 $</strong></li>
            </ul>
          </div>
          <div className="pricing-card">
            <h3>🥞 Crêpes</h3>
            <ul>
              <li>13 crêpes : <strong>20,00 $</strong></li>
              <li>30 crêpes : <strong>40,00 $</strong></li>
              <li>Saveurs : Nature, Citron, Vanille</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
