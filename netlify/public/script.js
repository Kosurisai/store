document.addEventListener('DOMContentLoaded', function() {
    const userManagementLink = document.getElementById('user-management-link');
    const storeOverviewLink = document.getElementById('store-overview-link');
    const auditTrailLink = document.getElementById('audit-trail-link');
    const requestLink = document.getElementById('requests-link');

    const userManagementSection = document.getElementById('user-management-section');
    const storeOverviewSection = document.getElementById('store-overview-section');
    const auditTrailSection = document.getElementById('audit-trail-section');
    const requestSecction = document.getElementById('requests-section');

    userManagementLink.addEventListener('click', function() {
        userManagementSection.style.display = 'block';
        storeOverviewSection.style.display = 'none';
        auditTrailSection.style.display = 'none';
        requestSecction.style.display = 'none';
        fetch('admin/users').then(
            response => response.json()
        ).then(data => loadUsers(data));
    });

    storeOverviewLink.addEventListener('click', function() {
        userManagementSection.style.display = 'none';
        storeOverviewSection.style.display = 'block';
        auditTrailSection.style.display = 'none';
        requestSecction.style.display = 'none';
        loadStoreOverview();
    });


    auditTrailLink.addEventListener('click', function() {
        userManagementSection.style.display = 'none';
        storeOverviewSection.style.display = 'none';
        auditTrailSection.style.display = 'block';
        requestSecction.style.display = 'none';
        loadAuditTrail();
    });

    requestLink.addEventListener('click',function(){
        userManagementSection.style.display = 'none';
        storeOverviewSection.style.display = 'none';
        auditTrailSection.style.display = 'none';
        requestSecction.style.display = 'block';
        loadRequests();
    })

    function loadUsers(users) {
        const userTableBody = document.querySelector('#user-table tbody');
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.password}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-button" onclick="editUser(${user.id})">Edit</button>
                    <button class="delete-button" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }



    function loadStoreOverview() {
        fetch('/admin/stores/overview').then(response => response.json()).then(store =>{
        document.getElementById('total-stores').textContent = store.totalStores;
        document.getElementById('active-stores').textContent = store.activeStores;
        document.getElementById('pending-requests').textContent = store.pendingRequests;
        });
    }
    function loadAuditTrail() {
        fetch('/admin/audit-trail').then(response => response.json().then(
        data => {
            console.log(data);
        const auditTrailTableBody = document.querySelector('#audit-trail-table tbody');
        auditTrailTableBody.innerHTML = '';
        data.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.admin_name}</td>
                <td>${entry.store_name}</td>
                <td>${entry.action}</td>
                <td>${entry.details}</td>
                <td>${entry.created_at}</td>
            `;
            auditTrailTableBody.appendChild(row);
        });
    }
        ));
    }

    function loadRequests() {
        fetch('/adminrequests')
            .then(response => response.json())
            .then(users => {
                let tbody = document.getElementById('requestbody');
                tbody.innerHTML = ''; // Clear existing content
                for (let i = 0; i < users.length; i++) {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${users[i].username}</td>
                        <td>${users[i].name}</td>
                        <td>${users[i].status}</td>
                        <td>
                            <select onchange="updateStatus(${users[i].user_id}, this.value, '${users[i].name}')">
                                <option value="pending" ${users[i].status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="approved" ${users[i].status === 'approved' ? 'selected' : ''}>approved</option>
                                <option value="denied" ${users[i].status === 'denied' ? 'selected' : ''}>Denied</option>
                            </select>
                        </td>
                    `;
                    tbody.append(row);
                }
            })
            .catch(error => {
                console.error('Error fetching requests:', error);
            });
    }
    
    userManagementLink.click();
});


const userManagementLink = document.getElementById('user-management-link');
const storeOverviewLink = document.getElementById('store-overview-link');
const auditTrailLink = document.getElementById('audit-trail-link');

const userManagementSection = document.getElementById('user-management-section');
const storeOverviewSection = document.getElementById('store-overview-section');
const auditTrailSection = document.getElementById('audit-trail-section');

