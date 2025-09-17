import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import useApi from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';
import { Spinner } from 'react-bootstrap';
import AlertMessage from './AlertMessage';

export default function ProjectDashboard() {
    const navigate = useNavigate()
    const { role } = useAuth()

    const [projects, setProjects] = React.useState([]);

    const [getProjects, { data: projectSet, loading, error }] = useApi();
    const [getUsers, { data: UserList, UserLoading, UserError }] = useApi();
    const API_URL = `${config.api.baseUrl}/projects/`
    const [DeleteProjects, { data: Delprojects, loading:Delloading, error:Delerror }] = useApi();


    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'info'
    });

    useEffect(() => {

        Delprojects && handleApiSuccess("project Deleted successfuly")

      
    }, [Delprojects])

    useEffect(() => {

        Delerror && handleApiError("project is not Deleted successfuly")


    }, [Delerror])

    useEffect(() => {
        let UserAPI = `${config.api.baseUrl}/users/`
        let data = getProjects(API_URL, "GET");
        getUsers(UserAPI, "GET")

    }, [Delprojects]);
    useEffect(() => {
        setProjects(projectSet)

    }, [projectSet])
    const user = localStorage.getItem("userName")
    const handleDelete = (projectId) => {
        let data = DeleteProjects(`${API_URL}${projectId}/`, "DELETE");
        if (Delprojects?.message) {
            setProjects(currentProjects =>
                currentProjects.filter(project => project?.id !== projectId)
            );
        }

    }


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
            {Delloading && (
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
            <main className="container my-5">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    { role ==="admin" ? <h4> projects list</h4>:<h4 className="h4 mb-0"  > Your Projects</h4>}
                    {role === "admin" &&
                        <button className="btn btn-violet d-flex align-items-center" onClick={() => {
                            navigate("/projects")
                        }}>
                            <i className="bi bi-plus-lg me-2"></i>
                            Create Project
                        </button>
                    }
                </div>

                {
                    projects?.length <= 0 && <div> Your dont have any projects as of now, please contact your admin</div>
                }
                <div className="row g-4">
                    {projects?.map(project => (
                        <div className="col-lg-4 col-md-6" key={project?.id}>
                            <div className="card project-card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold text-dark">{project?.name}</h5>
                                    <p className="card-text text-muted flex-grow-1">{project?.description}</p>

                                    <div className="row small text-muted my-3">
                                        <div className="col">
                                            <strong>Start:</strong> {new Date(project?.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="col text-end">
                                            <strong>End:</strong> {new Date(project?.end_date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div>
                                            <h6 className="small text-uppercase text-muted mb-1">Owner</h6>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center owner-avatar fw-bold me-2">
                                                    {project?.owner[0].toUpperCase()}
                                                </div>
                                                <span className="fw-medium">{project?.owner}</span>
                                            </div>
                                        </div>

                                        {role === "admin" && <button onClick={() => {
                                            handleDelete(project?.id);
                                        }} className="btn btn-white">Delete</button>
                                        }
                                        <button onClick={() => {
                                            navigate(`/viewProject/${project?.id}`);

                                        }} className="btn btn-violet">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );

}


