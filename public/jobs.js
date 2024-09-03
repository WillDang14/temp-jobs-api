import {
    inputEnabled,
    setDiv,
    message,
    setToken,
    token,
    enableInput,
} from "./index.js";

import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit } from "./addEdit.js";

let jobsDiv = null;
let jobsTable = null;
let jobsTableHeader = null;

/* ////////////////////////////////////////////////// */
export const handleJobs = () => {
    jobsDiv = document.getElementById("jobs");

    const logoff = document.getElementById("logoff");
    const addJob = document.getElementById("add-job");

    jobsTable = document.getElementById("jobs-table");
    jobsTableHeader = document.getElementById("jobs-table-header");

    jobsDiv.addEventListener("click", (e) => {
        //
        if (inputEnabled && e.target.nodeName === "BUTTON") {
            //
            if (e.target === addJob) {
                //
                showAddEdit(null);
                //
            } else if (e.target === logoff) {
                // xóa token đi
                setToken(null);

                message.textContent = "You have been logged off.";

                jobsTable.replaceChildren([jobsTableHeader]);

                showLoginRegister();
            } else if (e.target.classList.contains("editButton")) {
                //
                message.textContent = "";

                showAddEdit(e.target.dataset.id);
                //
            } else if (e.target.classList.contains("deleteButton")) {
                //
                enableInput(false);

                deleteJobs(e.target.dataset.id);

                enableInput(true);
            }
        }
    });
};

///////////////////////////////////////////////////////////////
// Chú ý: mỗi lần gọi đến hàm showJobs()
// là đều sẽ truy cập đến database
// ==>>  tức là sẽ lấy data về Client
export const showJobs = async () => {
    //
    try {
        enableInput(false);

        const response = await fetch("/api/v1/jobs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log("List Data Job = ", data);

        let children = [jobsTableHeader];

        if (response.status === 200) {
            if (data.count === 0) {
                //
                jobsTable.replaceChildren(...children); // clear this for safety
                //
            } else {
                for (let i = 0; i < data.jobs.length; i++) {
                    //
                    let rowEntry = document.createElement("tr");

                    let editButton = `<td><button type="button" class="editButton" data-id=${data.jobs[i]._id}>edit</button></td>`;

                    let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.jobs[i]._id}>delete</button></td>`;

                    let rowHTML = `
                                <td>${data.jobs[i].company}</td>
                                <td>${data.jobs[i].position}</td>
                                <td>${data.jobs[i].status}</td>
                                <div>${editButton}${deleteButton}</div>`;

                    // Gán data mới tạo ở trên vào Table row
                    rowEntry.innerHTML = rowHTML;

                    //
                    children.push(rowEntry);
                }

                jobsTable.replaceChildren(...children);
            }
        } else {
            message.textContent = data.msg;
        }
    } catch (err) {
        console.log(err);

        message.textContent = "A communication error occurred.";
    }

    enableInput(true);

    setDiv(jobsDiv);
};

///////////////////////////////////////////////////////////////
const deleteJobs = async (jobId) => {
    // jobId = "66d62c2108859ec7068897bb";
    // test error ==>> đúng ID syntax but sai số cuối
    // jobId = "66d62c2108859ec7068897bc";
    // jobId = "66d62c2108859ec7068897bbd";

    try {
        const response = await fetch(`/api/v1/jobs/${jobId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log("Delete message = ", data);

        if (response.status === 200) {
            message.textContent = data.msg;
        } else {
            //
            message.textContent = "The job entry was not found!";
        }

        showJobs();
        //
    } catch (err) {
        console.log(err);

        message.textContent = "A communications error has occurred.";

        //
        showJobs();
    }
};
