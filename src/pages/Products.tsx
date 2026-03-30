import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useTranslation } from 'react-i18next';
import ProductModal from '../components/ProductModal';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => { loadProducts(); }, []);

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

  const loc = (p: Product, field: 'name' | 'description' | 'flavor') => {
    if (i18n.language === 'en') {
      const v = p[`${field}_en` as keyof Product] as string | undefined;
      if (v) return v;
    }
    return p[field] || '';
  };

  const categories = ['all', 'Cookies', 'Crêpes', 'Gâteaux'];
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (loading) return <div className="loading">{t('products.loading')}</div>;

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>{t('products.hero.title')}</h1>
        <p>{t('products.hero.desc')}</p>
      </div>

      <div className="products-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? t('products.all') : cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>{t('products.empty')}</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
              {product.imageUrl && (
                <div className="product-image">
                  <img src={product.imageUrl} alt={loc(product, 'name')} />
                </div>
              )}
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3>{loc(product, 'name')}</h3>
                {product.flavor && <div className="product-flavor">🍫 {loc(product, 'flavor')}</div>}
                <p className="product-description">{loc(product, 'description')}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2)} $</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pricing-info">
        <h2>{t('products.pricing.title')}</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>🍪 Cookies</h3>
            <ul>
              <li>Cookie à l'unité : <strong>6,00 $</strong></li>
              <li>Boîte de 4 : <strong>20,00 $</strong></li>
              <li>Boîte de 6 : <strong>25,00 $</strong></li>
              <li>Boîte de 12 : <strong>45,00 $</strong></li>
              <li>Boîte de 24 : <strong>85,00 $</strong></li>
              <li>Autre quantité : <strong>{t('products.pricing.customPrice')}</strong></li>
            </ul>
            <p className="pricing-note">{t('products.pricing.note')}</p>
          </div>
          <div className="pricing-card">
            <h3>🥞 Crêpes</h3>
            <ul>
              <li>13 crêpes : <strong>20,00 $</strong></li>
              <li>30 crêpes : <strong>40,00 $</strong></li>
              <li>45 crêpes : <strong>60,00 $</strong></li>
              <li>60 crêpes : <strong>70,00 $</strong></li>
              <li>Autre quantité : <strong>{t('products.pricing.customPrice')}</strong></li>
            </ul>
            <p className="pricing-note">{t('products.pricing.note')}</p>
          </div>
          <div className="pricing-card">
            <h3>{t('products.pricing.cakes.title')}</h3>
            <p><strong>{t('products.pricing.soldByUnit')}</strong></p>
            <ul>
              <li>{t('products.pricing.cakes.custom')}</li>
              <li>{t('products.pricing.cakes.price')}</li>
              <li>{t('products.pricing.cakes.contact')}</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