function addUser(){
    event.preventDefault();
    let user = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let role = document.getElementById('role').value;
    const adminId=localStorage.getItem('admin_id');
    let userjson = {
        user : user,
        email : email,
        password : password,
        role : role,
        adminId : adminId
    }

    fetch('/admin/users',{
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(userjson)
    }).then(response => response.json()).then(data => {
       console.log(data);
    })
    fetch('admin/users').then(
        response => response.json()
    ).then(data => loadUsers(data));
    document.getElementById('addUserForm').style.display = 'none';
}
let user;
function editUser(userid) {
    document.getElementById('addUserForm').style.display = 'block';
    userManagementSection.style.display = 'block';
    storeOverviewSection.style.display = 'none';
    auditTrailSection.style.display = 'none';
    document.getElementById('User-button').innerHTML=''
    fetch(`/admin/users/${userid}`).then(response => 
        response.json()).then(data => {
    user = data[0];
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('password').value = user.password;
    document.getElementById('role').value =user.role;
    document.getElementById('User-button').innerHTML=`<button type="submit" id="user-edit-button" onclick="updateData(${user.id})">Edit</button>
    <button onclick="cancelUser()">cancel</button>`
    });
    
}
function updateData(userid) {
    let user = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let role = document.getElementById('role').value;
    const adminId=localStorage.getItem('admin_id');
    let userjson = {
        username : user,
        email : email,
        password : password,
        role : role,
        adminId : adminId
    }

    fetch(`/admin/users/${userid}`,{
        method : 'PUT',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(userjson)
    }).then(response => response.json()).then(data => {
       console.log(data);
    });
    fetch('admin/users').then(
        response => response.json()
    ).then(data => loadUsers(data))
    document.getElementById('User-button').innerHTML=`<button type="submit" id="user-submit-button" onclick="addUser()">Add User</button>
                        <button onclick="cancelUser()">cancel</button>`;
    document.getElementById('addUserForm').style.display = 'none';
    
}

function deleteUser(userid) {
    fetch(`/admin/users/${userid}`,{
        method : "DELETE"
    }).then(response => response.json()).then(
        data => console.log(data)
    )
    fetch('admin/users').then(
        response => response.json()
    ).then(data => loadUsers(data));
}

