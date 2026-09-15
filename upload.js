/* =====================================================
   SECURE DMS - UPLOAD SYSTEM
   IndexedDB File Storage
   Unified Database Version 2
===================================================== */


/* =====================================================
   DATABASE SETTINGS
===================================================== */

const DB_NAME = "SecureDMS";
const DB_VERSION = 2;

const DOCUMENT_STORE = "documents";
const LOG_STORE = "accessLogs";


/* =====================================================
   GET LOGGED-IN USER
===================================================== */

const storedUser = sessionStorage.getItem("loggedInUser");

if (!storedUser) {
    window.location.href = "login.html";
}


/* =====================================================
   USER DATA
===================================================== */

let currentUser = null;

if (storedUser) {

    try {

        currentUser = JSON.parse(storedUser);

    } catch (error) {

        console.error("User session error:", error);

        sessionStorage.clear();

        window.location.href = "login.html";
    }
}


/* =====================================================
   SHOW LOGGED-IN USER
===================================================== */

if (currentUser) {

    const userName =
        currentUser.name ||
        currentUser.username ||
        "User";

    const userRole =
        currentUser.role ||
        "user";


    /* ---------------------------------------------
       TOP USER NAME
    --------------------------------------------- */

    const topUserName =
        document.getElementById("topUserName");

    if (topUserName) {

        topUserName.textContent = userName;

    }


    /* ---------------------------------------------
       USER AVATAR
    --------------------------------------------- */

    const userAvatar =
        document.getElementById("userAvatar");

    if (userAvatar) {

        userAvatar.textContent =
            userName.charAt(0).toUpperCase();

    }


    /* ---------------------------------------------
       USER ROLE
    --------------------------------------------- */

    const roleNames = {

        admin: "Administrator",

        forensic_team: "Forensic Team",

        police_staff: "Police Staff",

        investigator: "Investigator"

    };


    const topUserRole =
        document.getElementById("topUserRole");

    if (topUserRole) {

        topUserRole.textContent =
            roleNames[userRole] || "User";

    }
}


/* =====================================================
   GET ELEMENTS
===================================================== */

const fileInput =
    document.getElementById("fileInput");

const fileName =
    document.getElementById("fileName");

const dropArea =
    document.getElementById("dropArea");

const uploadForm =
    document.getElementById("uploadForm");


/* =====================================================
   SELECTED FILE
===================================================== */

let selectedFile = null;


/* =====================================================
   FILE INPUT
===================================================== */

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            if (
                this.files &&
                this.files.length > 0
            ) {

                selectedFile = this.files[0];

                showFileName(selectedFile);

            }

        }
    );
}


/* =====================================================
   SHOW FILE NAME
===================================================== */

function showFileName(file) {

    if (!fileName || !file) {
        return;
    }

    const sizeMB =
        (
            file.size /
            (1024 * 1024)
        ).toFixed(2);

    fileName.textContent =
        file.name +
        " (" +
        sizeMB +
        " MB)";

}


/* =====================================================
   DRAG OVER
===================================================== */

if (dropArea) {

    dropArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            dropArea.classList.add("drag-over");

        }
    );


    /* =================================================
       DRAG LEAVE
    ================================================= */

    dropArea.addEventListener(
        "dragleave",
        function () {

            dropArea.classList.remove("drag-over");

        }
    );


    /* =================================================
       DROP FILE
    ================================================= */

    dropArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            dropArea.classList.remove("drag-over");


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                selectedFile = files[0];


                /* -------------------------------------
                   UPDATE FILE INPUT
                ------------------------------------- */

                try {

                    if (
                        typeof DataTransfer !== "undefined"
                    ) {

                        const dataTransfer =
                            new DataTransfer();

                        dataTransfer.items.add(
                            selectedFile
                        );

                        if (fileInput) {

                            fileInput.files =
                                dataTransfer.files;

                        }

                    }

                } catch (error) {

                    console.log(
                        "Could not update file input."
                    );

                }


                showFileName(selectedFile);

            }

        }
    );

}


