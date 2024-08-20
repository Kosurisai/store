const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const upload = multer();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'storemanagement'
});

connection.connect(err => {
    if (err) {
        console.log('Connection Failed', err);
    } else {
        console.log('Database connection was successful');
    }
});


app.get('/admin/users', (req, res) => {
    const query = 'SELECT * FROM users where role = ?';
    connection.query(query, ['user'], (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            return res.status(200).json(data);
        }
    });
});

app.get('/admin/users/:userid', (req, res) => {
    console.log(req.params)
    const query = `SELECT * FROM users where id=${req.params.userid}`;
    connection.query(query, (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            return res.status(200).json(data);
        }
    });
});

app.post('/admin/users', upload.none(), (req, res) => {
    console.log(req.body);
    const { user, email, password, role,adminId } = req.body;
    const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const values = [user, email, password, role];
    
    connection.query(query, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            const adminUserId = adminId;
            const action = 'User Creation';
            const details = `Created user ${user} with email ${email} and role ${role}`;
            const storeName = null;

            const auditQuery = `INSERT INTO audit_trail (action, user_id, details, store_name) VALUES (?, ?, ?, ?)`;
            const auditValues = [action, adminUserId, details, storeName];
            
            connection.query(auditQuery, auditValues, (auditErr) => {
                if (auditErr) {
                    console.error('Error logging audit trail:', auditErr);
                }
            });

            return res.status(200).json({ message: 'User created successfully', data });
        }
    });
});


