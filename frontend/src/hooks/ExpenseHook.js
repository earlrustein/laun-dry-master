import { useEffect, useState } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getExpenseRecords, getLastExpenseId, addExpense, editExpense, deleteExpense } from '../services/FirebaseService';

export const ExpenseHook = () => {
  const [isLoading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isModalLoading, setModalLoading] = useState(false);
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
      const data = await getExpenseRecords();
      const items = data.docs.map((doc) => {
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

  const toggleDeleteModal = (item) => {
    setSelectedExpense(item ? item : null);
    setDeleteModalOpen(!isDeleteModalOpen);
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setDescription('');
  }
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleTotalPriceChange = (e) => {

    if (/^\d*$/.test(e.target.value)) {
      setTotalPrice(e.target.value);
    }
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  }

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

  const saveExpense = async () => {
    setModalLoading(true);
    
    if (isEditMode) {
      updateExpense();
      return;
    } 

    recordExpense();
  };

  const recordExpense = async () => {
    try {
      const lastExpenseId = await getLastExpenseId();
      const newExpenseId = lastExpenseId + 1;

      await addExpense({
        expenseId: newExpenseId,
        category,
        description,
        date: moment(date) 
          .set({ hour: moment().hour(), minute: moment().minute(), second: moment().second() })
          .utcOffset(8, true)
          .toDate(),
        expensePrice: Number(totalPrice)
      });

      toast.success('Expense has been recorded!', {
        position: "top-center",
        className: 'custom-toast',
      });
      setModalOpen(false);
      fetchExpenseList();
    } catch (error) {
      console.error('Error recording the expense:', error);
      toast.error('Error recording the expense. Please try again.', {
        position: "top-center",
        className: 'custom-toast',
      });
    } finally {
      setModalLoading(false);
    }
  }

  const updateExpense = async () => {
    try {
      const expenseId = selectedExpense?.expenseId;

      if (!expenseId) {
        toast.error('Error updating the expense. Please try again.', {
          position: "top-center",
          className: 'custom-toast',
        });
        throw new Error('Expense ID is required for updating');
      }

      await editExpense(expenseId, {
        category,
        description,
        date: moment(date) 
          .set({ hour: moment().hour(), minute: moment().minute(), second: moment().second() })
          .utcOffset(8, true)
          .toDate(),
        expensePrice: Number(totalPrice)
      });

      toast.success('Expense has been updated!', {
        position: "top-center",
        className: 'custom-toast',
      });
      setModalOpen(false);
      fetchExpenseList();
    } catch (error) {
      console.error('Error updating the expense:', error);
      toast.error('Error updating the expense. Please try again.', {
        position: "top-center",
        className: 'custom-toast',
      });
    } finally {
      setModalLoading(false);
    }
  }

  const removeExpense = async () => {
    setModalLoading(true);
    try {
      const expenseId = selectedExpense?.expenseId;

      if (!expenseId) {
        toast.error('Failed to update the expense record. Please try again.', {
          position: "top-center",
          className: 'custom-toast',
        });
        throw new Error('Expense ID is required for updating');
      }

      await deleteExpense(expenseId);
      toast.success('Expense has been deleted!', {
        position: "top-center",
        className: 'custom-toast',
      });
      setDeleteModalOpen(false);
      fetchExpenseList();
    } catch (error) {
      console.error('Error deleting the expense:', error);
      toast.error('Failed to update the expense record. Please try again.', {
        position: "top-center",
        className: 'custom-toast',
      });
    } finally {
      setModalLoading(false);
    }
  }

  
  useEffect(() => {
    fetchExpenseList();
  }, []);

  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
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
  }, [isModalOpen, isDeleteModalOpen]);


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
    isEditMode,
    saveExpense,
    isModalLoading,
    toggleDeleteModal,
    isDeleteModalOpen,
    selectedExpense,
    removeExpense
  };
}