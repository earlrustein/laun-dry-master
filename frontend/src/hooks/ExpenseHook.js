import { useEffect, useState } from 'react';
import { firestore } from '../config/FirebaseConfig';
import { collection, getDocs, query, orderBy as orderData } from "firebase/firestore";
import moment from 'moment';

export const ExpenseHook = () => {
  const [isLoading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseList, setExpenseList] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [date, setDate] = useState(moment().utcOffset(8).format('YYYY-MM-DD'));
  
  const expenseCategories = [
    {
      description: 'Utilities',
      items: [
          'Electricity',
          'Water',
          'Gas',
          'Internet'
      ]
    },
    {
      description: 'Supplies',
      items: [
          'Detergent',
          'Fabric Conditioner'
      ]
    },
    {
      description: 'Rent'
    },
    {
      description: 'Salary'
    },
    {
      description: 'Maintenance'
    },
    {
      description: 'Others'
    }
  ];

  const fetchExpenseList = async () => {
    setLoading(true);
    try {
      const expenseQuery = query(
        collection(firestore, "laundryExpenses"),
        orderData("date", "desc")
      );
      const querySnapshot = await getDocs(expenseQuery);
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : "N/A",
        };
      });
      setExpenseList(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  const toggleModal = (item) => {
    setModalOpen(!isModalOpen);
    setEditMode(item == null ? false : true);
    setSelectedExpense(item == null ? null : item);
    setCategory(item == null ? '' : item.category );
    setDescription(item == null ? '' : item.description);
    setTotalPrice(item == null ? '' : item.expensePrice.toString());
    setDate(item == null ? 
      moment().utcOffset(8).format('YYYY-MM-DD') : moment(new Date(item.date)).utcOffset(8).format('YYYY-MM-DD'));
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setDescription('');
  }
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleTotalPriceChange = (e) => {
    setTotalPrice(e.target.value);
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  }

  useEffect(() => {
    fetchExpenseList();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, [isModalOpen]);

  const handleSort = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);

    const sortedData = [...expenseList].sort((a, b) => {
      if (property === "date") {
        const dateA = new Date(a[property]);
        const dateB = new Date(b[property]);
        if (dateA < dateB) return isAscending ? 1 : -1;
        if (dateA > dateB) return isAscending ? -1 : 1;
      } else if (property === "expensePrice") {
        const totalA = parseFloat(a[property]);
        const totalB = parseFloat(b[property]);
        if (totalA < totalB) return isAscending ? 1 : -1;
        if (totalA > totalB) return isAscending ? -1 : 1;
      } else {
        if (a[property] < b[property]) return isAscending ? 1 : -1;
        if (a[property] > b[property]) return isAscending ? -1 : 1;
      }
      return 0;
    });

    setExpenseList(sortedData);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = expenseList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
      fetchExpenseList();
  }, []);

  return {
    expenseList,
    orderBy,
    order,
    handleSort,
    paginatedRows,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    isLoading,
    isModalOpen,
    toggleModal,
    date,
    handleDateChange,
    handleCategoryChange,
    category,
    expenseCategories,
    handleTotalPriceChange,
    totalPrice,
    description,
    handleDescriptionChange,
    isEditMode
  };
}