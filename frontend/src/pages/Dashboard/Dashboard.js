import React, { useRef, useEffect, useState, useMemo } from 'react';
import './Dashboard.scss';
import { MdReport, MdFilePresent, MdLocalLaundryService, MdOutlineTrendingUp, MdClose } from "react-icons/md";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import moment from 'moment';
import { firestore } from '../../config/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Modal from 'react-modal';


ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
Modal.setAppElement('#root');

const Dashboard = () => {
  const chartRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [salesFilter, setSalesFilter] = useState('1');
  const [totalSales, setTotalSales] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalTransaction, setTotalTransaction] = useState(0);
  const [startDate, setStartDate] = useState(moment().utcOffset(8).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().utcOffset(8).format('YYYY-MM-DD'));
  
  const salesFilterOptions = [
    { label: 'Today', value: '1'},
    { label: 'Last 7 Days', value: '2' },
    { label: 'Last 6 Months', value: '3' },
    { label: 'Last 6 Years', value: '4' },
  ];

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const processReport = () => {
    console.log(startDate);
    console.log(endDate);
  }

  const transformDataForLineChart = (orderList, salesFilter) => {
    let startDate;
    let labelCount = 7;
    let labelFormat = "MMM D";
    let xAxisTitle = '';
  
    switch (salesFilter) {
      case '1':
        startDate = moment().utcOffset(8).startOf('day');
        labelCount = 2;
        break;
      case '2':
        startDate = moment().subtract(6, 'days').utcOffset(8).startOf('day');
        labelCount = 7;
        break;
      case '3':
        startDate = moment().subtract(5, 'months').utcOffset(8).startOf('month');
        labelCount = 6;
        labelFormat = "MMM YYYY";
        break;
      case '4':
        startDate = moment().subtract(5, 'years').utcOffset(8).startOf('year');
        labelCount = 6;
        labelFormat = "YYYY";
        break;
      default:
        startDate = moment().subtract(6, 'days').utcOffset(8).startOf('day');
        labelCount = 7;
        break;
    }
  
    const labels = Array.from({ length: labelCount }, (_, i) => {
      return startDate.clone().add(i, salesFilter === '1' || salesFilter === '2' ? 'days' : salesFilter === '3' ? 'months' : 'years').format(labelFormat);
    });
  
    const data = Array(labelCount).fill(0);
    let totalTransaction = 0;
  
    orderList.forEach((item) => {
      const orderDate = moment.unix(item.orderDate?.seconds).utcOffset(8).startOf('day');
      const diff = orderDate.diff(startDate, salesFilter === '1' || salesFilter === '2' ? 'days' : salesFilter === '3' ? 'months' : 'years');
  
      if (diff >= 0 && diff < labelCount) {
        data[diff] += item.orderTotalPrice;
        totalTransaction++;
      }
    });
  
    const total = data.reduce((sum, value) => sum + value, 0);
  
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor:[`rgba(23, 88, 142, 1)`],
          borderWidth: 0,
          strokeWidth: 2,
          label: null
        },
      ],
      total,
      totalTransaction,
      xAxisTitle,
    };
  };

  const transformDataForPieChart = (list) => {
    if (!list || list.length === 0) return { labels: [], datasets: [] }; // Guard clause for empty list

    const filteredList = list.filter((expense) => {
      const expenseDate = moment(new Date(expense.date.seconds * 1000)).utcOffset(8);
      const currentDate = moment().utcOffset(8);

      if (salesFilter === '1') {
        return expenseDate.isSame(currentDate, 'day');
      } else if (salesFilter === '2') {
        const sevenDaysAgo = moment().utcOffset(8).startOf('day').subtract(7, 'days');
        return expenseDate.isAfter(sevenDaysAgo);
      } else if (salesFilter === '3') {
        const sixMonthsAgo = moment().utcOffset(8).startOf('day').subtract(6, 'months');
        return expenseDate.isAfter(sixMonthsAgo);
      } else if (salesFilter === '4') {
        const fiveYearsAgo = moment().utcOffset(8).startOf('day').subtract(5, 'years');
        return expenseDate.isAfter(fiveYearsAgo);
      }

      return true;
    });

    const groupedData = filteredList.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.expensePrice;
      return acc;
    }, {});

    const totalPrice = Object.values(groupedData).reduce((total, value) => total + value, 0);
    setTotalExpenses(totalPrice);

    const sortedCategory = Object.fromEntries(
      Object.entries(groupedData).sort(([, a], [, b]) => b - a)
    );

    const labels = Object.keys(sortedCategory).map((category) => {
      const price = sortedCategory[category];
      return `${category} (₱${price})`;
    });
    const data = Object.values(sortedCategory);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Expense Categories',
          data: data,
          backgroundColor: labels.map((_, index) => getRedShade(index)),
          hoverOffset: 4,
        },
      ],
    };
  };

  const getRedShade = (index) => {
    const redShades = [
      '#FF6384', '#FF6A5C', '#FF473A', '#FF244C', '#FF1E4D', '#FF4565', '#FF99CC',
    ];
    return redShades[index % redShades.length];
  };

  const expenseChartData = useMemo(() => {
    if (expenseList && expenseList.length > 0) {
      return transformDataForPieChart(expenseList);
    }
    return { labels: [], datasets: [] };
  }, [expenseList, salesFilter]);

  const salesChartData = useMemo(() => transformDataForLineChart(orderList, salesFilter), [orderList, salesFilter]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value, index) => salesChartData.labels[index],
          color: 'rgba(23, 88, 142, 1)'
        },
      },
      x: {
        title: {
          display: true,
          text: salesChartData.xAxisTitle
        },
        ticks: {
          callback: (value) => `₱${value}`,
          color: 'rgba(23, 88, 142, 1)'
        },
        grid: {
          display: false 
        }
      },
    },
    plugins: {
      title: {
        display: false
      },
      legend: {
        display: false,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const price = `₱${value}`;
            return `${label}: ${price}`;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    }
  };

  const handleChange = (event) => {
    setSalesFilter(event.target.value);
  };

  useEffect(() => {
    const fetchOrderList = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'laundryOrders'));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrderList(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchOrderList();
  }, []);

  const fetchExpenseList = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'laundryExpenses'));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenseList(items);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchExpenseList();
  }, []);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    setTotalSales(salesChartData.total);
    setTotalTransaction(salesChartData.totalTransaction);
  }, [salesChartData]);


  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Dashboard</h2>

      <div className="dashboard-actions-container">
        <div className="dashboard-filter-container">
          <select className="dashboard-filter" value={salesFilter} onChange={handleChange}>
            <option value="1">Today</option>
            <option value="2">Last 7 Days</option>
            <option value="3">Last 6 Months</option>
            <option value="4">Last 6 Years</option>
          </select>
        </div>

        <button className='btn-generate' onClick={toggleModal}>
          Generate Report
        </button>
      </div>

      <div className="dashboard-small-container">
        <div className="dashboard-small-card overall-revenue">
          <div className="header">
            <div className="icon">
              <MdOutlineTrendingUp size={20} color="#17588E" />
            </div>
            <span className="header-text overall-revenue">Overall Revenue</span>
          </div>
          <div className="content overall-revenue">
            <span className="content-total">
              { 
                new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalSales-totalExpenses)
              }
            </span>
            <span className="content-filter overall-revenue">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>
        </div>
        <div className="dashboard-small-card">
          <div className="header">
            <div className="icon total-gross">
              <span>₱</span>
            </div>
            <span className="header-text">Total Gross Sales</span>
          </div>
          <div className="content">
            <span className="content-total">{ 
                      new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(totalSales)
                    }
            </span>
            <span className="content-filter">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>
        </div>

        <div className="dashboard-small-card">
          <div className="header">
            <div className="icon total-transaction">
              <MdLocalLaundryService size={20} color="#17588E" />
            </div>
            <span className="header-text">Total Transactions</span>
          </div>
          <div className="content">
            <span className="content-total">{totalTransaction}</span>
            <span className="content-filter">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>
        </div>

        <div className="dashboard-small-card">
          <div className="header">
            <div className="icon total-expenses">
              <MdReport size={20} color="#B64D49" />
            </div>
            <span className="header-text total-expenses">Total Expenses</span>
          </div>
          <div className="content total-expenses">
            <span className="content-total">
             { 
                new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalExpenses)
              }
            </span>
            <span className="content-filter">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-big-container">
        <div className="dashboard-big-card sales-report">
          <div className="header">
              <span className="header-title">Sales Report</span>
              <span className="header-filter">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>

          <div className="chart-container">
            {totalSales !== 0 ? (
               <Bar
               data={salesChartData} 
               options={options}
               ref={chartRef}
             />
            ) : (
              <div className='no-available-data'>
                No sales data available for the selected filter.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-big-card sales-report">
          <div className="header">
              <span className="header-title">Expenses Report</span>
              <span className="header-filter">{salesFilterOptions[parseInt(salesFilter)-1].label}</span>
          </div>

          <div className="chart-container">
            {totalExpenses !== 0 ? (
              <Pie data={expenseChartData} options={pieOptions}  />

            ) : (
              <div className='no-available-data'>
                No expenses data available for the selected filter.
              </div>
            )}
          </div>
        </div>
      </div>


      <Modal
        animationType="fade"
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        contentLabel="Generate Report Modal"
        shouldCloseOnOverlayClick={false}
        className='custom-modal'
        overlayClassName='custom-modal-overlay'
      >
        <div className="modal-container">
          <div className="header">
            <div className="icon">
              <MdFilePresent size={30} color="#17588E" />
            </div>
            <h2> Generate a Report </h2>

            <div className="icon close-icon" onClick={toggleModal}>
              <MdClose size={15} color="#000" />
            </div>
          </div>

          <div className="separator">
          </div>
         
          <div className="content">
            <div className="date-inputs-container">
              <div className="date-input">
                <label> Start Date </label>
                <input 
                  type="date" 
                  className="input"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>

              <div className="date-input">
                <label> End Date </label>
                <input 
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
              
            </div>

            <button className='btn-generate' onClick={processReport}>
              Generate Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;