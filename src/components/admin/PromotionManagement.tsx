import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useTranslation } from 'react-i18next';

interface Promotion {
  id: string;
  name: string;
  name_en?: string;
  category: 'Cookies' | 'Crêpes' | 'Gâteaux' | 'Autres';
  price: number;
  description: string;
  description_en?: string;
  badge?: string;
  badge_en?: string;
  savings?: string;
  savings_en?: string;
  imageUrl?: string;
  featured: boolean;
  available: boolean;
}

const EMPTY_FORM = {
  name: '',
  name_en: '',
  category: 'Cookies' as Promotion['category'],
  price: 0,
  description: '',
  description_en: '',
  badge: '',
  badge_en: '',
  savings: '',
  savings_en: '',
  imageUrl: '',
  featured: false,
  available: true,
};

const CATEGORY_ICONS: Record<string, string> = {
  Cookies: '🍪',
  Crêpes: '🥞',
  Gâteaux: '🎂',
  Autres: '✨',
};

export default function PromotionManagement() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formLang, setFormLang] = useState<'fr' | 'en'>('fr');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'promotions'));
      setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion)));
    } catch {
      console.error('Erreur chargement promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const storageRef = ref(storage, `promotions/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setUploadProgress(0);
    uploadTask.on(
      'state_changed',
      snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { alert('Erreur lors du téléchargement.'); setUploadProgress(null); },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setForm(f => ({ ...f, imageUrl: url }));
        setUploadProgress(null);
      }
    );
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormLang('fr');
    setShowForm(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      name_en: p.name_en || '',
      category: p.category,
      price: p.price,
      description: p.description,
      description_en: p.description_en || '',
      badge: p.badge || '',
      badge_en: p.badge_en || '',
      savings: p.savings || '',
      savings_en: p.savings_en || '',
      imageUrl: p.imageUrl || '',
      featured: p.featured,
      available: p.available,
    });
    setFormLang('fr');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        name_en: form.name_en,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        description_en: form.description_en,
        badge: form.badge || '',
        badge_en: form.badge_en || '',
        savings: form.savings || '',
        savings_en: form.savings_en || '',
        imageUrl: form.imageUrl || '',
        featured: form.featured,
        available: form.available,
      };
      if (editing) {
        await updateDoc(doc(db, 'promotions', editing.id), data);
      } else {
        await addDoc(collection(db, 'promotions'), { ...data, createdAt: serverTimestamp() });
      }
      setShowForm(false);
      load();
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    await deleteDoc(doc(db, 'promotions', id));
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const toggleAvailable = async (p: Promotion) => {
    await updateDoc(doc(db, 'promotions', p.id), { available: !p.available });
    setPromotions(prev => prev.map(x => x.id === p.id ? { ...x, available: !x.available } : x));
  };

  const filtered = promotions.filter(p => filterCat === 'all' || p.category === filterCat);

  if (loading) return <div className="loading">{t('admin.common.loading')}</div>;

  return (
    <div className="promo-mgmt">
      <div className="management-header">
        <h2>{t('admin.promotions.title')}</h2>
        <button className="btn btn-primary" onClick={openNew}>{t('admin.promotions.new')}</button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="promo-mgmt-form">
          <h3>{editing ? 'Modifier la promotion' : 'Nouvelle promotion'}</h3>

          {/* Language tabs */}
          <div className="bilingual-tabs">
            <button type="button" className={`bilingual-tab${formLang === 'fr' ? ' active' : ''}`} onClick={() => setFormLang('fr')}>
              🇫🇷 Français
            </button>
            <button type="button" className={`bilingual-tab${formLang === 'en' ? ' active' : ''}`} onClick={() => setFormLang('en')}>
              🇬🇧 English
            </button>
          </div>

          {/* FR fields */}
          {formLang === 'fr' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom (Français) *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex : Boîte de 6 Cookies" required />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })} required>
                    <option value="Cookies">🍪 Cookies</option>
                    <option value="Crêpes">🥞 Crêpes</option>
                    <option value="Gâteaux">🎂 Gâteaux</option>
                    <option value="Autres">✨ Autres</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description (Français) *</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex : Idéal pour partager en famille" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Badge <span style={{ color: '#aaa', fontWeight: 400 }}>(optionnel)</span></label>
                  <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Ex : Populaire, Découverte…" />
                </div>
                <div className="form-group">
                  <label>Économies <span style={{ color: '#aaa', fontWeight: 400 }}>(optionnel)</span></label>
                  <input type="text" value={form.savings} onChange={e => setForm({ ...form, savings: e.target.value })} placeholder="Ex : Économisez 4 $" />
                </div>
              </div>
            </>
          )}

          {/* EN fields */}
          {formLang === 'en' && (
            <>
              <div className="form-group">
                <label>Name (English)</label>
                <input type="text" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} placeholder="Ex: Box of 6 Cookies" />
              </div>
              <div className="form-group">
                <label>Description (English)</label>
                <input type="text" value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} placeholder="Ex: Perfect for sharing with family" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Badge <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" value={form.badge_en} onChange={e => setForm({ ...form, badge_en: e.target.value })} placeholder="Ex: Popular, Discovery…" />
                </div>
                <div className="form-group">
                  <label>Savings <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" value={form.savings_en} onChange={e => setForm({ ...form, savings_en: e.target.value })} placeholder="Ex: Save $4" />
                </div>
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Prix ($) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
            </div>
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label>Photo</label>
            <div className="image-upload-area">
              {form.imageUrl && (
                <div className="image-preview">
                  <img src={form.imageUrl} alt="Aperçu" />
                  <button type="button" className="image-remove-btn" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}>✕</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              {uploadProgress !== null ? (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                  <span>{uploadProgress}%</span>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  📁 {form.imageUrl ? 'Changer la photo' : 'Choisir une photo'}
                </button>
              )}
            </div>
          </div>

          <div className="form-row" style={{ gap: '2rem' }}>
            <label className="promo-toggle-label">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
              <span>Mise en avant</span>
            </label>
            <label className="promo-toggle-label">
              <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
              <span>Disponible</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('admin.common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Sauvegarde…' : editing ? t('admin.products.save') : t('admin.products.create')}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="product-list-controls">
        <div className="product-filter-btns">
          {['all', 'Cookies', 'Crêpes', 'Gâteaux', 'Autres'].map(cat => (
            <button key={cat} className={`filter-btn${filterCat === cat ? ' active' : ''}`} onClick={() => setFilterCat(cat)}>
              {cat === 'all' ? 'Toutes' : `${CATEGORY_ICONS[cat]} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Aucune promotion</p>
      ) : (
        <div className="promo-mgmt-list">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Badge</th>
                <th>Disponible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={!p.available ? 'promo-row--off' : ''}>
                  <td>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="promo-thumb" />
                      : <div className="promo-thumb-empty">{CATEGORY_ICONS[p.category]}</div>
                    }
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.name_en && <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.4rem' }}>/ {p.name_en}</span>}
                    {p.featured && <span className="promo-featured-tag">★ Mise en avant</span>}
                    <br /><small style={{ color: '#888' }}>{p.description}</small>
                  </td>
                  <td>{CATEGORY_ICONS[p.category]} {p.category}</td>
                  <td><strong>{p.price.toFixed(2)} $</strong></td>
                  <td>{p.badge ? <span className="promo-badge-tag">{p.badge}</span> : <span style={{ color: '#ccc' }}>—</span>}</td>
                  <td>
                    <button className={`status-badge ${p.available ? 'available' : 'unavailable'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleAvailable(p)}>
                      {p.available ? t('admin.products.yes') : t('admin.products.no')}
                    </button>
                  </td>
                  <td className="actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>{t('admin.products.edit')}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deletePromo(p.id)}>{t('admin.products.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
