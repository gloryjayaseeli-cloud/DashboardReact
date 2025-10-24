import { useEffect, useState } from 'react'
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
import { selectUserRole } from '../../features/UserSlice/user';
import { React } from 'react';
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
                <div>

                    <button className={`btn btn-purple btn-icon`} onClick={() => { navigate(`/viewProject/${projectID}`) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </button>
                    <h5 style={{ textAlign: 'center' }}>Edit Your project details</h5>
                </div>
                <div className="card form-card shadow-sm">
                    <div className="card-body p-4 p-lg-5">
                     

                        <div className="row g-4">

                            <div className='col-6'>

                            <div className="col-12">
                                <label htmlFor='name' className="form-label">Project Name</label>
                                <input type="text" className="form-control" id="name" name="name" onChange={(e) => handleChange(e)} value={Selectedproject?.name} placeholder="e.g., Project Phoenix" required />
                            </div>


                            <div className="col-12">
                                <label htmlFor="projectDescription" className="form-label">Project Description</label>
                                <textarea className="form-control" id="projectDescription" name="description" onChange={(e) => handleChange(e)} value={Selectedproject?.description} rows="4" placeholder="Provide a detailed description of the project..."></textarea>
                            </div>


                            <div className="col-md-6">
                                <label htmlFor="startDate" className="form-label">Start Date</label>
                                <input type="date" className="form-control" id="startDate" name="start_date" onChange={(e) => handleChange(e)} value={Selectedproject?.start_date} required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="endDate" className="form-label">End Date</label>
                                <input type="date" className="form-control" id="endDate" name="end_date" onChange={(e) => handleChange(e)} value={Selectedproject?.end_date} required />
                            </div>

                            <div className="col-12">
                                <label htmlFor="owner" className="form-label">Owner</label>
                                <input type="text" className="form-control" id="owner" name="owner" onChange={(e) => handleChange(e)} value={Selectedproject?.owner} placeholder="e.g., Alice Johnson" required />
                            </div>

                            </div>
                            <div className='col-6'>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h4 mb-0">Tasks</h2>
                                <button className="btn btn-violet" onClick={(e) => {
                                    e.preventDefault();
                                    handleCreateTask()
                                }}>
                                    <i className="bi bi-plus-lg me-2"></i>Add Task
                                </button>
                            </div>

                            <div className="list-group mb-4">
                                {TaskStateList?.map(task => (
                                    <a href="#" key={task.id} onClick={(e) => { e.preventDefault(); handleTaskClick(task); }} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedTask && selectedTask.id === task.id ? 'active' : ''}`}>
                                        <span>{task?.description}</span>
                                        <span className={`badge rounded-pill status-badge ${getStatusBadgeClass(task.status)}`}>{StatusObj[task.status]}</span>
                                    </a>
                                ))}
                            </div>
                                </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" className="bgbtn2" onClick={(e) => {
                                    handleSubmit(e)
                                }}>
                                    Edit Project
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Popup show={showModal} setShowModal={setShowModal} task={selectedTask} NewOnetask={NewOnetask} setNewOneTask={setNewOneTask} action={action} handleTaskChange={handleTaskChange} handleTaskUpdate={handleTaskUpdate} handleDelete={handleDelete} handleCreateTaskWithData={handleCreateTaskWithData} />

        </div>
    );
};



export default EditProject
