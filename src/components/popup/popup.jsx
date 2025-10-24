import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { selectUserRole } from '../../features/UserSlice/user';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, updateTask } from '../../features/taskSlice/task';


const Modal = ({ show, onHide, children }) => {

    if (!show) {
        return null;
    }
    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onHide}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '15px',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            lineHeight: '1',
                            color: 'black',
                            cursor: 'pointer',
                            zIndex: 10
                        }}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.Header = ({ children }) => (
    <div className="modal-header">
        <h5 className="modal-title">{children}</h5>
    </div>
);


Modal.Title = ({ children }) => <>{children}</>;
Modal.Body = ({ children }) => <div className="modal-body">{children}</div>;
Modal.Footer = ({ children }) => <div className="modal-footer">{children}</div>;



function Popup(props) {
    const role = useSelector(selectUserRole)
    const [editordata, setEditorData] = useState()
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState()
    const { handleTaskChange } = props
    const task = props?.NewOnetask
    const setTask = props?.setNewOneTask
    const user = localStorage.getItem("userName")
    const { projectID } = useParams();
    const dispatch = useDispatch()
    const StatusObj = {
        'completed': "Completed",
        'in_progress': "In Progress",
        'blocked': "Blocked",
        'new': "New",
        'not_started': "Not Started"
    }

    const handleClose = () => {
        props.setShowModal(false)
    }
    const handleShow = () => setShowModal(true);

    useEffect(() => {
        setShowModal(props.show)
        setData(props.task)
        setEditorData(props?.task)
    }, [props, props.task])



    const EditorhandleTaskUpdate = (e) => {
        if (projectID) {
           dispatch(updateTask({ projectId: projectID, taskId: editordata?.id, taskData: editordata }))


        }
        setShowModal(!showModal)
        props.setShowModal(!props.show)
    }

    const EditorhandleDelete = (e) => {

        if (projectID) {
            dispatch(deleteTask({ projectId: projectID, taskId: editordata?.id }))

        }
        setShowModal(!showModal)
        props.setShowModal(!props.show)


    }


    const getStatusClass = (currentStatus) => {
        switch (currentStatus) {

            case 'Completed': return 'completed';
            case 'In Progress': return 'in_progress';
            case 'Blocked': return 'blocked';
            case 'New': return 'new';
            case 'Not Started': return 'not_started';
            default: return '';
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        props.handleCreateTaskWithData(task);
        setShowModal(!showModal);
        props.setShowModal(!props.show)
    };

    const handleChange = (e) => {
        setTask((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    }

    const EditorhandleTaskChange = (e) => {
        if (e.target.name === "status") {
            setEditorData((prev) => {
                return {
                    ...prev,
                    [e.target.name]: e.target.value
                }
            })
        }
        else {
            setEditorData((prev) => {
                return {
                    ...prev,
                    [e.target.name]: e.target.value
                }
            })
        }
    }


    return (
        <>
            <style>{`
        .btn-purple {
            background-color: #6f42c1;
            color: white;
            border: none;
            padding: 0.5rem 1.25rem;
            font-weight: 500;
        }
        .btn-purple:hover {
            background-color: #5a3d9a;
        }
        .modal-content {
            position: relative; /* Required for absolute positioning of the close button */
            border-radius: 0.75rem; /* Rounded corners for the modal */
            border: none;
        }
        .btn {
            border-radius: 9999px; /* Pill-shaped buttons */
        }
        .modal-header, .modal-footer {
            border: none;
        }
    `}</style>

            <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', fontFamily: 'sans-serif' }}>


                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header>
                        <Modal.Title>{props?.action}{""} Task</Modal.Title>
                    </Modal.Header>
                    {props.action === "View" &&
                        <Modal.Body>

                            <div className="row-lg-2">
                                <label htmlFor="task-status" className="form-label">Task Description</label>
                                <input type="text" className="form-control" id="task-name" name='description' value={data?.description} onChange={(e) => { { } }} />


                            </div>
                            <div className="row-lg-2">
                                <label htmlFor="task-status" className="form-label">Status</label>

                                <input type="text" className="form-control" id="task-assignee" name='status' value={StatusObj[data?.status]} onChange={(e) => { }} />

                            </div>
                            <div className="row-lg-2">
                                <label htmlFor="task-assignee" className="form-label">Owner</label>
                                <input type="text" className="form-control" id="task-assignee" name='owner' value={data?.owner} onChange={(e) => { }} />
                            </div>
                            <div className="row-lg-2">
                                <label htmlFor="task-due-date" className="form-label">Due Date</label>
                                <input type="date" className="form-control" id="task-due-date" name='due_date' value={data?.due_date} onChange={(e) => { }} />
                            </div>


                        </Modal.Body>
                    }
                    {(props.action === "Edit" && role === "admin") ?
                        <Modal.Body>
                            <h3>Assign task</h3>
                            <div className="card task-card bg-light mt-4">
                                <div className="card-body p-3">


                                    <div className="row-lg-3">
                                        <label htmlFor="task-name" className="form-label">Task Description</label>
                                        <input type="text" className="form-control" id="task-name" name='description' value={data?.description} onChange={(e) => handleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-status" className="form-label">Status</label>
                                        <select className="form-select" id="task-status" name='status' onChange={(e) => handleTaskChange(e)} value={data?.status} >

                                            <option value="new" name="new">New</option>
                                            <option name="not_stated" value="not_started">Not Started</option>
                                            <option value="in_progress" name="in_progress">In Progress</option>
                                            <option name="blocked" value="blocked">Blocked</option>
                                            <option value="completed" name="completed">Completed</option>

                                        </select>
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-assignee" className="form-label">Owner</label>
                                        <input type="text" className="form-control" id="task-assignee" name='owner' value={data?.owner} onChange={(e) => handleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-due-date" className="form-label">Due Date</label>
                                        <input type="date" className="form-control" id="task-due-date" name='due_date' value={data?.due_date} onChange={(e) => handleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-3 py-4 text-end align-self-end">
                                        <button onClick={(e) => props.handleTaskUpdate(e)} className="btn btn-violet me-2">Update</button>
                                        <button onClick={(e) => props.handleDelete(e)} className="btn btn-outline-danger">Delete</button>
                                    </div>

                                </div>
                            </div>
                        </Modal.Body>
                        :
                        role !== "admin" && (<Modal.Body>
                            <div className="card task-card bg-light mt-4">
                                <div className="card-body p-3">


                                    <div className="row-lg-3">
                                        <label htmlFor="task-name" className="form-label">Task Description</label>
                                        <input type="text" className="form-control" id="task-name" name='description' value={editordata?.description} onChange={(e) => EditorhandleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-status" className="form-label">Status</label>
                                        <select className="form-select" id="task-status" name='status' onChange={(e) => EditorhandleTaskChange(e)} value={editordata?.status} >

                                            <option value="new" name="new">New</option>
                                            <option name="not_stated" value="not_started">Not Started</option>
                                            <option value="in_progress" name="in_progress">In Progress</option>
                                            <option name="blocked" value="blocked">Blocked</option>
                                            <option value="completed" name="completed">Completed</option>

                                        </select>
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-assignee" className="form-label">Owner</label>
                                        <input type="text" className="form-control" id="task-assignee" name='owner' value={editordata?.owner} onChange={(e) => EditorhandleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-2">
                                        <label htmlFor="task-due-date" className="form-label">Due Date</label>
                                        <input type="date" className="form-control" id="task-due-date" name='due_date' value={editordata?.due_date} onChange={(e) => EditorhandleTaskChange(e)} />
                                    </div>
                                    <div className="row-lg-3 py-4 text-end align-self-end">
                                        <button onClick={(e) => EditorhandleTaskUpdate(e)} className="btn btn-violet me-2">Update</button>
                                        {/* <button onClick={(e) => EditorhandleDelete(e)} className="btn btn-outline-danger">Delete</button> */}
                                    </div>

                                </div>
                            </div>
                        </Modal.Body>
                        )
                    }

                    {
                        props.action === "Create" &&
                        <>
                            <div className="card task-card bg-light mt-4">
                                <div className="card-body p-3">


                                    <div className="row-lg-3">
                                        <label htmlFor="description" className="form-label">Task Description</label>
                                        <textarea className="form-control" id="description" name="description" onChange={handleChange} value={task?.description} rows="3" placeholder="Add a more detailed description..."></textarea>
                                    </div>
                                    <div className="row-md-6">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            className={`form-select status-select ${getStatusClass(task?.status)}`}
                                            value={task?.status}
                                            onChange={handleChange}
                                        >
                                            <option value="new" name="new">New</option>
                                            <option name="not_stated" value="not_started">Not Started</option>
                                            <option value="in_progress" name="in_progress">In Progress</option>
                                            <option name="blocked" value="blocked">Blocked</option>
                                            <option value="completed" name="completed">Completed</option>
                                        </select>
                                    </div>


                                    <div className="row-md-6">
                                        <label htmlFor="assignee" className="form-label">Owner</label>
                                        <input type="text" className="form-control" id="assignee" name="owner" onChange={handleChange} value={task?.owner} placeholder="e.g., Alice Johnson" required />
                                    </div>


                                    <div className="row-md-6">
                                        <label htmlFor="dueDate" className="form-label">Due Date</label>
                                        <input type="date" className="form-control" id="due_date" name="due_date" onChange={handleChange} value={task?.due_date} required />
                                    </div>

                                    <div className="row-12 text-center mt-5">
                                        <button onClick={(event) => handleSubmit(event)} className="btn btn-violet px-5">
                                            <i className="bi bi-check-lg me-2"></i>Save Task
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </>

                    }

                </Modal>
            </div>
        </>
    );
}

export default Popup;





