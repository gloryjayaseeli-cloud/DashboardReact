
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../popup/popup';
import {
    viewProjectDetails, selectProjectDetails,
    selectProjectsStatus
} from '../../features/ProjectSlice/project';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserRole,selectUsername } from '../../features/UserSlice/user';
import { Spinner } from 'react-bootstrap';

function ViewProject() {
    const role = useSelector(selectUserRole)

    const { projectID } = useParams();
    const [projectDetails, setProjectDetails] = useState();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState({});
    const [showModal, setShowModal] = useState(false)
    const projectDetailsList = useSelector(selectProjectDetails)
    const loading = useSelector(selectProjectsStatus)
    const [descriptionFilter, setDescriptionFilter] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("");
    const dispatch = useDispatch();
    let user= useSelector(selectUsername)
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

    const filteredTasks = useMemo(() => {
        console.log(">>>>",ownerFilter,descriptionFilter)
        if (!tasks) return [];

        const lowerDescFilter = descriptionFilter.toLowerCase();
        const lowerOwnerFilter = ownerFilter.toLowerCase();

        return tasks.filter(task => {
            const descriptionMatch = task.description
                ? task.description.toLowerCase().includes(lowerDescFilter)
                : true; 
            const taskOwner = (task.owner || "unassigned").toLowerCase();
            const ownerMatch = taskOwner.includes(lowerOwnerFilter);
            
            return descriptionMatch && ownerMatch;
        });
    }, [tasks, descriptionFilter, ownerFilter]); 

    return (

        <div>
            {loading === "loading" && (
                <div className="loading-overlay">
                    <Spinner animation="border" variant="light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            <main className="container dashContainer my-5">
                <div className="d-flex justify-content-end mt-4">
                    {(role === "Admin") && (
                        <button className="btn btn-purple" style={{ width: "20%" }} onClick={() => { navigate(`/editProject/${projectID}`) }}>
                            <i className="bi bi-pencil-square me-2"></i>Edit Project 
                        </button>
                    )}
                    {
                          (role==="TaskCreator" && projectDetails?.owner===user) &&    
                          <button className="btn btn-purple" style={{ width: "20%" }} onClick={() => { navigate(`/editProject/${projectID}`) }}>
                            <i className="bi bi-pencil-square me-2"></i>Edit Project 
                        </button>
                    
                    }
                </div>
                <div className="d-flex align-items-center mb-4">
                    <button className="btn btn-purple btn-icon me-3" onClick={() => { navigate(`/dashboard`) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </button>
                    <h3 className="mb-0">Your project details</h3>
                </div>

                 <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-md-5 mb-3 mb-md-0">
                                <h5 className="uppercase capitalize-first mb-1">{projectDetails?.name}</h5>
                                <p className="text-muted mb-0">{projectDetails?.description}</p>
                            </div>

                            <div className="col-md-2 mb-3 mb-md-0">
                                <h6 className="uppercase text-muted small">Owner</h6>
                                <p className="mb-0">{projectDetails?.owner || 'N/A'}</p>
                            </div>

                            <div className="col-md-2 mb-3 mb-md-0">
                                <h6 className="uppercase text-muted small">Start Date</h6>
                                <p className="mb-0">{(projectDetails?.start_date)}</p>
                            </div>

                            <div className="col-md-3">
                                <h6 className="uppercase text-muted small">End Date</h6>
                                <p className="mb-0">{(projectDetails?.end_date)}</p>
                            </div>
                        </div>
                    </div>
                <hr/>
                
                <h3 className="mb-3">Tasks</h3>
                   <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <label htmlFor="taskNameFilter" className="form-label text-muted small">Filter by Task Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="taskNameFilter"
                            placeholder="e.g., Design homepage"
                            value={descriptionFilter}
                            onChange={(e) => setDescriptionFilter(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="ownerNameFilter" className="form-label text-muted small">Filter by Owner</label>
                        <input
                            type="text"
                            className="form-control"
                            id="ownerNameFilter"
                            placeholder="e.g., Alice Johnson or Unassigned"
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                        />
                    </div>
                </div>
                {filteredTasks?.length > 0 ? (
                    <div className="row">
                         {filteredTasks.map(task => (
                            <div className="col-md-6 col-lg-4 mb-4" key={task.id}>
                                <div
                                    className="card task-card h-100 shadow-sm"
                                    onClick={() => handleTaskClick(task)}
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
                                                <span className="text-muted small">Due Date: {task.due_date || 'N/A'}</span>
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
                        {role === "Admin" ?
                            <p className="mb-0">No task added, please edit the project to add tasks</p> :
                            <p className="mb-0">You don't have any task in this project</p>
                        }
                    </div>
                )}


           

            </main>
            <Popup show={showModal} setShowModal={setShowModal} task={selectedTask} action={role === "Admin" ? "View" :  (role==="TaskCreator" && projectDetails?.owner===user) ?  "View" : (role==="TaskCreator" && projectDetails?.owner!==user)? "Edit" : role==="Viewer" && "Edit"}  projectDetails={projectDetails}/>
        </div>

    )
}

export default ViewProject;