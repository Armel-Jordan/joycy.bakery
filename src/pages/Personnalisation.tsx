import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Personnalisation() {
  const { addToCart } = useCart();
  const [formData, setFormData] = useState({
    productType: '' as 'Cookies' | 'Crêpes' | 'Gâteaux' | '',
    productName: '',
    quantity: 1,
    customization: '',
    price: 0
  });

  const productTypes = ['Cookies', 'Crêpes', 'Gâteaux'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productType || !formData.productName || formData.price <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    addToCart({
      type: 'custom',
      name: `${formData.productType} - ${formData.productName}`,
      price: formData.price,
      quantity: formData.quantity,
      description: formData.productType,
      customization: formData.customization
    });

    alert('Commande personnalisée ajoutée au panier !');
    
    // Reset form
    setFormData({
      productType: '',
      productName: '',
      quantity: 1,
      customization: '',
      price: 0
    });
  };

  return (
    <div className="personnalisation-page">
      <div className="personnalisation-hero">
        <h1>🎨 Personnalisation</h1>
        <p>Créez votre commande sur mesure selon vos envies</p>
      </div>

      <div className="personnalisation-content">
        <div className="custom-order-info">
          <h2>Comment ça marche ?</h2>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <div>
                <h3>Choisissez votre type de produit</h3>
                <p>Cookies, Crêpes ou Gâteaux</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <div>
                <h3>Nommez votre création</h3>
                <p>Donnez un nom à votre commande personnalisée</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <div>
                <h3>Décrivez vos souhaits</h3>
                <p>Saveurs, décorations, allergies, occasions spéciales...</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">4</span>
              <div>
                <h3>Ajoutez au panier</h3>
                <p>Je vous contacterai pour finaliser les détails et le prix exact</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="custom-order-form">
          <h2>Créer ma commande personnalisée</h2>

          <div className="form-group">
            <label>Type de produit *</label>
            <select
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
              required
            >
              <option value="">-- Sélectionnez un type --</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nom de votre création *</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="Ex: Gâteau d'anniversaire licorne, Cookies chocolat-noisette..."
              required
            />
          </div>

          <div className="form-group">
            <label>Quantité *</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="form-group">
            <label>Prix estimé (CAD) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="Prix approximatif"
              required
            />
            <small>Le prix final sera confirmé après discussion</small>
          </div>

          <div className="form-group">
            <label>Description et personnalisation</label>
            <textarea
              value={formData.customization}
              onChange={(e) => setFormData({ ...formData, customization: e.target.value })}
              placeholder="Décrivez en détail ce que vous souhaitez :&#10;- Saveurs préférées&#10;- Couleurs et décorations&#10;- Thème de l'événement&#10;- Allergies ou restrictions alimentaires&#10;- Date de livraison souhaitée&#10;- Toute autre information importante..."
              rows={8}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            🛒 Ajouter au panier
          </button>
        </form>

        <div className="custom-examples">
          <h2>Exemples de personnalisations</h2>
          <div className="examples-grid">
            <div className="example-card">
              <div className="example-icon">🍪</div>
              <h3>Cookies Personnalisés</h3>
              <p>Choisissez vos pépites : chocolat noir, blanc, caramel, noisettes, M&M's...</p>
            </div>
            <div className="example-card">
              <div className="example-icon">🥞</div>
              <h3>Crêpes Sur Mesure</h3>
              <p>Saveurs : vanille, citron, orange, chocolat, fruits rouges...</p>
            </div>
            <div className="example-card">
              <div className="example-icon">🎂</div>
              <h3>Cake Design</h3>
              <p>Gâteaux thématiques : anniversaire, mariage, baptême, diplômation...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