app.put('/admin/users/:userid', upload.none(), (req, res) => {
    const id = req.params.userid;
    const { username, email, role, adminId } = req.body;
    const query = `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;
    const values = [username, email, role, id];
    
    connection.query(query, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            const action = 'User Update';
            const details = `Updated user with ID ${id}: username to ${username}, email to ${email}, and role to ${role}`;
            const storeName = null;

            const auditQuery = `INSERT INTO audit_trail (action, user_id, details, store_name) VALUES (?, ?, ?, ?)`;
            const auditValues = [action, adminId, details, storeName];
            
            connection.query(auditQuery, auditValues, (auditErr) => {
                if (auditErr) {
                    console.error('Error logging audit trail:', auditErr);
                }
            });

            return res.status(200).json({ message: 'User updated successfully' });
        }
    });
});


app.delete('/admin/users/:userid', (req, res) => {
    const id = req.params.userid;
    const query = `DELETE FROM users WHERE id = ?`;
    connection.query(query, [id], (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            return res.status(200).json({ message: 'User deleted successfully' });
        }
    });
});



app.get('/admin/stores/overview', (req, res) => {
    const totalStoresQuery = `SELECT COUNT(*) AS totalStores FROM stores`;
    const activeStoresQuery = `SELECT COUNT(*) AS activeStores FROM store_requests WHERE status = 'approved'`;
    const pendingRequestsQuery = `SELECT COUNT(*) AS pendingRequests FROM store_requests WHERE status = 'pending'`;

    connection.query(totalStoresQuery, (err, totalStores) => {
        if (err) return res.status(500).json({ message: `${err}` });

        connection.query(activeStoresQuery, (err, activeStores) => {
            if (err) return res.status(500).json({ message: `${err}` });

            connection.query(pendingRequestsQuery, (err, pendingRequests) => {
                if (err) return res.status(500).json({ message: `${err}` });

                return res.status(200).json({
                    totalStores: totalStores[0].totalStores,
                    activeStores: activeStores[0].activeStores,
                    pendingRequests: pendingRequests[0].pendingRequests
                });
            });
        });
    });
});


app.post('/stores', upload.none(), (req, res) => {
    console.log(req.body);
    const { name, location, contact_number, opening_hours, available_networks, website, adminId } = req.body;
    const addStoreQuery = `INSERT INTO stores (name, location, contact_number, opening_hours, available_networks, website) VALUES (?, ?, ?, ?, ?, ?)`;
    const auditTrailQuery = `INSERT INTO audit_trail (action, user_id, details,store_name) VALUES ('add', ?, ?, ?)`;

    connection.query(addStoreQuery, [name, location, contact_number, opening_hours, available_networks, website], (err, result) => {
        if (err) return res.status(500).json({ message: `Error: ${err}` });

        const storeId = result.insertId;
        const details = `Store ${name} added by Admin`;
        
        connection.query(auditTrailQuery, [adminId, details, name], (err) => {
            if (err) return res.status(500).json({ message: `Error: ${err}` });

            return res.status(200).json({ message: 'Store added successfully' });
        });
    });
});

app.get('/admin/audit-trail', (req, res) => {
    const query = `
        SELECT at.id, at.user_id,at.action, at.created_at, at.details, u.username AS admin_name, at.store_name FROM audit_trail at JOIN users u ON at.user_id = u.id ORDER BY 
        at.created_at DESC;`
        connection.query(query, (err, data) => {
        if (err) return res.status(500).json({ message: `${err}` });
        console.log('hello',data);
        return res.status(200).json(data);
    });
});


app.get('/stores', (req, res) => {
    const query = 'SELECT * FROM stores';
    connection.query(query, (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            return res.status(200).json(data);
        }
    });
});


app.get('/stores/:storeid', (req, res) => {
    const id = req.params.storeid;
    const query = `SELECT * FROM stores WHERE id = ?`;
    connection.query(query, [id], (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            return res.status(200).json(data);
        }
    });
});


app.put('/stores/:storeid', upload.none(), (req, res) => {
    const id = req.params.storeid;
    const { name, location, contact_number, opening_hours, available_networks, website, adminId } = req.body;

    const updateStoreQuery = `UPDATE stores SET name = ?, location = ?, contact_number = ?, opening_hours = ?, available_networks = ?, website = ? WHERE id = ?`;
    const auditTrailQuery = `INSERT INTO audit_trail (action, user_id, details, store_name) VALUES ('update', ?, ?, ?)`;

    connection.query(updateStoreQuery, [name, location, contact_number, opening_hours, available_networks, website, id], (err, data) => {
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } else {
            const details = `Updated store ${name}`;
            connection.query(auditTrailQuery, [adminId, details, name], (err) => {
                if (err) return res.status(500).json({ message: `${err}` });

                return res.status(200).json({ message: 'Store updated successfully' });
            });
        }
    });
});


app.delete('/stores/:storeid', upload.none(), (req, res) => {
    const id = req.params.storeid;
    const { adminId } = req.body; 
    const getStoreNameQuery = `SELECT name FROM stores WHERE id = ?`;
    const deleteStoreQuery = `DELETE FROM stores WHERE id = ?`;
    const auditTrailQuery = `INSERT INTO audit_trail (action, user_id, details, store_name) VALUES ('delete', ?, ?, ?)`;

    connection.query(getStoreNameQuery, [id], (err, results) => {
        if (err) return res.status(500).json({ message: `${err}` });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const storeName = results[0].name;
        const details = `Deleted store with ID ${id}`;
        connection.query(deleteStoreQuery, [id], (err) => {
            if (err) return res.status(500).json({ message: `${err}` });
            connection.query(auditTrailQuery, [adminId, details, storeName], (err) => {
                if (err) return res.status(500).json({ message: `${err}` });

                return res.status(200).json({ message: 'Store deleted successfully' });
            });
        });
    });
});



app.post('/adminauth',upload.none(),(req,res) => {
    const {username,password} = req.body;
    const query = `select * from users where username = ? && password = ? && role =?`;
    connection.query(query,[username,password,'admin'],(err , data)=>{
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } 
        else if(data.length>0) {
            console.log(data[0].id);
            return res.status(200).json({message : 'Login Successful', admin_id : data[0].id});
        }
        else{
            res.json({message : 'Login unSuccessful'})
        }
    })

});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, email, password, 'admin'], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.json({ success: false, message: 'Registration failed.' });
        }
        res.json({ success: true });
    });
});

app.post('/auth/user',(req , res) => {
    const {username,password} = req.body;
    const query = `select * from users where username = ? && password = ? && role =?`;
    connection.query(query,[username,password,'user'],(err , data)=>{
        if (err) {
            return res.status(500).json({ message: `${err}` });
        } 
        else if(data.length>0) {
            console.log(data);
            return res.status(200).json({message : 'Login Successful',id: data[0].id});
        }
        else{
            res.json({message : 'Login unSuccessful'})
        }
    })

});

app.post('/userregister',(req ,res) => {
    const {username,password,email} = req.body;
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, email, password, 'user'], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.json({ success: false, message: 'Registration failed.' });
        }
        res.json({ success: true });
    });
});

app.post('/userrequest',(req, res) => {
    console.log(req.body);
    const { store_id,user_id } = req.body;
    const query = 'INSERT INTO store_requests (user_id, store_id, status) VALUES (?, ?, ?)';
    connection.query(query, [user_id, store_id, 'pending'], (err, result) => {
        if (err) throw err;
        const store_name = `select name from stores where id = ${store_id}`;
        connection.query(store_name,(err ,data) =>{
            if(err)  throw err
            console.log(data);
        const store = data[0].name;
        const audit_query = `INSERT INTO audit_trail (action, user_id, details, store_name) VALUES ('User Request', ?, ?, ?)`;
        connection.query(audit_query,[user_id,`Recieved Request From The User ID ${user_id}`,store])
        res.json({ message: 'Request submitted successfully', requestId: result.insertId });
        })
    });
});

app.get('/adminrequests',(req,res) => {
    const query = `
    SELECT sr.user_id,us.username, st.name, sr.status 
    FROM users us 
    JOIN store_requests sr ON sr.user_id = us.id
    JOIN stores st ON sr.store_id = st.id;
    `;
    connection.query(query, (err, data) => {
        console.log(data);
        if (err) return res.status(500).json({ message: `${err}` });
        return res.status(200).json(data);
    });
});

app.post('/adminrequests/update', (req, res) => {
    console.log(req.body);
    const { user_id, status, store_name } = req.body;

    if (!user_id || !status) {
        return res.status(400).json({ message: "user_id and status are required." });
    }

    if (status === 'denied') {
        let deleteQuery = `DELETE FROM store_requests WHERE user_id = ? AND store_id = (SELECT id FROM stores WHERE name = ?)`;
        connection.query(deleteQuery, [user_id, store_name], (err, data) => {
            if (err) {
                console.error("Error deleting request:", err);
                return res.status(500).json({ message: "Internal server error." });
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({ message: "No request found for the given user_id and store_name." });
            }

            return res.status(200).json({ message: "Request deleted successfully.", data });
        });
    } else {
        let updateQuery = `UPDATE store_requests sr
                           JOIN stores s ON sr.store_id = s.id
                           SET sr.status = ?
                           WHERE sr.user_id = ?
                           AND s.name = ?`;
        connection.query(updateQuery, [status, user_id, store_name], (err, data) => {
            if (err) {
                console.error("Error updating status:", err);
                return res.status(500).json({ message: "Internal server error." });
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({ message: "No request found for the given user_id and store_name." });
            }

            return res.status(200).json({ message: "Status updated successfully.", data });
        });
    }
});

app.post('/user/requests', (req, res) => {
    const { user_id } = req.body;
    const query = `
        SELECT us.username, st.name, sr.status 
        FROM users us
        JOIN store_requests sr ON sr.user_id = us.id
        JOIN stores st ON sr.store_id = st.id
        WHERE sr.user_id = ?
    `;
    connection.query(query, [user_id], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: `Database error: ${err.message}` });
        }
        return res.status(200).json(data);
    });
});

app.get('/favoritestore/:userid',(req ,res) => {
    const user_id = req.params.userid;
    const query = `SELECT stores.*
    FROM favorite_stores
    JOIN stores ON favorite_stores.store_id = stores.id
    WHERE favorite_stores.user_id = ?;`
    connection.query(query , [user_id], (err , data) => {
        if(err){
            res.status(500).json(err);
        }
        else
        {
            res.status(200).json(data);
        }
    })

})

app.post('/favoritestore',(req ,res ) => {
    const {store_id , user_id} = req.body;
    const query = `insert into favorite_stores(user_id,store_id) values ( ?, ?);`
    connection.query(query , [user_id,store_id], (err,data) => {
        if(err)
        {
            res.status(500).json({message : err});
        }
        res.status(200).json({message : 'Inserted into favourite_stores'});
    })

})

app.delete('/favoritestore/:userid' ,(req ,res ) => {
    const user_id = req.params.userid;
    console.log(user_id)
    const query = `delete from favorite_stores where store_id = ?`
    connection.query(query , [user_id], (err , data) => {
        if(err){
            res.status(500).json(err);
        }
        else
        {
            res.status(200).json(data);
        }
    })

});

app.get(`/approvedrequests/:user_id`,(req , res) => {
    const user_id = req.params.user_id;
    const query = `SELECT s.*
FROM store_requests sr
JOIN stores s ON sr.store_id = s.id
WHERE sr.user_id = ?
AND sr.status = 'approved';
`
connection.query(query , [user_id] ,(err ,data) => {
    if(err){
        res.status(400).json(err);
    }
    else
    {
        res.status(200).json(data);
    }
})
})


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
