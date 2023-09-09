"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState([{ name: "", price: 0 }]);
  const [total, setTotal] = useState(50);

  //Add Items to database
  const addItem = async (e) => {
    e.preventDefault();

    if (newItem.name !== "" && newItem.price !== "") {
      try {
        await addDoc(collection(db, "items"), {
          name: newItem.name.trim(),
          price: newItem.price.trim(),
        });
        alert(`${newItem.name} is added successfully`);
        setNewItem({ name: "", price: "" });
      } catch (e) {
        console.log("An Error Occured : ", e);
      }
    }
  };

  //Read Items from database

  useEffect(() => {
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      //Read Total
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        setTotal(totalPrice);
      };
      calculateTotal();
      return () => unsubscribe();
    });
  }, []);

  //Delete Items from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono">
        <h1 className="text-center text-2xl font-bold">Expense Tracker</h1>
        <div className="bg-gray-800 rounded-lg p-4 items-center mx-auto">
          <form className="grid grid-cols-6 items-center justify-between">
            <input
              type="text"
              className="col-span-2 p-3 border"
              placeholder="Enter Item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Enter Price"
              className="col-span-2 p-3 border"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
            />
            <button className="bg-gray-400 p-3 " onClick={addItem}>
              +
            </button>
          </form>
        </div>
        <div className="">
          <ul>
            {items.map((item, id) => (
              <li
                className="bg-slate-950 my-4 w-full flex justify-between text-white"
                key={id}
              >
                <div className="p-4 w-full flex justify-between">
                  <span>{item.name}</span>
                  <span>Ghs {item.price}</span>
                </div>
                <button onClick={()=>deleteItem(item.id)} className="ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16">
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? (
            ""
          ) : (
            <div className="flex justify-between p-3">
              <span>Total</span>
              <span>Ghs {total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
