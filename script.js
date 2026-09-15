/* =========================================================
   SECURE DMS - USER-WISE INDEXEDDB
   ========================================================= */

const DB_NAME = "SecureDMS";
const DB_VERSION = 1;
const STORE_NAME = "documents";

let db = null;


/* =========================================================
   1. GET CURRENT LOGGED-IN USER
   ========================================================= */

const loggedInUser = JSON.parse(
    sessionStorage.getItem("loggedInUser") || "null"
);

if (!loggedInUser) {
    window.location.href = "login.html";
}


/* =========================================================
   2. CURRENT USER ID
   ========================================================= */

function getCurrentUsername() {

    if (!loggedInUser) {
        return "";
    }

    return (
        loggedInUser.username ||
        loggedInUser.name ||
        ""
    ).toLowerCase().trim();
}


/* =========================================================
   3. OPEN INDEXEDDB
   ========================================================= */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        request.onupgradeneeded = function (event) {

            const database = event.target.result;


            if (!database.objectStoreNames.contains(STORE_NAME)) {

                const store =
                    database.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );


                store.createIndex(
                    "fileName",
                    "fileName",
                    {
                        unique: false
                    }
                );


                store.createIndex(
                    "uploadedByUsername",
                    "uploadedByUsername",
                    {
                        unique: false
                    }
                );


                store.createIndex(
                    "uploadedAt",
                    "uploadedAt",
                    {
                        unique: false
                    }
                );
            }
        };


        request.onsuccess = function (event) {

            db = event.target.result;

            console.log(
                "Secure DMS database connected."
            );

            resolve(db);
        };


        request.onerror = function (event) {

            console.error(
                "IndexedDB error:",
                event.target.error
            );

            reject(event.target.error);
        };
    });
}


/* =========================================================
   4. INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            await openDatabase();

            setupUserInfo();

            setupModalEvents();

            await loadMyDocuments();

        } catch (error) {

            console.error(
                "Initialization error:",
                error
            );

            alert(
                "Secure DMS storage could not be initialized."
            );
        }
    }
);


/* =========================================================
   5. USER INFORMATION
   ========================================================= */

function setupUserInfo() {

    if (!loggedInUser) {
        return;
    }


    const userName =
        loggedInUser.name ||
        loggedInUser.username ||
        "User";


    const role =
        loggedInUser.role ||
        "user";


    /* Username */

    const topUserName =
        document.getElementById(
            "topUserName"
        );


    if (topUserName) {

        topUserName.textContent =
            userName;
    }


    /* Avatar */

    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    if (userAvatar) {

        userAvatar.textContent =
            userName
                .charAt(0)
                .toUpperCase();
    }


    /* Role */

    const topUserRole =
        document.getElementById(
            "topUserRole"
        );


    if (topUserRole) {

        const roleNames = {

            admin: "Administrator",

            forensic_team: "Forensic Team",

            forensic_officer:
                "Forensic Officer",

            police_staff:
                "Police Staff",

            investigator:
                "Investigator",

            user: "User"
        };


        topUserRole.textContent =
            roleNames[role] || role;
    }
}


/* =========================================================
   6. LOAD ONLY CURRENT USER DOCUMENTS
   ========================================================= */

async function loadMyDocuments() {

    if (!db) {
        return;
    }


    const currentUser =
        getCurrentUsername();


    const transaction =
        db.transaction(
            STORE_NAME,
            "readonly"
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    const request =
        store.getAll();


    request.onsuccess = function () {

        const allDocuments =
            request.result || [];


        /*
           IMPORTANT:

           Only documents whose uploadedByUsername
           matches the currently logged-in user
           will be displayed.
        */

        const myDocuments =
            allDocuments.filter(
                function (doc) {

                    return (
                        String(
                            doc.uploadedByUsername || ""
                        )
                        .toLowerCase()
                        .trim()
                        === currentUser
                    );
                }
            );


        displayDocuments(
            myDocuments
        );
    };


    request.onerror = function () {

        console.error(
            "Unable to load documents:",
            request.error
        );
    };
}


/* =========================================================
   7. DISPLAY DOCUMENTS
   ========================================================= */

function displayDocuments(documents) {

    const table =
        document.getElementById(
            "documentTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (documents.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    <strong>
                        No documents found
                    </strong>

                    <br>

                    <small>
                        Upload a document to add
                        it to your private library.
                    </small>

                </td>

            </tr>
        `;

        return;
    }


    documents.sort(
        function (a, b) {

            return (
                new Date(b.uploadedAt) -
                new Date(a.uploadedAt)
            );
        }
    );


    documents.forEach(
        function (doc) {

            const row =
                document.createElement("tr");


            const accessClass =
                getAccessClass(
                    doc.access
                );


            const securityClass =
                getSecurityClass(
                    doc.security
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            doc.fileName
                        )}
                    </strong>

                    <br>

                    <small>
                        ${formatFileSize(
                            doc.fileSize
                        )}
                    </small>

                </td>


                <td>
                    ${escapeHTML(
                        doc.type
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        doc.uploadedBy
                    )}
                </td>


                <td>

                    <span
                        class="access-badge
                        ${accessClass}"
                    >
                        ${escapeHTML(
                            doc.access
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="security-badge
                        ${securityClass}"
                    >
                        ${escapeHTML(
                            doc.security
                        )}
                    </span>

                </td>


                <td>

                    <button
                        class="view-btn"
                        onclick="
                            viewStoredDocument(
                                ${doc.id}
                            )
                        "
                    >
                        View
                    </button>

                </td>


                <td>

                    <button
                        class="delete-btn"
                        onclick="
                            deleteStoredDocument(
                                ${doc.id}
                            )
                        "
                    >
                        Delete
                    </button>

                </td>

            `;


            table.appendChild(row);
        }
    );
}


