import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../alertMessage/AlertMessage';
import { Container, Button, Card, Spinner, Row, Col } from 'react-bootstrap';
import {
    createProject, selectAllProjects, selectProjectDetails, selectProjectError,
    selectProjectsStatus
} from '../../features/ProjectSlice/project';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserRole, selectUserStatus, selectUserError } from '../../features/UserSlice/user';

function CreateProject() {
    const user = localStorage.getItem("userName")
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false)

    const userStatus = useSelector(selectUserStatus)
    const userError = useSelector(selectUserError)
    const ProjectStatus = useSelector(selectProjectsStatus)
    const ProjectError = useSelector(selectProjectError)

    const [project, setProject] = useState({
        owner: user,
        name: "",
        description: "",
        start_date: "",
        end_date: ""
    })
    const navigate = useNavigate()
    const projectDetailsList = useSelector(selectAllProjects)
    const role = useSelector(selectUserRole)
    const dispatch = useDispatch();

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'info'
    });
    useEffect(() => {
        if (ProjectStatus === "loading" || userStatus === "loading") {
            setLoading(true)
        }
        if (ProjectStatus === "succeeded" || userStatus === "succeeded" || projectDetailsList) {
            setLoading(false)
        }
    }, [ProjectStatus, userStatus, projectDetailsList])

    useEffect(() => {
        if (ProjectStatus === "failed") {
            (ProjectError || userError) && handleApiError("project is not created successfully")
            setLoading(false)
        }
    }, [ProjectError, userError, ProjectStatus])

    const handleChange = (e) => {
        setProject((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        scrollToTop()
        const finalPayload = {
            ...project,
            tasks: tasks
        };
        dispatch(createProject(finalPayload))
        navigate("/dashboard")
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
        setProject({
            owner: user,
            name: "",
            description: "",
            start_date: "",
            end_date: ""
        })
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

            <main className="container  dashContainer my-5">
                <div style={{ padding: "10px" }}>
                    <button className={`bgbtn`} onClick={() => { navigate(`/dashboard`) }}>

                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </button>
                </div>
                <div className="card form-card shadow-sm">
                    <div className="card-body p-4 p-lg-5">
                        <h1 className="h4 text-center mb-4">Create a New Project</h1>
                        <form >
                            <div className="row g-4">
                                <div className="col-12">
                                    <label htmlFor="projectName" className="form-label">Project Name</label>
                                    <input type="text" className="form-control" onChange={(e) => { handleChange(e) }} value={project.name} id="projectName" name="name" placeholder="e.g., Project Phoenix" required />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="projectDescription" className="form-label">Project Description</label>
                                    <textarea id="projectDescription" name="description" className="form-control" onChange={(e) => { handleChange(e) }} value={project.description} rows="4" placeholder="Provide a detailed description of the project..."></textarea>
                                </div>


                                <div className="col-md-6">
                                    <label htmlFor="startDate" className="form-label">Start Date</label>
                                    <input type="date" id="startDate" name="start_date" className="form-control" onChange={(e) => { handleChange(e) }} value={project.start_date} required />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="endDate" className="form-label">End Date</label>
                                    <input type="date" id="endDate" name="end_date" className="form-control" onChange={(e) => { handleChange(e) }} value={project.end_date} required />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="owner" className="form-label">Owner</label>
                                    <input type="text" id="owner" name="owner" className="form-control" onChange={(e) => { handleChange(e) }} value={project.owner} placeholder="e.g., Alice Johnson" required />
                                </div>

                                <div className="col-12">
                                    <hr />
                                </div>
                                <div className="col-12 text-center mt-4">
                                    <button type="submit" onClick={(e) => handleSubmit(e)} className="btn btn-violet px-5 py-2">
                                        Create Project
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};



export default CreateProject
