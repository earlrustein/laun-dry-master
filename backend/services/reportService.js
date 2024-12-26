const { db } = require('../config/firebase');
const moment = require('moment');

const fetchDataForReport = async () => {
  const today = moment().utcOffset(8).format('YYYY-MM-DD');

  const salesSnapshot = await db.collection('laundryOrders').get();
  const expensesSnapshot = await db.collection('laundryExpenses').get();

  const salesData = salesSnapshot.docs
    .map((doc) => doc.data())
    .filter((order) => moment(order.orderDate.toDate()).utcOffset(8).format('YYYY-MM-DD') === today)
    .flatMap((order) =>
      order.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.subTotal,
      }))
    );

  const totalGrossSales = salesData.reduce((sum, order) => sum + order.subTotal, 0);

  const expensesData = expensesSnapshot.docs
    .map((doc) => doc.data())
    .filter((expense) => moment(expense.date.toDate()).utcOffset(8).format('YYYY-MM-DD') === today)
    .map((expense) => ({
      date: moment(expense.date.seconds * 1000).utcOffset(8).format('MMM. DD, YYYY'),
      category: expense.category,
      description: expense.description,
      price: expense.expensePrice,
    }));

  const totalExpensesData = expensesData.reduce((sum, expense) => sum + expense.price, 0);

  return {
    salesData,
    totalGrossSales,
    expensesData,
    totalExpensesData,
    dateRange: moment().utcOffset(8).format('MMM. DD, YYYY'),
  };
};

module.exports = { fetchDataForReport };
