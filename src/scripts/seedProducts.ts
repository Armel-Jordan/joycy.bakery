import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const newProducts = [
  // Cookies (2)
  {
    name: 'Cookie XL Chocolat',
    description: 'Cookie géant aux pépites de chocolat noir, moelleux à l\'intérieur et croustillant à l\'extérieur',
    price: 5.00,
    category: 'Cookies',
    imageUrl: '/cookies.jpeg',
    available: true
  },
  {
    name: 'Cookie XL Double Chocolat',
    description: 'Cookie au chocolat intense avec pépites de chocolat blanc et noir',
    price: 5.50,
    category: 'Cookies',
    imageUrl: '/cookies2.jpeg',
    available: true
  },
  // Crêpes (2)
  {
    name: 'Crêpe Nature',
    description: 'Crêpe traditionnelle légère et fondante, parfaite avec du sucre ou de la confiture',
    price: 3.50,
    category: 'Crêpes',
    imageUrl: '/crepes.jpeg',
    available: true
  },
  {
    name: 'Crêpe Nutella Banane',
    description: 'Crêpe garnie de Nutella onctueux et de tranches de banane fraîche',
    price: 5.00,
    category: 'Crêpes',
    imageUrl: '/crepes.jpeg',
    available: true
  },
  // Gâteaux (2)
  {
    name: 'Gâteau Personnalisé',
    description: 'Gâteau sur mesure pour vos événements spéciaux - anniversaires, mariages, baptêmes',
    price: 45.00,
    category: 'Gâteaux',
    imageUrl: '/gateau.jpeg',
    available: true
  },
  {
    name: 'Cake Design Thématique',
    description: 'Création artistique personnalisée selon votre thème - design unique garanti',
    price: 65.00,
    category: 'Gâteaux',
    imageUrl: '/gateau2.jpeg',
    available: true
  }
];

export async function deleteAllProducts() {
  console.log('🗑️ Suppression de tous les produits...');
  const querySnapshot = await getDocs(collection(db, 'products'));
  
  const deletePromises = querySnapshot.docs.map(docSnapshot => 
    deleteDoc(doc(db, 'products', docSnapshot.id))
  );
  
  await Promise.all(deletePromises);
  console.log(`✅ ${querySnapshot.docs.length} produits supprimés`);
}

export async function seedProducts() {
  console.log('🌱 Ajout des nouveaux produits...');
  
  for (const product of newProducts) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp()
    });
    console.log(`✅ Ajouté: ${product.name}`);
  }
  
  console.log(`🎉 ${newProducts.length} produits ajoutés avec succès!`);
}

export async function resetProducts() {
  await deleteAllProducts();
  await seedProducts();
}
