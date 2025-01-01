import { database } from '../config/FirebaseConfig';
import { collection, query, orderBy, limit, getDocs, addDoc, doc, updateDoc, where, deleteDoc } from 'firebase/firestore';

const ordersCollection = collection(database, 'laundryOrders');
const expensesCollection = collection(database, 'laundryExpenses');

export const getLastOrderId = async () => {
    const lastOrderQuery = query(ordersCollection, orderBy('orderId', 'desc'), limit(1));
    const lastOrderSnapshot = await getDocs(lastOrderQuery);

    if (!lastOrderSnapshot.empty) {
        const lastOrder = lastOrderSnapshot.docs[0].data();
        return lastOrder.orderId;
    }

    return 0;
};

export const getLastExpenseId = async() => {
    const lastExpenseQuery = query(expensesCollection, orderBy('expenseId', 'desc'), limit(1));
    const lastExpenseSnapshot = await getDocs(lastExpenseQuery);

    if (!lastExpenseSnapshot.empty) {
        const lastExpense = lastExpenseSnapshot.docs[0].data();
        return lastExpense.expenseId;
    }

    return 0;
}

export const addOrder = async (newOrder) => {
    await addDoc(ordersCollection, newOrder);
};

export const addExpense = async (newExpense) => {
    await addDoc(expensesCollection, newExpense);
}

export const editExpense = async (expenseId, updatedExpense) => {
    const expenseQuery = query(expensesCollection, where('expenseId', '==', expenseId));
    const querySnapshot = await getDocs(expenseQuery);

    if (!querySnapshot.empty) {
        const expenseDoc = querySnapshot.docs[0];
        const expenseRef = doc(expensesCollection, expenseDoc.id);
        await updateDoc(expenseRef, updatedExpense);
    }
}

export const deleteExpense = async (expenseId) => {
    const expenseQuery = query(expensesCollection, where('expenseId', '==', expenseId));
    const querySnapshot = await(getDocs(expenseQuery));

    if (!querySnapshot.empty) {
        const expenseDoc = querySnapshot.docs[0];
        const expenseRef = doc(expensesCollection, expenseDoc.id);
        await deleteDoc(expenseRef);
    }
}

export const getExpenseRecords = async () => {
    const expensesQuery = query(expensesCollection, orderBy("date", "desc"));
    return await getDocs(expensesQuery);
}

export const getOrderRecords = async () => {
    return await getDocs(ordersCollection);
}
