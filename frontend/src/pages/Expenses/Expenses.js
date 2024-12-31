import React from 'react';
import './Expenses.scss';
import { MdArrowRightAlt, MdClose, MdOutlinePostAdd  } from "react-icons/md";
import { ReactComponent as ExpensesIcon } from '../../assets/images/expenses.svg';
import { ExpenseHook } from '../../hooks/ExpenseHook';
import {
    Table, TableHead, TableBody, TableCell, TableRow, TableSortLabel, TablePagination, Paper,
    TableContainer, Skeleton
} from "@mui/material";
import moment from 'moment';
import Modal from 'react-modal';

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
        handleDescriptionChange
    } = ExpenseHook();

    return (
        <div className="expenses-container">
            <div className="expenses-display">
                <ExpensesIcon className="item-display" />
                <div className="display-container item-display">
                    <div className="display-title">
                        Easily tracky the expenses of your laundromat business.
                    </div>
                    <div className="display-subtitle">
                        Managed your expenses by recording it and viewing it effortlessly.
                    </div>
        
                    <button className='btn-generate' onClick={toggleModal}>
                        <span> Record an Expense </span>
                        <MdArrowRightAlt className="arrow-icon" />
                    </button>
                </div>
            </div>

            <div className="expenses-record">
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
                                                <button className='btn-edit'> Edit </button>
                                                <button className='btn-delete'> Delete </button>
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
                onRequestClose={toggleModal}
                shouldCloseOnOverlayClick={false}
                className='custom-modal'
                overlayClassName='custom-modal-overlay'
            >
                <div className="modal-container">
                    <div className="header">
                        <div className="icon">
                            <MdOutlinePostAdd  size={30} color="#17588E" />
                        </div>
                        <h2> Record an Expense </h2>
            
                        <div 
                            className={`icon close-icon ${isLoading ? 'disabled' : ''}`}
                            onClick={toggleModal}
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
                            <div className="date-input">
                                <label> Date </label>
                                <input 
                                    type="date"
                                    className="input"
                                    value={date}
                                    onChange={handleDateChange}
                                />
                            </div>
                            </div>
                        </div>
            
                        <button 
                            className={`btn-generate ${isLoading ? 'disabled' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                            <div className="spinner"></div>
                            ) : (
                                'Record Expense'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Expenses;
