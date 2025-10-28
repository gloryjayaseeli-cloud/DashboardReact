import { React, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../popup/popup';
import {
    viewProjectDetails, selectProjectDetails,
    selectProjectsStatus
} from '../../features/ProjectSlice/project';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserRole } from '../../features/UserSlice/user';
import { Spinner } from 'react-bootstrap';

function ViewProject() {
    const role = useSelector(selectUserRole)

    const { projectID } = useParams();
    const [projectDetails, setProjectDetails] = useState();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState({});
    const [showModal, setShowModal] = useState(false)
    const projectDetailsList = useSelector(selectProjectDetails)
    const loading=useSelector(selectProjectsStatus)
    const dispatch = useDispatch();
    const StatusObj = {
        'completed': "Completed",
        'in_progress': "In Progress",
        'blocked': "Blocked",
        'new': "New",
        'not_started': "Not Started"
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

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowModal(!showModal)
    };

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [])


    useEffect(() => {
        if (projectID) {
            dispatch(viewProjectDetails(projectID))
        }

    }, [projectID, showModal]);

    useEffect(() => {
        setProjectDetails(projectDetailsList?.data)
        setTasks(projectDetailsList?.data?.tasks)
    }, [projectDetailsList])

    const navigate = useNavigate()

    return (
        
        <div>
             {loading==="loading" && (
                <div className="loading-overlay">
                    <Spinner animation="border" variant="light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            <main className="container dashContainer my-5">
                <div>
                    <button className={`btn btn-purple btn-icon`} onClick={() => { navigate(`/dashboard`) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </button>
                    <h3 style={{ textAlign: 'center' }}>Your project details</h3>
                </div>

                <div className="card details-card shadow-sm">
                    <div className="card-body p-4">
                        <div className='col-12'>

                            <div className='row'>

                                <div className='col-6'>

                                    <div className="flex justify-content-between align-items-start mb-4">
                                        <div className='row'>
                                            <h5 className=" mb-1 "> <div className='uppercase capitalize-first'>{(projectDetails?.name)} </div></h5>
                                            <p className="text-muted">{projectDetails?.description}</p>
                                        </div>


                                        <div className='row'>
                                            <h6 className=" uppercase ">Owner</h6>
                                            <p className="">{projectDetails?.owner || 'N/A'}</p>
                                        </div>
                                        <div className="">
                                            <div>
                                                <h6 className="uppercase ">Start Date</h6>
                                                <p className="">{(projectDetails?.start_date)}</p>
                                            </div>
                                            <div>
                                                <h6 className="uppercase ">End Date</h6>
                                                <p className="">{(projectDetails?.end_date)}</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className='col-6'>

                                    {tasks?.length > 0 ? (
                                        <div className="col-12">
                                            <label className="form-label"> <h5>Tasks</h5></label>

                                            <div className="list-group mb-3">
                                                {tasks?.map(task => (
                                                    <a href="#" key={task.id} onClick={(e) => { e.preventDefault(); handleTaskClick(task); }} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedTask && selectedTask.id === task.id ? 'active' : ''}`}>
                                                        {task.description}
                                                        <div>
                                                            <span className={`badge rounded-pill status-badge ${getStatusBadgeClass(task.status)}`}>{StatusObj[task.status]}</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                        :
                                        <>
                                            {role === "admin" ?
                                                <div>No task added, please edit the project to add tasks</div> :
                                                <div>You dont have any task in this project</div>
                                            }
                                        </>
                                    }

                                </div>
                                <div className="d-flex justify-content-end">
                                    {role === "admin" && <button className="bgbtn2 " style={{ width: "30%" }} onClick={() => { navigate(`/editProject/${projectID}`) }}>
                                        <i className="bi bi-pencil-square me-2"></i>Edit Project
                                    </button>}
                                </div>
                            </div>
                        </div>



                    </div>
                </div>
            </main>
            <Popup show={showModal} setShowModal={setShowModal} task={selectedTask} action={role !== "admin" ? "Edit" : "View"} />
        </div>

    )
}

export default ViewProject;
