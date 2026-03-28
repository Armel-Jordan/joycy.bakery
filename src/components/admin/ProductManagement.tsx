import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { Product } from '../../types';
import { useTranslation } from 'react-i18next';

export default function ProductManagement() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'price'>('category');
  const [formLang, setFormLang] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    description_en: '',
    flavor: '',
    flavor_en: '',
    price: 0,
    category: 'Cookies' as Product['category'],
    imageUrl: '',
    available: true,
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        name_en: formData.name_en,
        description: formData.description,
        description_en: formData.description_en,
        flavor: formData.flavor,
        flavor_en: formData.flavor_en,
        price: Number(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
        available: formData.available,
      };
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
      }
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(t('admin.products.saveError'));
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_en: product.name_en || '',
      description: product.description,
      description_en: product.description_en || '',
      flavor: product.flavor || '',
      flavor_en: product.flavor_en || '',
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || '',
      available: product.available,
    });
    setFormLang('fr');
    setShowForm(true);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm(t('admin.products.confirmDelete'))) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleImageUpload = (file: File) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setUploadProgress(0);
    uploadTask.on(
      'state_changed',
      snapshot => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      () => { alert("Erreur lors du téléchargement de l'image."); setUploadProgress(null); },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(f => ({ ...f, imageUrl: url }));
        setUploadProgress(null);
      }
    );
  };

  const resetForm = () => {
    setFormData({ name: '', name_en: '', description: '', description_en: '', flavor: '', flavor_en: '', price: 0, category: 'Cookies', imageUrl: '', available: true });
    setEditingProduct(null);
    setShowForm(false);
    setFormLang('fr');
  };

  if (loading) return <div className="loading">{t('admin.products.loading')}</div>;

  return (
    <div className="product-management">
      <div className="management-header">
        <h2>{t('admin.products.title')}</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-primary">
          {showForm ? t('admin.products.cancel') : t('admin.products.newProduct')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>{editingProduct ? t('admin.products.formEdit') : t('admin.products.formNew')}</h3>

          {/* Language tabs */}
          <div className="bilingual-tabs">
            <button
              type="button"
              className={`bilingual-tab${formLang === 'fr' ? ' active' : ''}`}
              onClick={() => setFormLang('fr')}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              className={`bilingual-tab${formLang === 'en' ? ' active' : ''}`}
              onClick={() => setFormLang('en')}
            >
              🇬🇧 English
            </button>
          </div>

          {/* FR fields */}
          {formLang === 'fr' && (
            <>
              <div className="form-group">
                <label>{t('admin.products.nameFr')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex : Cookie Chocolat Noir"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('admin.products.descFr')}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex : Cookie généreux au chocolat noir intense"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('admin.products.flavorFr')}</label>
                <input
                  type="text"
                  value={formData.flavor}
                  onChange={e => setFormData({ ...formData, flavor: e.target.value })}
                  placeholder="Ex : Chocolat noir & Vanille — fourré Nutella"
                />
              </div>
            </>
          )}

          {/* EN fields */}
          {formLang === 'en' && (
            <>
              <div className="form-group">
                <label>{t('admin.products.nameEn')}</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Ex: Dark Chocolate Cookie"
                />
              </div>
              <div className="form-group">
                <label>{t('admin.products.descEn')}</label>
                <textarea
                  value={formData.description_en}
                  onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Ex: Generous cookie with intense dark chocolate"
                />
              </div>
              <div className="form-group">
                <label>{t('admin.products.flavorEn')}</label>
                <input
                  type="text"
                  value={formData.flavor_en}
                  onChange={e => setFormData({ ...formData, flavor_en: e.target.value })}
                  placeholder="Ex: Dark chocolate & Vanilla — Nutella filled"
                />
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="form-row">
            <div className="form-group">
              <label>{t('admin.products.price')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('admin.products.category')}</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                required
              >
                <option value="Cookies">🍪 Cookies</option>
                <option value="Crêpes">🥞 Crêpes</option>
                <option value="Gâteaux">🎂 Gâteaux</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('admin.products.image')}</label>
            <div className="image-upload-area">
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Aperçu" />
                  <button type="button" className="image-remove-btn" onClick={() => setFormData(f => ({ ...f, imageUrl: '' }))}>✕</button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
              />
              {uploadProgress !== null ? (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                  <span>{uploadProgress}%</span>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  📁 {formData.imageUrl ? t('admin.products.changeImage') : t('admin.products.chooseImage')}
                </button>
              )}
            </div>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.available}
                onChange={e => setFormData({ ...formData, available: e.target.checked })}
              />
              {t('admin.products.available')}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              {t('admin.products.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? t('admin.products.save') : t('admin.products.create')}
            </button>
          </div>
        </form>
      )}

      <div className="product-list-controls">
        <div className="product-filter-btns">
          {['all', 'Cookies', 'Crêpes', 'Gâteaux'].map(cat => (
            <button
              key={cat}
              className={`filter-btn${filterCategory === cat ? ' active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? t('admin.products.all') : cat}
            </button>
          ))}
        </div>
        <div className="product-sort">
          <label>{t('admin.products.sortBy')}</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="category">{t('admin.products.sortCategory')}</option>
            <option value="name">{t('admin.products.sortName')}</option>
            <option value="price">{t('admin.products.sortPrice')}</option>
          </select>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>{t('admin.products.colName')}</th>
              <th>{t('admin.products.colCategory')}</th>
              <th>{t('admin.products.colPrice')}</th>
              <th>{t('admin.products.colAvailable')}</th>
              <th>{t('admin.products.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">{t('admin.products.empty')}</td></tr>
            ) : (
              [...products]
                .filter(p => filterCategory === 'all' || p.category === filterCategory)
                .sort((a, b) => {
                  if (sortBy === 'name') return a.name.localeCompare(b.name);
                  if (sortBy === 'price') return a.price - b.price;
                  return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
                })
                .map(product => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.name_en && <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.4rem' }}>/ {product.name_en}</span>}
                      <br />
                      <small style={{ color: '#888' }}>{product.description}</small>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.price.toFixed(2)} $</td>
                    <td>
                      <span className={`status-badge ${product.available ? 'available' : 'unavailable'}`}>
                        {product.available ? t('admin.products.yes') : t('admin.products.no')}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => editProduct(product)} className="btn btn-sm btn-secondary">
                        {t('admin.products.edit')}
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="btn btn-sm btn-danger">
                        {t('admin.products.delete')}
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