/* =========================================================
   8. OPEN UPLOAD MODAL
   ========================================================= */

function openUpload() {

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add("show");


    const fileInput =
        document.getElementById(
            "fileInput"
        );


    if (fileInput) {

        fileInput.value = "";
    }


    const selectedFile =
        document.getElementById(
            "selectedFile"
        );


    if (selectedFile) {

        selectedFile.textContent =
            "No file selected";
    }
}


/* =========================================================
   9. CLOSE UPLOAD MODAL
   ========================================================= */

function closeUpload() {

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   10. SHOW SELECTED FILE
   ========================================================= */

function showSelectedFile() {

    const fileInput =
        document.getElementById(
            "fileInput"
        );


    const selectedFile =
        document.getElementById(
            "selectedFile"
        );


    if (!fileInput || !selectedFile) {
        return;
    }


    if (
        fileInput.files.length === 0
    ) {

        selectedFile.textContent =
            "No file selected";

        return;
    }


    const file =
        fileInput.files[0];


    selectedFile.textContent =
        `${file.name} (${formatFileSize(
            file.size
        )})`;
}


/* =========================================================
   11. UPLOAD & SAVE FILE
   ========================================================= */

async function uploadFile() {

    const fileInput =
        document.getElementById(
            "fileInput"
        );


    if (!fileInput) {

        alert(
            "File input not found."
        );

        return;
    }


    if (
        fileInput.files.length === 0
    ) {

        alert(
            "Please select a file first."
        );

        return;
    }


    const file =
        fileInput.files[0];


    /* 50 MB limit */

    const MAX_SIZE =
        50 * 1024 * 1024;


    if (file.size > MAX_SIZE) {

        alert(
            "File is too large.\n\n" +
            "Maximum allowed size is 50 MB."
        );

        return;
    }


    if (!db) {

        alert(
            "Database is not ready."
        );

        return;
    }


    const username =
        getCurrentUsername();


    const displayName =
        loggedInUser.name ||
        loggedInUser.username ||
        "User";


    const documentData = {

        fileName:
            file.name,

        fileType:
            file.type ||
            "application/octet-stream",

        extension:
            getFileExtension(
                file.name
            ),

        type:
            getFileType(
                file.name
            ),

        fileSize:
            file.size,

        fileData:
            file,

        /*
           OWNER INFORMATION
        */

        uploadedBy:
            displayName,

        uploadedByUsername:
            username,

        /*
           DOCUMENT SECURITY
        */

        access:
            "Restricted",

        security:
            "Encrypted",

        uploadedAt:
            new Date().toISOString()
    };


    try {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.add(
                documentData
            );


        request.onsuccess =
            function () {

                alert(
                    `"${file.name}" uploaded successfully!`
                );


                closeUpload();


                fileInput.value = "";


                const selectedFile =
                    document.getElementById(
                        "selectedFile"
                    );


                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";
                }


                /*
                   Reload ONLY current user's
                   documents.
                */

                loadMyDocuments();
            };


        request.onerror =
            function () {

                console.error(
                    "Save error:",
                    request.error
                );


                alert(
                    "Unable to save the document."
                );
            };


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        alert(
            "Something went wrong while uploading."
        );
    }
}


/* =========================================================
   12. GET DOCUMENT
   ========================================================= */

function getDocumentById(id) {

    return new Promise(
        function (resolve, reject) {

            if (!db) {

                resolve(null);

                return;
            }


            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(id);


            request.onsuccess =
                function () {

                    resolve(
                        request.result ||
                        null
                    );
                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );
                };
        }
    );
}


/* =========================================================
   13. OWNERSHIP CHECK
   ========================================================= */

