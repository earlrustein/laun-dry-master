import React from 'react';
import './Dashboard.scss';
import { MdReport, MdFilePresent, MdArrowRightAlt,
  MdLocalLaundryService, MdOutlineTrendingUp, MdClose, } from "react-icons/md";
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
import Modal from 'react-modal';
import { ReactComponent as WashingIcon } from '../../assets/images/washing-icon.svg';
import { DashboardHook } from '../../hooks/DashboardHook';
import { ToastContainer } from 'react-toastify';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
Modal.setAppElement('#root');

const Dashboard = () => {
  const {
    salesFilter,
    handleChange,
    toggleModal,
    totalSales,
    totalExpenses,
    salesFilterOptions,
    totalTransaction,
    options,
    salesChartData,
    expenseChartData,
    pieOptions,
    isModalOpen,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    chartRef,
    processReport,
    isLoading
  } = DashboardHook();

  return (
    <div className="dashboard-container">
      <div className="dashboard-display">
        <div className="icon">
          <WashingIcon className="item-display" />
        </div>
        <div className="display-container">
          <div className="display-title">
            Simplify the management of your laundromat operations.
          </div>
          <div className="display-subtitle">
            Track sales effortlessly and keep your expenses organized.
          </div>

          <button className='btn-generate' onClick={toggleModal}>
            <span> Generate Report </span>
            <MdArrowRightAlt className="arrow-icon" />
          </button>
        </div>
      </div>

      <div className="dashboard-actions-container">
        <h2> Reports </h2>
        <div className="dashboard-filter-container">
          <select className="dashboard-filter" value={salesFilter} onChange={handleChange}>
            <option value="1">Today</option>
            <option value="2">Last 7 Days</option>
            <option value="3">Last 6 Months</option>
            <option value="4">Last 6 Years</option>
          </select>
        </div>
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

            <div 
              className={`icon close-icon ${isLoading ? 'disabled' : ''}`}
              onClick={toggleModal}
            >
              <MdClose size={15} color="#000" />
            </div>
          </div>

          <div className="separator">
          </div>
         
          <div className="content">
            <div className="form-row">
              <div className="field-container">
                <label> Start Date </label>
                  <input 
                    type="date" 
                    className="input"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
              </div>

              <div className="field-container">
                <label> End Date </label>
                <input 
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
            <button 
              className={`btn-generate ${isLoading ? 'disabled' : ''}`}
              onClick={processReport} 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;