/* =====================================================
   OPEN DATABASE
===================================================== */

function openDatabase() {

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            /* -----------------------------------------
               DATABASE UPGRADE
            ------------------------------------------ */

            request.onupgradeneeded =
                function (event) {

                    const db =
                        event.target.result;

                    const transaction =
                        event.target.transaction;


                    /* =================================
                       DOCUMENT STORE
                    ================================= */

                    let documentStore;


                    if (
                        !db.objectStoreNames.contains(
                            DOCUMENT_STORE
                        )
                    ) {

                        documentStore =
                            db.createObjectStore(
                                DOCUMENT_STORE,
                                {
                                    keyPath: "id",
                                    autoIncrement: true
                                }
                            );

                    } else {

                        documentStore =
                            transaction.objectStore(
                                DOCUMENT_STORE
                            );

                    }


                    /* =================================
                       DOCUMENT INDEXES
                    ================================= */

                    if (
                        !documentStore.indexNames.contains(
                            "uploadedByUsername"
                        )
                    ) {

                        documentStore.createIndex(
                            "uploadedByUsername",
                            "uploadedByUsername",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !documentStore.indexNames.contains(
                            "uploadedBy"
                        )
                    ) {

                        documentStore.createIndex(
                            "uploadedBy",
                            "uploadedBy",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !documentStore.indexNames.contains(
                            "uploadDate"
                        )
                    ) {

                        documentStore.createIndex(
                            "uploadDate",
                            "uploadDate",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !documentStore.indexNames.contains(
                            "category"
                        )
                    ) {

                        documentStore.createIndex(
                            "category",
                            "category",
                            {
                                unique: false
                            }
                        );

                    }


                    /* =================================
                       ACCESS LOG STORE
                    ================================= */

                    let logStore;


                    if (
                        !db.objectStoreNames.contains(
                            LOG_STORE
                        )
                    ) {

                        logStore =
                            db.createObjectStore(
                                LOG_STORE,
                                {
                                    keyPath: "id",
                                    autoIncrement: true
                                }
                            );

                    } else {

                        logStore =
                            transaction.objectStore(
                                LOG_STORE
                            );

                    }


                    /* =================================
                       ACCESS LOG INDEXES
                    ================================= */

                    if (
                        !logStore.indexNames.contains(
                            "username"
                        )
                    ) {

                        logStore.createIndex(
                            "username",
                            "username",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !logStore.indexNames.contains(
                            "userName"
                        )
                    ) {

                        logStore.createIndex(
                            "userName",
                            "userName",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !logStore.indexNames.contains(
                            "action"
                        )
                    ) {

                        logStore.createIndex(
                            "action",
                            "action",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !logStore.indexNames.contains(
                            "timestamp"
                        )
                    ) {

                        logStore.createIndex(
                            "timestamp",
                            "timestamp",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !logStore.indexNames.contains(
                            "time"
                        )
                    ) {

                        logStore.createIndex(
                            "time",
                            "time",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !logStore.indexNames.contains(
                            "expiresAt"
                        )
                    ) {

                        logStore.createIndex(
                            "expiresAt",
                            "expiresAt",
                            {
                                unique: false
                            }
                        );

                    }

                };


            /* -----------------------------------------
               DATABASE SUCCESS
            ------------------------------------------ */

            request.onsuccess =
                function (event) {

                    const db =
                        event.target.result;


                    db.onversionchange =
                        function () {

                            db.close();

                        };


                    resolve(db);

                };


            /* -----------------------------------------
               DATABASE ERROR
            ------------------------------------------ */

            request.onerror =
                function (event) {

                    console.error(
                        "IndexedDB error:",
                        event.target.error
                    );

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


/* =====================================================
   UPLOAD FORM
===================================================== */

async function handleUpload(event) {

    event.preventDefault();


    /* -----------------------------------------
       CHECK USER
    ------------------------------------------ */

    if (!currentUser) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;

    }


    /* -----------------------------------------
       GET FILE
    ------------------------------------------ */

    let file = selectedFile;


    if (
        !file &&
        fileInput &&
        fileInput.files &&
        fileInput.files.length > 0
    ) {

        file =
            fileInput.files[0];

    }


    /* -----------------------------------------
       FILE REQUIRED
    ------------------------------------------ */

    if (!file) {

        alert(
            "Please choose a document first."
        );

        return;

    }


    /* -----------------------------------------
       GET FORM ELEMENTS
    ------------------------------------------ */

    const titleInput =
        document.getElementById(
            "documentTitle"
        );

    const categoryInput =
        document.getElementById(
            "category"
        );

    const accessInput =
        document.getElementById(
            "accessLevel"
        );


    /* -----------------------------------------
       FORM VALUES
    ------------------------------------------ */

    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const category =
        categoryInput
            ? categoryInput.value
            : "Other";

    const accessLevel =
        accessInput
            ? accessInput.value
            : "Restricted";


    /* -----------------------------------------
       TITLE REQUIRED
    ------------------------------------------ */

    if (!title) {

        alert(
            "Please enter document title."
        );

        if (titleInput) {
            titleInput.focus();
        }

        return;

    }


    /* -----------------------------------------
       FILE SIZE
       MAXIMUM 50 MB
    ------------------------------------------ */

    const MAX_FILE_SIZE =
        50 * 1024 * 1024;


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        alert(
            "File size must be less than 50 MB."
        );

        return;

    }


    /* -----------------------------------------
       ALLOWED FILE TYPES
    ------------------------------------------ */

    const allowedExtensions = [

        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png"

    ];


    const fileParts =
        file.name.split(".");


    const extension =
        fileParts.length > 1
            ? fileParts
                .pop()
                .toLowerCase()
            : "";


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        alert(
            "File type not supported.\n\n" +
            "Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG"
        );

        return;

    }


    /* -----------------------------------------
       UPLOAD BUTTON
    ----------------------------------------- */

    const uploadButton =
        document.querySelector(
            ".encrypt-btn"
        );


    const originalButtonText =
        uploadButton
            ? uploadButton.innerHTML
            : "";


    if (uploadButton) {

        uploadButton.disabled = true;

        uploadButton.innerHTML =
            "⏳ Saving Document...";

    }


    /* -----------------------------------------
       CURRENT USER VALUES
    ----------------------------------------- */

    const username =
        String(
            currentUser.username || ""
        ).trim();


    const userName =
        currentUser.name ||
        username ||
        "User";


    const userRole =
        currentUser.role ||
        "user";


    /* -----------------------------------------
       VALIDATE USERNAME
    ----------------------------------------- */

    if (!username) {

        alert(
            "User session is invalid. Please login again."
        );


        if (uploadButton) {

            uploadButton.disabled = false;

            uploadButton.innerHTML =
                originalButtonText;

        }

        return;

    }


    /* =================================================
       CREATE TIMESTAMP
    ================================================= */

    const nowISO =
        new Date().toISOString();


    const expiresAt =
        new Date(
            Date.now() +
            (
                30 *
                24 *
                60 *
                60 *
                1000
            )
        ).toISOString();


    /* =================================================
       DOCUMENT DATA
    ================================================= */

    const documentData = {

        title: title,

        fileName: file.name,

        fileType:
            file.type ||
            "application/octet-stream",

        fileSize: file.size,

        file: file,

        category: category,

        accessLevel: accessLevel,

        uploadedBy: userName,

        uploadedByUsername: username,

        role: userRole,

        uploadDate: nowISO

    };


    /* =================================================
       SAVE DOCUMENT + ACCESS LOG
    ================================================= */

    try {

        const db =
            await openDatabase();


        /* -----------------------------------------
           CREATE ONE READWRITE TRANSACTION
        ------------------------------------------ */

        const transaction =
            db.transaction(
                [
                    DOCUMENT_STORE,
                    LOG_STORE
                ],
                "readwrite"
            );


        const documentStore =
            transaction.objectStore(
                DOCUMENT_STORE
            );


        const logStore =
            transaction.objectStore(
                LOG_STORE
            );


        /* =================================================
           SAVE DOCUMENT
        ================================================= */

        const documentRequest =
            documentStore.add(
                documentData
            );


        /* =================================================
           SAVE ACCESS LOG AFTER DOCUMENT ID
        ================================================= */

        documentRequest.onsuccess =
            function (event) {

                const documentId =
                    event.target.result;


                console.log(
                    "Document saved successfully. ID:",
                    documentId
                );


                /* -------------------------------------
                   ACCESS LOG DATA
                ------------------------------------- */

                const logData = {

                    username:
                        username,

                    userName:
                        userName,

                    role:
                        userRole,

                    action:
                        "Uploaded",

                    document:
                        file.name,

                    documentId:
                        documentId,

                    time:
                        nowISO,

                    timestamp:
                        nowISO,

                    expiresAt:
                        expiresAt,

                    status:
                        "Success"

                };


                console.log(
                    "Saving access log:",
                    logData
                );


                /* -------------------------------------
                   SAVE LOG
                ------------------------------------- */

                const logRequest =
                    logStore.add(
                        logData
                    );


                logRequest.onsuccess =
                    function () {

                        console.log(
                            "Access log saved successfully."
                        );

                    };


                logRequest.onerror =
                    function (event) {

                        console.error(
                            "Access log save error:",
                            event.target.error
                        );

                    };

            };


        documentRequest.onerror =
            function (event) {

                console.error(
                    "Document save error:",
                    event.target.error
                );

            };


        /* =================================================
           WAIT FOR TRANSACTION
        ================================================= */

        await new Promise(
            function (resolve, reject) {

                transaction.oncomplete =
                    function () {

                        console.log(
                            "Document + Access Log transaction completed."
                        );

                        resolve();

                    };


                transaction.onerror =
                    function (event) {

                        reject(
                            event.target.error ||
                            new Error(
                                "Database transaction failed."
                            )
                        );

                    };


                transaction.onabort =
                    function () {

                        reject(
                            new Error(
                                "Database transaction aborted."
                            )
                        );

                    };

            }
        );


        /* =================================================
           SUCCESS
        ================================================= */

        alert(
            "Document uploaded successfully!"
        );


        /* -----------------------------------------
           OPEN DOCUMENT LIBRARY
        ------------------------------------------ */

        window.location.href =
            "index2.html";


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        alert(
            "Document upload failed.\n\nError: " +
            (
                error.message ||
                "Unknown database error"
            )
        );


        if (uploadButton) {

            uploadButton.disabled =
                false;

            uploadButton.innerHTML =
                originalButtonText;

        }

    }

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    sessionStorage.removeItem(
        "loggedInUser"
    );

    sessionStorage.removeItem(
        "username"
    );

    sessionStorage.removeItem(
        "loggedInName"
    );

    sessionStorage.removeItem(
        "loggedInRole"
    );


    window.location.href =
        "login.html";

}


/* =====================================================
   RESET FILE
===================================================== */

function resetSelectedFile() {

    selectedFile = null;


    if (fileInput) {

        fileInput.value = "";

    }


    if (fileName) {

        fileName.textContent =
            "No file chosen";

    }

}


/* =====================================================
   PAGE LOAD
===================================================== */

window.addEventListener(
    "load",
    function () {

        /* -----------------------------------------
           CHECK LOGIN AGAIN
        ------------------------------------------ */

        if (
            !sessionStorage.getItem(
                "loggedInUser"
            )
        ) {

            window.location.href =
                "login.html";

            return;

        }


        console.log(
            "Secure DMS Upload System Ready"
        );

    }
);