const { db } = require('../config/firebase');
const moment = require('moment');

const fetchDataForReport = async (startDate = null, endDate = null) => {
  const today = moment().utcOffset(8).format('YYYY-MM-DD');
  const start = startDate ? moment(startDate).utcOffset(8).format('YYYY-MM-DD') : today;
  const end = endDate ? moment(endDate).utcOffset(8).format('YYYY-MM-DD') : today;

  const salesSnapshot = await db.collection('laundryOrders').get();
  const expensesSnapshot = await db.collection('laundryExpenses').get();

  const salesData = salesSnapshot.docs
    .map((doc) => doc.data())
    .filter((order) => {
      const orderDate = moment(order.orderDate.toDate()).utcOffset(8).format('YYYY-MM-DD');
      return orderDate >= start && orderDate <= end;
    })
    .flatMap((order) =>
      order.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.subTotal,
      }))
    );
    // .reduce((acc, item) => {
    //   const existingItem = acc.find((accItem) => accItem.description === item.description);
    //   if (existingItem) {
    //     existingItem.quantity += item.quantity;
    //     existingItem.subTotal += item.subTotal;
    //   } else {
    //     acc.push({ ...item });
    //   }
    //   return acc;
    // }, []);

  const totalGrossSales = salesData.reduce((sum, order) => sum + order.subTotal, 0);

  const expensesData = expensesSnapshot.docs
    .map((doc) => doc.data())
    .filter((expense) => {
      const expenseDate = moment(expense.date.toDate()).utcOffset(8).format('YYYY-MM-DD');
      return expenseDate >= start && expenseDate <= end;
    })
    .map((expense) => ({
      date: moment(expense.date.seconds * 1000).utcOffset(8).format('MMM. DD, YYYY'),
      category: expense.category,
      description: expense.description,
      price: expense.expensePrice,
    }))
    .reduce((acc, expense) => {
      const existingExpense = acc.find((accExpense) => 
        accExpense.category === expense.category && accExpense.description === expense.description);
      
      if (existingExpense) {
        existingExpense.price += expense.price;
      } else {
        acc.push({ ...expense });
      }
      return acc;
    }, []);

  const totalExpensesData = expensesData.reduce((sum, expense) => sum + expense.price, 0);

  return {
    salesData,
    totalGrossSales,
    expensesData,
    totalExpensesData,
    dateRange: `${moment(start).format('MMM. DD, YYYY')} to ${moment(end).format('MMM. DD, YYYY')}`,
  };
};


module.exports = { fetchDataForReport };