function isDocumentOwner(doc) {

    if (!doc || !loggedInUser) {

        return false;
    }


    const currentUser =
        getCurrentUsername();


    const documentOwner =
        String(
            doc.uploadedByUsername || ""
        )
        .toLowerCase()
        .trim();


    return (
        documentOwner === currentUser
    );
}


/* =========================================================
   14. VIEW DOCUMENT
   ========================================================= */

async function viewStoredDocument(id) {

    const doc =
        await getDocumentById(id);


    if (!doc) {

        alert(
            "Document not found."
        );

        return;
    }


    /*
       SECURITY CHECK

       User cannot view another user's
       document.
    */

    if (!isDocumentOwner(doc)) {

        alert(
            "Access denied!\n\n" +
            "You can only access your own documents."
        );

        return;
    }


    openDocumentPreview(doc);
}


/* =========================================================
   15. DOCUMENT PREVIEW
   ========================================================= */

function openDocumentPreview(doc) {

    const modal =
        document.getElementById(
            "documentModal"
        );


    const nameElement =
        document.getElementById(
            "viewDocumentName"
        );


    const infoElement =
        document.getElementById(
            "viewDocumentInfo"
        );


    if (!modal) {
        return;
    }


    if (nameElement) {

        nameElement.textContent =
            doc.fileName;
    }


    if (infoElement) {

        infoElement.innerHTML = `

            <div style="margin-bottom:15px;">
                <strong>File:</strong>
                ${escapeHTML(
                    doc.fileName
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Type:</strong>
                ${escapeHTML(
                    doc.type
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Size:</strong>
                ${formatFileSize(
                    doc.fileSize
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Uploaded By:</strong>
                ${escapeHTML(
                    doc.uploadedBy
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Access:</strong>
                ${escapeHTML(
                    doc.access
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Security:</strong>
                ${escapeHTML(
                    doc.security
                )}
            </div>


            <div style="margin-bottom:15px;">
                <strong>Uploaded:</strong>
                ${formatDate(
                    doc.uploadedAt
                )}
            </div>


            <div style="margin-top:20px;">

                <button
                    class="view-btn"
                    onclick="
                        openFileInNewTab(
                            ${doc.id}
                        )
                    "
                >
                    Open File
                </button>


                <button
                    class="view-btn"
                    onclick="
                        downloadStoredDocument(
                            ${doc.id}
                        )
                    "
                >
                    Download
                </button>

            </div>
        `;
    }


    modal.classList.add(
        "show"
    );
}


/* =========================================================
   16. CLOSE DOCUMENT
   ========================================================= */

