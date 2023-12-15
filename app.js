const express = require('express');
const app = express();
const mysql  = require('mysql2');
const path = require("path");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ogilheaney01',  
    port: '8889',
});

multipleStatements : true,


db.connect((err)=> {
    if(err) throw err;
});

app.use(express.static(path.join(__dirname,'./public')));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: true}));

app.get('/login', (req,res) => {
    res.render('login');
});


app.post('/login', (req,res) => {
    const useremail = req.body.emailField;

    const checkuser = `SELECT * FROM users WHERE email = "${useremail}" `;

    db.query(checkuser, (err, rows) => {
        if(err) throw err;
        const numRows = rows.length;
        
        if(numRows > 0){
            // res.send('<code>logged in</code>');
            res.redirect('/mycollection');
        }else{
            res.send('<code>accessed denied</code>');
        }
        
    });
});

app.get('/expansions',(req,res) => {

    const showsql = `SELECT * FROM series LIMIT 13`;
    
    db.query(showsql, (err, rows) => {
        if(err) throw err;
        res.render('expansions', {expansions: rows});
    });
    
});

app.get('/cards', (req,res) => {
    
    const cardssql = `SELECT * FROM cards LIMIT 26`;
    
    db.query(cardssql, (err, rows) => {
        if(err) throw err;
        res.render('cards', {cards: rows});
    });

    

});

app.get('/signup', (req,res) => {
    res.render('signup');

   
    });

    app.post('/signup', (req, res) => {
        const firstname = req.body.firstname;
        const surname = req.body.surname;
        const email = req.body.email;
        const role = req.body.role;
    
        const InsertusersSQL = 'INSERT INTO users (firstname, surname, email, role) VALUES ("firstname}", "${surname}","${email}","${role}");';
        
        db.query(InsertusersSQL, [firstname, surname, email, role], (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
        
  
 app.get('/mycollection', (req, res) => {
    const showsql = `SELECT * FROM mycollection WHERE user_ID = 1`;

    db.query(showsql, (err, rows) => {
        if (err) throw err;

       // Assuming you have a 'cards' variable available here
        const cards = rows; 

        res.render('mycollection', { mycollection: rows, cards: cards });
   });
 });




app.get('/carddetails', (req, res) => {
    let cardid = req.query.card_id;

    
    if (cardid === undefined) {
        console.error('card_id is undefined');
        res.status(400).send('card_id is required');
        return;
    }

    let readsql = `
        SELECT DISTINCT cards.card_id, cards.card_name, cards.HP, cards.type, cards.evolve_stage, 
        cards.description, cards.rarity, cards.card_num, cards.price, cards.image 
        FROM cards 
        WHERE card_id = ?;
    `;

    db.query(readsql, [cardid], (err, rows) => {
        if (err) {
            console.error('Error in SQL query:', err);
            throw err;  
        }

        if (rows.length === 0) {
            console.error('No rows found for the given card_id:', cardid);
           
            res.status(404).send('Card not found');
            return;
        }

        let cards = rows.map(row => ({
            card_id: row['card_id'],
            name: row['card_name'],
            image: row['image'],
            HP: row['HP'],
            Type: row['type'],
            Evolve: row['evolve_stage'],
            description: row['description'],
            rarity: row['rarity'],
            Price: row['price']

        }));

        res.render('carddetails', { cards });
    });
});



app.get('/viewseries', (req, res) => {
    let settid = req.query.set_id; // Use set_id instead of settid

    if (settid === undefined) {
        console.error('setid is undefined');
        res.status(400).send('setid is required');
        return;
    }

    let readsql = `
        SELECT DISTINCT cards.card_id, cards.card_name, cards.HP, cards.type, cards.evolve_stage, 
        cards.description, cards.rarity, cards.card_num, cards.price, cards.image 
        FROM cards 
        WHERE set_id = ?;
    `;

    db.query(readsql, [settid], (err, rows) => {
        if (err) {
            console.error('Error in SQL query:', err);
            throw err;
        }

        if (rows.length === 0) {
            console.error('No rows found for the given setid:', settid);
            res.status(404).send('Set not found');
            return;
        }

        let cards = rows.map(row => ({
            card_id: row['card_id'],
            name: row['card_name'],
            image: row['image'],
            HP: row['HP'],
            Type: row['type'],
            Evolve: row['evolve_stage'],
            description: row['description'],
            rarity: row['rarity'],
            Price: row['price']
        }));

        // Pass the 'cards' variable to the 'viewseries' template
        res.render('viewseries', { cards });
    });
});

app.get('/addcard', (req,res) => {
    res.render('addcard');

});
    
app.get('/home', (req,res) => {
    res.render('home');

});

app.listen(3000, () => { 
    console.log("server started on: http://localhost:3000/");
});


