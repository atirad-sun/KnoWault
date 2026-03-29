import { useState, useEffect, useCallback, useRef } from "react";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

const RATE_LIMIT_MS = 500;

export function useFirestore(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastWriteRef = useRef(0);

  const itemsRef = collection(db, "users", userId, "items");

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastWriteRef.current < RATE_LIMIT_MS) {
      throw new Error("Rate limit exceeded. Please wait before trying again.");
    }
    lastWriteRef.current = now;
  };

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
    checkRateLimit();
    const ref = doc(itemsRef, item.id);
    await setDoc(ref, item);
  }, [userId]);

  const updateItem = useCallback(async (id, updates) => {
    checkRateLimit();
    const ref = doc(itemsRef, id);
    await setDoc(ref, updates, { merge: true });
  }, [userId]);

  const deleteItem = useCallback(async (id) => {
    checkRateLimit();
    const ref = doc(itemsRef, id);
    await deleteDoc(ref);
  }, [userId]);

  return { items, loading, addItem, updateItem, deleteItem };
}