function closeDocument() {

    const modal =
        document.getElementById(
            "documentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   17. OPEN FILE
   ========================================================= */

async function openFileInNewTab(id) {

    const doc =
        await getDocumentById(id);


    if (!doc) {

        alert(
            "Document not found."
        );

        return;
    }


    /* OWNER CHECK */

    if (!isDocumentOwner(doc)) {

        alert(
            "Access denied!"
        );

        return;
    }


    if (!doc.fileData) {

        alert(
            "File data not available."
        );

        return;
    }


    const url =
        URL.createObjectURL(
            doc.fileData
        );


    window.open(
        url,
        "_blank"
    );


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        60000
    );
}


/* =========================================================
   18. DOWNLOAD FILE
   ========================================================= */

async function downloadStoredDocument(id) {

    const doc =
        await getDocumentById(id);


    if (!doc) {

        alert(
            "Document not found."
        );

        return;
    }


    /* OWNER CHECK */

    if (!isDocumentOwner(doc)) {

        alert(
            "Access denied!"
        );

        return;
    }


    if (!doc.fileData) {

        alert(
            "File data not available."
        );

        return;
    }


    const url =
        URL.createObjectURL(
            doc.fileData
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        doc.fileName;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}


/* =========================================================
   19. DELETE DOCUMENT
   ========================================================= */

async function deleteStoredDocument(id) {

    const doc =
        await getDocumentById(id);


    if (!doc) {

        alert(
            "Document not found."
        );

        return;
    }


    /*
       IMPORTANT SECURITY CHECK

       User can delete ONLY his/her own file.
    */

    if (!isDocumentOwner(doc)) {

        alert(
            "Access denied!\n\n" +
            "You cannot delete another user's document."
        );

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${doc.fileName}"?`
        );


    if (!confirmed) {
        return;
    }


    const transaction =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    const request =
        store.delete(id);


    request.onsuccess =
        function () {

            alert(
                `"${doc.fileName}" deleted successfully.`
            );


            loadMyDocuments();
        };


    request.onerror =
        function () {

            alert(
                "Unable to delete document."
            );
        };
}


/* =========================================================
   20. OLD deletedoc() SUPPORT
   ========================================================= */

function deletedoc(fileName) {

    if (!db) {
        return;
    }


    const transaction =
        db.transaction(
            STORE_NAME,
            "readonly"
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    const request =
        store.getAll();


    request.onsuccess =
        function () {

            const documents =
                request.result || [];


            const doc =
                documents.find(
                    function (item) {

                        return (
                            item.fileName ===
                            fileName
                        );
                    }
                );


            if (!doc) {

                alert(
                    "Document not found."
                );

                return;
            }


            /*
               Ownership is checked again
               inside deleteStoredDocument().
            */

            deleteStoredDocument(
                doc.id
            );
        };
}


/* =========================================================
   21. SEARCH DOCUMENTS
   ========================================================= */

function searchDocuments() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const table =
        document.getElementById(
            "documentTable"
        );


    if (!input || !table) {
        return;
    }


    const searchText =
        input.value
            .toLowerCase()
            .trim();


    const rows =
        table.querySelectorAll(
            "tr"
        );


    rows.forEach(
        function (row) {

            const rowText =
                row.textContent
                    .toLowerCase();


            if (
                searchText === "" ||
                rowText.includes(
                    searchText
                )
            ) {

                row.style.display =
                    "";

            } else {

                row.style.display =
                    "none";
            }
        }
    );
}


/* =========================================================
   22. FILE TYPE
   ========================================================= */

function getFileType(fileName) {

    const extension =
        getFileExtension(
            fileName
        );


    const types = {

        pdf: "PDF",

        doc: "Document",

        docx: "Document",

        jpg: "Image",

        jpeg: "Image",

        png: "Image",

        gif: "Image",

        webp: "Image",

        txt: "Text",

        csv: "Spreadsheet",

        xls: "Spreadsheet",

        xlsx: "Spreadsheet",

        ppt: "Presentation",

        pptx: "Presentation"
    };


    return (
        types[extension] ||
        "Document"
    );
}


/* =========================================================
   23. FILE EXTENSION
   ========================================================= */

function getFileExtension(fileName) {

    const parts =
        fileName.split(".");


    if (parts.length <= 1) {

        return "";
    }


    return parts
        .pop()
        .toLowerCase();
}


/* =========================================================
   24. ACCESS CLASS
   ========================================================= */

function getAccessClass(access) {

    const value =
        String(
            access || ""
        )
        .toLowerCase();


    if (
        value.includes(
            "restricted"
        )
    ) {

        return "restricted";
    }


    if (
        value.includes(
            "internal"
        )
    ) {

        return "internal";
    }


    if (
        value.includes(
            "legal"
        )
    ) {

        return "legal";
    }


    return "";
}


/* =========================================================
   25. SECURITY CLASS
   ========================================================= */

function getSecurityClass(security) {

    const value =
        String(
            security || ""
        )
        .toLowerCase();


    if (
        value.includes(
            "encrypted"
        )
    ) {

        return "encrypted";
    }


    return "";
}


/* =========================================================
   26. FILE SIZE
   ========================================================= */

function formatFileSize(bytes) {

    if (
        !bytes ||
        bytes === 0
    ) {

        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(
            1024,
            index
        );


    return (
        Math.round(
            size * 100
        ) / 100
    ) +
    " " +
    units[index];
}


/* =========================================================
   27. DATE FORMAT
   ========================================================= */

function formatDate(date) {

    if (!date) {
        return "Unknown";
    }


    const d =
        new Date(date);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return "Unknown";
    }


    return d.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   28. HTML SECURITY
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   29. MODAL EVENTS
   ========================================================= */

function setupModalEvents() {

    const uploadModal =
        document.getElementById(
            "uploadModal"
        );


    const documentModal =
        document.getElementById(
            "documentModal"
        );


    if (uploadModal) {

        uploadModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    uploadModal
                ) {

                    closeUpload();
                }
            }
        );
    }


    if (documentModal) {

        documentModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    documentModal
                ) {

                    closeDocument();
                }
            }
        );
    }
}


/* =========================================================
   30. ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeUpload();

            closeDocument();
        }
    }
);


/* =========================================================
   31. LOGOUT
   ========================================================= */

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    sessionStorage.removeItem(
        "loggedInUser"
    );


    window.location.href =
        "login.html";
}


/* =========================================================
   32. DEVELOPMENT FUNCTION
   =========================================================
   Optional:
   clearAllDocuments()
   can be run from browser console.
   ========================================================= */

function clearAllDocuments() {

    if (!db) {
        return;
    }


    const confirmed =
        confirm(
            "Delete ALL documents from this browser?"
        );


    if (!confirmed) {
        return;
    }


    const transaction =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );


    const store =
        transaction.objectStore(
            STORE_NAME
        );


    const request =
        store.clear();


    request.onsuccess =
        function () {

            alert(
                "All documents deleted."
            );


            loadMyDocuments();
        };
}


/* =========================================================
   END
   ========================================================= */