import React from 'react';
import './Expenses.scss';
import { MdArrowRightAlt, MdClose, MdOutlinePostAdd, MdEdit, MdDelete } from "react-icons/md";
import { ReactComponent as ExpensesIcon } from '../../assets/images/expenses-clean.svg';
import { ExpenseHook } from '../../hooks/ExpenseHook';
import {
    Table, TableHead, TableBody, TableCell, TableRow, TableSortLabel, TablePagination, Paper,
    TableContainer, Skeleton
} from "@mui/material";
import moment from 'moment';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';

const Expenses = () => {
    const {
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
    } = ExpenseHook();

    return (
        <div className="expenses-container">
            <div className="expenses-display">
                <div className="icon">
                    <ExpensesIcon className="item-display" />
                </div>
                <div className="display-container">
                    <div className="display-title">
                        Easily tracky the expenses of your laundromat business.
                    </div>
                    <div className="display-subtitle">
                        Managed your expenses by recording it and viewing it effortlessly.
                    </div>
        
                    <button className='btn-generate' onClick={() => toggleModal(null)}>
                        <span> Record an Expense </span>
                        <MdArrowRightAlt className="arrow-icon" />
                    </button>
                </div>
            </div>

            <div className="expenses-record">
                <h2> Expense Records </h2>
                <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={0}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "date"}
                                            direction={orderBy === "date" ? order : "asc"}
                                            onClick={!isLoading ? () => handleSort("date") : undefined}
                                        >
                                            DATE
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "category"}
                                            direction={orderBy === "category" ? order : "asc"}
                                            onClick={!isLoading ? () => handleSort("category") : undefined}
                                        >
                                            CATEGORY
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "description"}
                                            direction={orderBy === "description" ? order : "asc"}
                                            onClick={!isLoading ? () => handleSort("description") : undefined}
                                        >
                                            DESCRIPTION
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "expensePrice"}
                                            direction={orderBy === "expensePrice" ? order : "asc"}
                                            onClick={!isLoading ? () => handleSort("expensePrice") : undefined}
                                        >
                                            TOTAL
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell className='column-label-actions'>
                                        <TableSortLabel>
                                            ACTIONS
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        {[...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Skeleton />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton animation="wave" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton animation={false} />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton animation={false} />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton animation={false} />
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </>
                                ) : (
                                    paginatedRows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{moment(new Date(row.date)).format('MMMM D, YYYY')}</TableCell>
                                            <TableCell>{row.category}</TableCell>
                                            <TableCell>{row.description}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('en-PH', {
                                                    style: 'currency',
                                                    currency: 'PHP',
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(row.expensePrice)}
                                            </TableCell>
                                            <TableCell className='column-actions'>
                                                <button className='btn-edit' onClick={() => toggleModal(row)}> Edit </button>
                                                <button className='btn-delete' onClick={() => toggleDeleteModal(row)}> Delete </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {!isLoading && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            component="div"
                            count={expenseList.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    )}
                </Paper>
            </div>

            <Modal
                animationType="fade"
                isOpen={isModalOpen}
                onRequestClose={() => toggleModal(null)}
                shouldCloseOnOverlayClick={false}
                className='custom-modal'
                overlayClassName='custom-modal-overlay'
            >
                <div className="modal-container">
                    <div className="header">
                        <div className="icon">
                            {isEditMode ? <MdEdit size={30} color="#17588E" /> : <MdOutlinePostAdd size={30} color="#17588E" />}
                        </div>
                        <h2> {isEditMode ? 'Edit an Expense' : 'Record an Expense'} </h2>
            
                        <div 
                            className={`icon close-icon ${isModalLoading ? 'disabled' : ''}`}
                            onClick={() => toggleModal(null)}
                        >
                            <MdClose size={15} color="#000" />
                        </div>
                    </div>
        
                    <div className="separator"></div>
                    
                    <div className="content">
                        <div className="form-row">
                            <div className="field-container">
                                <label> Category </label>
                                <select value={category} onChange={handleCategoryChange} className="form-select">
                                    <option value="" disabled>
                                        Select a category
                                    </option>
                                    {expenseCategories.map((item, index) => (
                                        <option key={index} value={item.description}>
                                            {item.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field-container">
                                <label>Description</label>
                                {category === 'Supplies' || category === 'Utilities' ? (
                                    <select value={description} onChange={handleDescriptionChange} className="form-select">
                                        <option value="" disabled>
                                            Select a description
                                        </option>
                                        {expenseCategories
                                            .find((item) => item.description === category)
                                            ?.items?.map((item, index) => (
                                                <option key={index} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                        className="form-input"
                                        placeholder="Enter a description"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="field-container">
                                <label> Total Price </label>
                                <input 
                                    type="number" 
                                    value={totalPrice}
                                    onChange={handleTotalPriceChange}
                                    placeholder='Enter Total Price'
                                />
                            </div>

                            <div className="field-container">
                                <label> Date </label>
                                <input 
                                    type="date"
                                    className="input"
                                    value={date}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
            
                        <button 
                            className={`btn-generate ${isModalLoading ? 'disabled' : ''}`}
                            disabled={isModalLoading}
                            onClick={() => saveExpense()}
                        >
                            {isModalLoading ? ( <div className="spinner"></div>) : (
                                isEditMode ? 'Edit Expense' : 'Record Expense'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                animationType="fade"
                isOpen={isDeleteModalOpen}
                onRequestClose={() => toggleDeleteModal(null)}
                shouldCloseOnOverlayClick={false}
                className='custom-modal'
                overlayClassName='custom-modal-overlay'
            >
                <div className="modal-container">
                    <div className="header">
                        <div className="icon delete">
                            <MdDelete size={30} color="#B64D49" />
                        </div>
                        <h2 className="h2-delete"> Delete an Expense </h2>
            
                        <div 
                            className={`icon close-icon ${isModalLoading ? 'disabled' : ''}`}
                            onClick={() => toggleDeleteModal(null)}
                        >
                            <MdClose size={15} color="#000" />
                        </div>
                    </div>
        
                    <div className="separator"></div>
                    <div className="content delete">
                        <div className="content-title">
                            Are you sure you want to delete this record?
                        </div>
                        <div className="row">
                            <label> Date: </label>
                            <span> {moment(new Date(selectedExpense?.date)).utcOffset(8).format('LL')} </span>
                        </div>
                        <div className="row">
                            <label> Category: </label>
                            <span> {selectedExpense?.category} </span>
                        </div>
                        <div className="row">
                            <label> Description: </label>
                            <span> {selectedExpense?.description ? selectedExpense.description : 'N/A'} </span>
                        </div>
                        <div className="row">
                            <label> Price: </label>
                            <span> 
                                { 
                                    new Intl.NumberFormat('en-PH', {
                                        style: 'currency',
                                        currency: 'PHP',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(selectedExpense?.expensePrice)
                                }
                            </span>
                        </div>
                        <button 
                            className={`btn-delete ${isModalLoading ? 'disabled' : ''}`}
                            disabled={isModalLoading}
                            onClick={() => removeExpense()}
                        >
                            {isModalLoading ? ( <div className="spinner delete"></div>) : (
                               'Confirm Deletion'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
}

export default Expenses;
