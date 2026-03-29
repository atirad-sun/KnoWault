import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useFirestore(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsRef = collection(db, "users", userId, "items");

  useEffect(() => {
    const q = query(itemsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const addItem = useCallback(async (item) => {
    const ref = doc(itemsRef, item.id);
    await setDoc(ref, item);
  }, [userId]);

  const updateItem = useCallback(async (id, updates) => {
    const ref = doc(itemsRef, id);
    await setDoc(ref, updates, { merge: true });
  }, [userId]);

  const deleteItem = useCallback(async (id) => {
    const ref = doc(itemsRef, id);
    await deleteDoc(ref);
  }, [userId]);

  return { items, loading, addItem, updateItem, deleteItem };
}
