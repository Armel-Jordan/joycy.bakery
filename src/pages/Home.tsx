import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, OrderItem } from '../types';
import { User } from 'firebase/auth';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [showCart, setShowCart] = useState(false);

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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour passer une commande');
      return;
    }

    if (cart.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        total: calculateTotal(),
        status: 'pending',
        notes: orderNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert('Commande passée avec succès !');
      setCart([]);
      setOrderNotes('');
      setShowCart(false);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert('Erreur lors de la commande');
    }
  };

  const categories = ['pain', 'viennoiserie', 'gâteau', 'pâtisserie', 'autre'];

  if (loading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h1>🧁 Bienvenue chez Joycy Bakery</h1>
        <p>Découvrez nos délicieuses créations artisanales</p>
      </section>

      {cart.length > 0 && (
        <div className="cart-badge" onClick={() => setShowCart(!showCart)}>
          🛒 Panier ({cart.length})
        </div>
      )}

      {showCart && (
        <div className="cart-modal">
          <div className="cart-content">
            <h2>Votre Panier</h2>
            {cart.map(item => (
              <div key={item.productId} className="cart-item">
                <span>{item.productName}</span>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="cart-total">
              <strong>Total: {calculateTotal().toFixed(2)} €</strong>
            </div>
            <textarea
              placeholder="Notes pour la commande (optionnel)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
            <div className="cart-actions">
              <button onClick={() => setShowCart(false)} className="btn btn-secondary">
                Continuer mes achats
              </button>
              <button onClick={placeOrder} className="btn btn-primary">
                Commander
              </button>
            </div>
          </div>
        </div>
      )}

      {categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category} className="product-category">
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}s</h2>
            <div className="products-grid">
              {categoryProducts.map(product => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} />
                  )}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <span className="price">{product.price.toFixed(2)} €</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="btn btn-primary"
                      disabled={!user}
                    >
                      {user ? 'Ajouter' : 'Connectez-vous'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {products.length === 0 && (
        <div className="empty-state">
          <p>Aucun produit disponible pour le moment</p>
        </div>
      )}
    </div>
  );
}
