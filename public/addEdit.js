import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showJobs } from "./jobs.js";

let addEditDiv = null;
let company = null;
let position = null;
let status = null;
let addingJob = null;

/* ////////////////////////////////////////////////// */
export const handleAddEdit = () => {
    addEditDiv = document.getElementById("edit-job");

    company = document.getElementById("company");

    position = document.getElementById("position");

    status = document.getElementById("status");

    addingJob = document.getElementById("adding-job");

    const editCancel = document.getElementById("edit-cancel");

    //
    addEditDiv.addEventListener("click", async (e) => {
        //
        if (inputEnabled && e.target.nodeName === "BUTTON") {
            //
            if (e.target === addingJob) {
                //
                enableInput(false);

                let method = "POST";
                let url = "/api/v1/jobs";

                // trường hợp tên button "add" đổi thành "update"
                if (addingJob.textContent === "update") {
                    method = "PATCH";

                    url = `/api/v1/jobs/${addEditDiv.dataset.id}`;
                }

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            company: company.value,
                            position: position.value,
                            status: status.value,
                        }),
                    });

                    const data = await response.json();
                    console.log("Create Job = ", data);

                    //
                    if (response.status === 200 || response.status === 201) {
                        //
                        if (response.status === 200) {
                            // a 200 is expected for a successful update
                            message.textContent = "The job entry was updated.";
                        } else {
                            // a 201 is expected for a successful create
                            message.textContent = "The job entry was created.";
                        }

                        company.value = "";
                        position.value = "";
                        status.value = "pending";

                        showJobs();
                    } else {
                        message.textContent = data.msg;
                    }
                } catch (err) {
                    console.log(err);
                    message.textContent = "A communication error occurred.";
                }

                //
                enableInput(true);
                //
            } else if (e.target === editCancel) {
                //
                message.textContent = "";

                // Chú ý là quay lại trang show table of job
                showJobs();
            }
        }
    });
};

/////////////////////////////////////////////////////////
/* 
Chú ý: Mỗi lần gọi hàm showAddEdit() thì có 2 trường hợp

1) Nếu không truyền argument jobId thì reset value của <input>

2) nếu truyền argument jobId thì sẽ truy cập lại vô Database để lấy
1 jobId về và show ra cho Client xem

*/
export const showAddEdit = async (jobId) => {
    //
    if (!jobId) {
        company.value = "";
        position.value = "";
        status.value = "pending";

        addingJob.textContent = "add";

        message.textContent = "";

        setDiv(addEditDiv);
        //
    } else {
        //
        enableInput(false);

        try {
            const response = await fetch(`/api/v1/jobs/${jobId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            // console.log(data);

            if (response.status === 200) {
                company.value = data.job.company;
                position.value = data.job.position;
                status.value = data.job.status;

                // thay đổi tên gọi của button ==>> chú ý là tên ban đầu là "add"
                // Chỉ tên gọi thay đổi chứ id vẫn là <button type="button" id="add-job">
                addingJob.textContent = "update";

                message.textContent = "";
                addEditDiv.dataset.id = jobId;

                setDiv(addEditDiv);
            } else {
                // might happen if the list has been updated since last display
                message.textContent = "The jobs entry was not found";

                //
                showJobs();
            }
        } catch (err) {
            console.log(err);

            message.textContent = "A communications error has occurred.";

            //
            showJobs();
        }

        enableInput(true);
    }
};
