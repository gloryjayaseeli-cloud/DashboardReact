import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

import AlertMessage from './AlertMessage';
import { selectUserRole } from "../features/user";
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchProjects,
    createProject,
    deleteProject,
    selectAllProjects,
    selectProjectsStatus,
    selectProjectError
} from '../features/project';
import { selectAuthToken } from '../features/auth';



export default function ProjectDashboard() {
    const navigate = useNavigate()
    const role = useSelector(selectUserRole)
    const user = localStorage.getItem("userName")
    const status = useSelector(selectProjectsStatus);
    const error = useSelector(selectProjectError);

    const dispatch = useDispatch();
    const projectList = useSelector(selectAllProjects);
    const token = useSelector(selectAuthToken);
    console.log("projlist", projectList)
    useEffect(() => {
        if (token) {
            dispatch(fetchProjects());
        }
    }, [dispatch, token]);
    const [deletingProjectId, setDeletingProjectId] = useState(null);


    const [projects, setProjects] = React.useState([]);

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'info'
    });

    useEffect(() => {
        if (status === 'succeeded' && !projectList.some(p => p.id === deletingProjectId)) {
            if (deletingProjectId) {
                handleApiSuccess("Project deleted successfully");
                setDeletingProjectId(null);
            }
        } else if (status === 'failed') {
            handleApiError(error || "An unknown error occurred");
        }
    }, [status, error, projectList]);

    useEffect(() => {
        setProjects(projectList)

    }, [projectList])


    const handleDelete = (projectId) => {
        setDeletingProjectId(projectId);
        dispatch(deleteProject(projectId));
        scrollToTop()
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

            {alert.show && (
                <AlertMessage
                    variant={alert.variant}
                    message={alert.message}
                    onClose={closeAlert}
                />
            )}
            <main className="container my-5">
                {role === "admin" ? <h4> Projects List</h4> : <h4 className="h4 mb-0"  > Your Projects</h4>}

                <div className="d-flex justify-content-end align-items-right mb-4">
                    {role === "admin" &&
                        <>
                            <button className="btn btn-violet " style={{ margin: "10px" }} onClick={() => {
                                navigate("/projects")
                            }}>
                                <i className="bi bi-plus-lg me-2"></i>
                                Create Project
                            </button>

                            <button className="btn btn-violet d-flex" style={{ margin: "10px" }} onClick={() => {
                                navigate("/admin")
                            }}>
                                <i className="bi bi-plus-lg me-2"></i>
                                Manage Users
                            </button>
                        </>
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


