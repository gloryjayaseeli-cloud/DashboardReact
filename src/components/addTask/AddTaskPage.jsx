import { React, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../config/config";
import { useDispatch } from 'react-redux';
import { createTask } from '../../features/taskSlice/task';


const AddTaskPage = () => {

    const user = localStorage.getItem("userName")
    const [status, setStatus] = useState('');
    const dispatch = useDispatch();

    const { projectID, ProjectName } = useParams();
    const [task, setTask] = useState({
        id: "",
        project: ProjectName,
        description: "",
        due_date: "",
        status: "",
        owner: user
    })
    const StatusObj = {
        'completed': "Completed",
        'in_progress': "In Progress",
        'blocked': "Blocked",
        'new': "New",
        'not_started': "Not Started"
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
        dispatch(createTask({ projectId: projectID, taskData: task }))
    };

    const handleChange = (e) => {
        setTask((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    }
    return (
        <div>

            <main className="container my-5">
                <div className="card form-card shadow-sm">
                    <div className="card-body p-4 p-lg-5">
                        <h1 className="h2 text-center mb-4">Add a New Task</h1>

                        <div className="row g-4">

                            <div className="col-12">
                                <label htmlFor="taskDescription" className="form-label">Task Description</label>
                                <textarea className="form-control" id="taskDescription" name="description" onChange={handleChange} value={task?.description} rows="3" placeholder="Add a more detailed description..."></textarea>
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="status" className="form-label">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    className={`form-select status-select ${getStatusClass(task?.status)}`}
                                    value={StatusObj[task?.status]}
                                    onChange={handleChange}
                                >
                                    <option value="new" name="new">New</option>
                                    <option name="not_stated" value="not_started">Not Started</option>
                                    <option value="in_progress" name="in_progress">In Progress</option>
                                    <option name="blocked" value="blocked">Blocked</option>
                                    <option value="completed" name="completed">Completed</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="assignee" className="form-label">Assignee</label>
                                <input type="text" className="form-control" id="assignee" name="owner" onChange={handleChange} value={task?.owner} placeholder="e.g., Alice Johnson" required />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="due_date" className="form-label">Due Date</label>
                                <input type="date" className="form-control" id="due_date" name="due_date" onChange={handleChange} value={task?.due_date} required />
                            </div>


                            <div className="col-12 text-center mt-5">
                                <button onClick={(event) => handleSubmit(event)} className="btn btn-violet px-5">
                                    <i className="bi bi-check-lg me-2"></i>Save Task
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );

}
export default AddTaskPage;


