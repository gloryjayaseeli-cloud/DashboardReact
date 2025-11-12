


import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../popup/popup';
import AlertMessage from '../alertMessage/AlertMessage';
import { Spinner } from 'react-bootstrap';
import {
    viewProjectDetails, selectProjectDetails,
    selectProjectsStatus,
    selectProjectError,
    updateProject
} from '../../features/ProjectSlice/project';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserRole, } from '../../features/UserSlice/user';
import { createTask, deleteTask, selectAllTasks, updateTask, selectTaskError, selectTasksStatus } from '../../features/taskSlice/task';

function EditProject() {
    const user = localStorage.getItem("userName")
    const [tasks, setTasks] = useState([]);
    const [action, setAction] = useState()
    const [selectedTask, setSelectedTask] = useState(null);
    const navigate = useNavigate()
    const [projectDetails, setProjectDetails] = useState()
    const [Selectedproject, setSelectedproject] = useState({})
    const [method, setMethod] = useState("")
    const projectDetailsList = useSelector(selectProjectDetails)
    const dispatch = useDispatch();
    const Taskerror = useSelector(selectTaskError)
    const ProjectError = useSelector(selectProjectError)
    const TaskStatus = useSelector(selectTasksStatus)
    const ProjectStatus = useSelector(selectProjectsStatus)
    const loading = TaskStatus === "loading" || ProjectStatus === "loading"
    const role=useSelector(selectUserRole)
    const [TaskStateList, setTaskStateList] = useState(projectDetailsList?.data?.tasks)
    const StatusObj = {
        'completed': "Completed",
        'in_progress': "In Progress",
        'blocked': "Blocked",
        'new': "New",
        'not_started': "Not Started"
    }
    const [showModal, setShowModal] = useState(false)
    const { projectID, ProjectName } = useParams();
    const taskList = useSelector(selectAllTasks)
    const [lastAction, setLastAction] = useState(null);
    const [NewOnetask, setNewOneTask] = useState({
        id: "",
        project: ProjectName,
        description: "",
        due_date: "",
        status: "new",
        owner: user
    })
    const taskdet = useSelector(selectAllTasks)
    const TaskError = useSelector(selectTaskError);

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'info'
    });
    useEffect(() => {

        projectDetailsList && method === "PUT" && handleApiSuccess("project edited successfully")
        scrollToTop()
        setTaskStateList(taskList)
    }, [projectDetailsList, taskList])

    useEffect(() => {

        projectDetails && method === "PUT" && handleApiError("project is not edited successfully")
        scrollToTop()
    }, [ProjectError])

    useEffect(() => {
        if (lastAction) {
            handleApiSuccess(`Task ${lastAction} successfully!`);
            scrollToTop()
            setShowModal(false);
            setLastAction(null);
            setTaskStateList(prev => {
                return [

                    ...taskList
                ]
            })
        } else if (TaskStatus === 'failed' && lastAction) {
            handleApiError(TaskError || `Could not ${lastAction} task.`);
            scrollToTop()
            setLastAction(null);
        }
    }, [TaskStatus, TaskError, taskList]);


    useEffect(() => {
        setNewOneTask({
            id: "",
            project: ProjectName,
            description: "",
            due_date: "",
            status: "new",
            owner: user
        })
    }, [taskList])



    useEffect(() => {
        setProjectDetails(projectDetailsList?.data)
        setTasks(projectDetailsList?.tasks)
    }, [projectDetailsList])

    const handleChange = (e) => {
        
        setSelectedproject((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    }



    useEffect(() => {
        setSelectedproject(projectDetails)
        setTasks(projectDetails?.tasks)

    }, [projectDetails])


    const handleTaskUpdate = (e) => {
        if (projectID) {
            dispatch(updateTask({ projectId: projectID, taskId: selectedTask?.id, taskData: selectedTask }))
        }
        setShowModal(!showModal)
    }

    const handleDelete = (e) => {

        if (projectID) {
            dispatch(deleteTask({ projectId: projectID, taskId: selectedTask?.id }))
            setLastAction('deleted');
        }
        setShowModal(!showModal)

    }

    const handleTaskChange = (e) => {
        if (e.target.name === "status") {
            setSelectedTask((prev) => {
                return {
                    ...prev,
                    [e.target.name]: e.target.value
                }
            })
        }
        else {
            setSelectedTask((prev) => {
                return {
                    ...prev,
                    [e.target.name]: e.target.value
                }
            })
        }
    }

    const handleTaskClick = (task) => {
        setSelectedTask(prevSelectedTask => prevSelectedTask && prevSelectedTask.id === task.id ? null : task);
        setShowModal(!showModal)
        setAction("Edit")

    };

    const handleCreateTask = () => {
        setShowModal(!showModal)
        setAction("Create")


    }
    const handleCreateTaskWithData = (data) => {
        let formulatedData = {
            ...data,
            status: data?.status ? data.status : "new"
        }
        dispatch(createTask({ projectId: projectID, taskData: formulatedData }))
        setLastAction('created');
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed': return 'badge-completed';
            case 'in_progress': return 'badge-in-progress';
            case 'blocked': return 'badge-blocked';
            case 'new': return 'badge-new';
            case 'not_started': return 'badge-not-started';
            default: return 'bg-secondary';
        }
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        const finalPayload = {
            ...Selectedproject,
            tasks: tasks
        };
        dispatch(updateProject({ id: projectID, projectData: finalPayload }))
        setMethod("PUT")
        scrollToTop()
        navigate(`/dashboard`)
    };

    const handleApiSuccess = (msg) => {
        setAlert({
            show: true,
            message: `${msg} ✅`,
            variant: 'success'
        });
    };

    const handleApiError = (msg) => {
        setAlert({
            show: true,
            message: `${msg} ❌`,
            variant: 'danger'
        });
    };


    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

    const scrollToTop = () => {


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <Spinner animation="border" variant="light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            {alert.show && (
                <AlertMessage
                    variant={alert.variant}
                    message={alert.message}
                    onClose={closeAlert}
                />
            )}

            <main className="container dashContainer my-5">
                <div className="d-flex align-items-center mb-4">
                    <button className={`btn btn-purple btn-icon me-3`} onClick={() => { navigate(`/viewProject/${projectID}`) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </button>
                    <h3 className="mb-0">Edit Your project details</h3>
                </div>

                <div className="card project-header-card shadow-sm mb-4">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label htmlFor='name' className="form-label">Project Name</label>
                                    <input type="text" className="form-control" id="name" name="name" onChange={(e) => handleChange(e)} value={Selectedproject?.name} placeholder="e.g., Project Phoenix" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="projectDescription" className="form-label">Project Description</label>
                                    <textarea className="form-control" id="projectDescription" name="description" onChange={(e) => handleChange(e)} value={Selectedproject?.description} rows="4" placeholder="Provide a detailed description of the project..."></textarea>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="startDate" className="form-label">Start Date</label>
                                        <input type="date" className="form-control" id="startDate" name="start_date" onChange={(e) => handleChange(e)} value={Selectedproject?.start_date} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="endDate" className="form-label">End Date</label>
                                        <input type="date" className="form-control" id="endDate" name="end_date" onChange={(e) => handleChange(e)} value={Selectedproject?.end_date} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="owner" className="form-label">Owner</label>
                                    <input type="text" className="form-control" id="owner" name="owner" disabled={role==="TaskCreator"} onChange={(e) =>{ 
                                        
                                        handleChange(e)}} value={Selectedproject?.owner} placeholder="e.g., Alice Johnson" required />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Tasks</h3>
                    <button className="btn btn-purple" onClick={(e) => {
                        e.preventDefault();
                        handleCreateTask()
                    }}>
                        <i className="bi bi-plus-lg me-2"></i>Add Task
                    </button>
                </div>

                {TaskStateList?.length > 0 ? (
                    <div className="row">
                        {TaskStateList.map(task => (
                            <div className="col-md-6 col-lg-4 mb-4" key={task.id}>
                                <div
                                    className="card task-card h-100 shadow-sm"
                                    onClick={(e) => { e.preventDefault(); handleTaskClick(task); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-body d-flex flex-column">
                                        <p className="card-text fw-bold mb-3">{task.description}</p>
                                        
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-circle me-2" viewBox="0 0 16 16">
                                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                                </svg>
                                                <span className="text-muted small">Owner: {task.owner || 'Unassigned'}</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event me-2" viewBox="0 0 16 16">
                                                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                                </svg>
                                                <span className="text-muted small">Due: {task.due_date || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <span className={`badge rounded-pill status-badge ${getStatusBadgeClass(task.status)}`}>
                                                {StatusObj[task.status]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-4 border rounded bg-light text-muted">
                        <p className="mb-0">No tasks added yet. Click "Add Task" to get started.</p>
                    </div>
                )}
                <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-purple" style={{minWidth: '200px'}} onClick={(e) => {
                        handleSubmit(e)
                    }}>
                        Save Changes
                    </button>
                </div>

            </main>
            <Popup show={showModal} setShowModal={setShowModal} task={selectedTask} NewOnetask={NewOnetask} setNewOneTask={setNewOneTask} action={action} handleTaskChange={handleTaskChange} handleTaskUpdate={handleTaskUpdate} handleDelete={handleDelete} handleCreateTaskWithData={handleCreateTaskWithData} projectDetails={projectDetails}/>

        </div>
    );
};



export default EditProject