function updateStatus(requestId, newStatus, name) {
    fetch(`/adminrequests/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: requestId,
            status: newStatus,
            store_name: name
        })
    })
    .then(response => {
        if (response.ok) {
            console.log(response.json());
            console.log(`Status updated successfully for request ID: ${requestId}`);
        } else {
            console.error('Failed to update status');
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
    });
}

function showStoreInventory() {
    document.getElementById('btn-container').style.display = 'block';
    fetch('/stores')
        .then(response => response.json())
        .then(data => {
            loaddata(data);
        })
        .catch(error => console.error('Error fetching store inventory:', error));
}

function loaddata(users)
{
    let Container = document.getElementById('store-data');
    console.log(Container);
    Container.innerHTML = ''; 
for(i=0;i<users.length;i++)
{
        console.log(users[i].id);
        let name = users[i].name;
        let location = users[i].location;
        let phone = users[i].contact_number;
        let network = users[i].available_networks;
        let open =users[i].opening_hours;
        let web = users[i].website;
        let row = document.createElement('div');
            row.innerHTML = ` <div class="store-card" id="store-card">
            <h3>${name}</h3>
            <p><strong>Location:</strong>${location}</p>
            <p><strong>Contact Number:</strong>${phone}</p>
            <p><strong>Opening Hours:</strong>${open}</p>
            <p><strong>Available Networks:</strong>${network}</p>
            <p><strong>Website:</strong> <a href="https://example.com" target="_blank">${web}</a></p>
            <div class="store-actions">
                <button onclick="update(${users[i].id})">Edit</button>
                <button class="delete" onclick="deleteStore(${users[i].id})">Delete</button>
            </div>`;
        
        Container.append(row);
    }
}
function AddStore(event){
    event.preventDefault();
    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const contact_number = document.getElementById('contact_number').value;
    const open = document.getElementById('opening_hours').value;
    const website = document.getElementById('website').value;
    const available_networks = document.getElementById('available_networks').value;
    if(!open || !name || !contact_number || !location || !website || !available_networks)
    {
        showPopup('Enter all details.....!');
        return;
    }
    let form = new FormData();
    form.append('name',name);
    form.append('location',location);
    form.append('contact_number',contact_number);
    form.append('opening_hours',open);
    form.append('available_networks',available_networks);
    form.append('website',website);
    form.append('adminId',localStorage.getItem('admin_id'));
    fetch('/stores',{
        method :"POST",
        body:form
    }).then(response => response.json()).then(data =>{
        console.log(data);
    }).catch(error =>{
        console.log(error);
    });
    fetch('/stores').then(
        response => response.json()
    ).then(users => loaddata(users));
    let forms = document.getElementById('AddStoreForm');
    forms.reset();
    forms.style.display='none';
    document.getElementById('addstorebtn').style.display='block';
    showPopup('store Added successfully....');
    document.getElementById('blur-background').style.display='none';
}
function update(id)
{
    event.preventDefault();
    document.getElementById('UpdateForm').style.display='block';
    document.getElementById('addstorebtn').style.display='none';
    document.getElementById('blur-background').style.display='block';
    fetch('/stores').then(
        response => response.json()
    ).then((users) => {
        for(i=0;i<users.length;i++)
    {
        if(users[i].id===id)
    {
        document.getElementById('names').value=users[i].name;
        document.getElementById('locations').value=users[i].location;
        document.getElementById('contact_numbers').value=users[i].contact_number;
        document.getElementById('opening_hourss').value=users[i].opening_hours;
        document.getElementById('websites').value=users[i].website;
        document.getElementById('available_networkss').value=users[i].available_networks;
    }
    }
        document.getElementById('updateDatabtn').innerHTML=`<button onclick="updatedata(${id})" id="updateDatabtn">update</button>`;
    });
}
function updatedata(id){
    event.preventDefault();
    const name = document.getElementById('names').value;
    const location = document.getElementById('locations').value;
    const contact_number = document.getElementById('contact_numbers').value;
    const open = document.getElementById('opening_hourss').value;
    const website = document.getElementById('websites').value;
    const avil = document.getElementById('available_networkss').value;
    let form = new FormData();
    form.append('name',name);
    form.append('location',location);
    form.append('contact_number',contact_number);
    form.append('opening_hours',open);
    form.append('available_networks',avil);
    form.append('website',website);
    form.append('adminId',localStorage.getItem('admin_id'));
    fetch(`/stores/${id}`,{
        method:'PUT',
        body:form
    }).then(response => response.json()).then(data =>{
        console.log(data);
    }).catch(error =>{
        console.log(error);
    });
    showPopup('Store Details Updated Succesfully......');
    fetch('/stores').then(
        response => response.json()
    ).then(users => loaddata(users));
    let forms = document.getElementById('UpdateForm');
    forms.style.display='none';
    document.getElementById('addstorebtn').style.display='block';
    document.getElementById('blur-background').style.display='none';
}
function deleteStore(id){
    event.preventDefault();
    document.getElementById('deletestore').style.display = 'block';
    document.getElementById('confirmdelete').innerHTML = `<button id="confirmdeletebtn" onclick="deleteStoreData(${id})">Confirm</button>`;
    
}

function deleteStoreData(id){
    event.preventDefault(); 
    let form = new FormData();

    form.append('adminId',localStorage.getItem('admin_id'));
    fetch(`/stores/${id}`,{
        method:'DELETE',
        body:form
    }).then(response => response.json()).then(data =>{
        console.log(data);
    }).catch(error =>{
        console.log(error);
    }); 
    document.getElementById('deletestore').style.display = 'none';
    // showPopup('Store Details Deleted Succesfully.....');
    fetch('/stores').then(
        response => response.json()
    ).then(users => loaddata(users));

}

function showForm()
{
    event.preventDefault();
    let form = document.getElementById('AddStoreForm');
    form.style.display='block';
    document.getElementById('addstorebtn').style.display='none';
    document.getElementById('blur-background').style.display='block';
}
function cancel()
{
    event.preventDefault();
    document.getElementById('AddStoreForm').style.display='none';
    document.getElementById('UpdateForm').style.display='none';
    document.getElementById('addstorebtn').style.display='block';
    document.getElementById('blur-background').style.display='none';
}
function showPopup(message) {
    document.getElementById('blur-background').style.display = 'block';
    document.getElementById('popup-message').textContent = message;
    document.getElementById('blur-background').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('deletestore').style.display = 'none';
    document.getElementById('blur-background').style.display = 'none';
}

function showuserForm()
{
    document.getElementById('addUserForm').style.display = 'block';
}

function cancelUser() {
    document.getElementById('addUserForm').style.display = 'none';
    document.getElementById('User-button').innerHTML=`<button type="submit" id="user-submit-button" onclick="addUser()">Add User</button>
                        <button onclick="cancelUser()">cancel</button>`;
}

function loadUsers(users) {
    const userTableBody = document.querySelector('#user-table tbody');
    userTableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${user.role}</td>
            <td>
                <button class="edit-button" onclick="editUser(${user.id})">Edit</button>
                <button class="delete-button" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}