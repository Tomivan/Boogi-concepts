// firebase/cartService.js
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const getCart = async (userId) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  return cartSnap.exists() ? cartSnap.data().items : [];
};

export const syncCart = async (userId, items) => {
  const cartRef = doc(db, 'carts', userId);
  await setDoc(cartRef, { items }, { merge: true });
};

export const mergeCarts = async (userId, guestItems) => {
  const cartRef = doc(db, 'carts', userId);
  await updateDoc(cartRef, {
    items: arrayUnion(...guestItems)
  });
};

export const clearFirebaseCart = async (userId) => {
  const cartRef = doc(db, 'carts', userId);
  await setDoc(cartRef, { items: [] });
};