const express = require('express')
const app = express()
const port = 8080
var session = require('express-session')
var path = require('path');
var router = express.Router();  

var sess = {
  secret: 'nntu adtekdev',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000
  }
}
 
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
 


/// ***************** ***************** *****************
/// ***************** ***************** SET

app.use(express.static('public'));          
app.set('view engine', 'ejs');              ///***** */
app.use(session(sess));
app.use(process.env.Port|| 3000,function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


/// ***************** ***************** *****************
/// ***************** ***************** Config DB CONNECTION
const MongoClient = require('mongodb').MongoClient;
const mongosee = require('mongoose');

/// *****************  Models
const Product = require('./models/product');
const Staff = require('./models/staff');


/// *****************  Controllers
const viewLogin = require('./controllers/logincontroller');

/// ***************** 
const uri = 'mongodb://localhost:27017/atnshop';
const urirem = "mongodb+srv://db03:aGBZRta11CBmt8qL@cluster0-q8a6f.mongodb.net/CloudDB?retryWrites=true&w=majority";


/// ***************** ***************** *****************
/// ***************** Database & Bảng dữ liệu cần Truy vấn
const NameDataBase =  "atnshop"; // "CloudDB";
var xflag = 0;
var vResult = [];
var accLogin = null;


/// ***************** ***************** *****************
async function runQuery(NameTable , vQuery) {
	
	const xdbo = await MongoClient.connect(
		uri, 
		{ useNewUrlParser: true , useUnifiedTopology: true }
    );    
	const dbo = xdbo.db(NameDataBase);
	////// Run - Query
	const results = await dbo.collection(NameTable).find(vQuery).toArray();

    ///
    vResult = results;
    console.log(results);
    xflag = 1;

	return results;
}

/// *****************
async function readDB() {
    const inf = await runQuery( "Products" , {} );
    vResult = inf;
    xflag = 1;
}


/// ***************** 
async function responseDB(response, xview, xModel, xQuery, xparams, xtag, xNext="error") {

    const xdb = await mongosee.connect(
        uri, 
        { useNewUrlParser: true , useUnifiedTopology: true }
    );
    
    if (xdb) 
    {
        //xQuery = { Password : "" , _id : ""};
        const kq = await xModel.find(xQuery).exec();

        if (kq) {
            xparams[xtag] = kq;            
            console.log(xview + "\t THanh cong !");
            response.render(xview, xparams);
        } else {
            response.render(xNext, { mesg : "... KO co Data DB ! "} );
        }
    } else {
        response.send("ko thanh cong !");
        //response.redirect('/login');
    }

}


/// ***************** ***************** *****************
app.get('/', viewHome);
function viewHome(request, response) {

    response.render("home", { username : request.session.login_user ,  mesg : JSON.stringify(request.session) });
}


/// ***************** ***************** *****************
app.get('/login', viewLogin);



/// ***************** ***************** *****************
app.get('/products', viewProducts);
async function viewProducts(request, response) {
    if (typeof (request.session.login_user) == "undefined")
    {
        response.redirect("/login");
    }
    responseDB(response, "productlist",
				Product, {}, { username : request.session.login_user }, "productlist");
}


/// ***************** ***************** *****************
app.get('/staffs', viewStaffs);
async function viewStaffs(request, response) {
    responseDB(response, "stafflist",
				Staff, {}, { username : request.session.login_user }, "stafflist");
}


/// ***************** ***************** *****************
app.get('/product/:stt', viewProduct);
function viewProduct(request, response) {
	// request.params.stt;
    var stt = Number(request.params.stt);

    // const inf = await runQuery( "Products" , {} );
    if (xflag == 0) {
        readDB();
        response.send("Web - Product Catalog page !" + stt);
    } else {
        console.log(vResult[stt]);
        response.render("productdetail", vResult[stt]);
    }

}


/// ***************** ***************** *****************
app.get('/order', viewOrder);
function viewOrder(request, response) {
    responseDB(response, "order",
				Product, {}, { username : request.session.login_user }, "productlist");
}



/// /payment
/// ***************** ***************** *****************
app.get('/payment', viewPayment);
function viewPayment(request, response) {
    //response.send("Web - PAYMENT page !" + request.query.dssp);
    var dssp = request.query.dssp;
    var listkq = dssp.split("_");

    listsp = [];
    for (i=0; i< listkq.length / 2; i++) {
        listsp.push(
            { Name : "Tivi " + listkq[i*2], Price : 30000, Num: listkq[i*2+1]},
        );
    }
    

    response.render("payment", { username : request.session.login_user , productlist : listsp });
}



/// ***************** ***************** *****************
app.get('/report', viewReport);
function viewReport(request, response) {
    response.send("Web - REPORT page !");
}


/// ***************** ***************** *****************
app.get('/profile/:msnv', viewProfile);
function viewProfile(request, response) {
    var strMS = "" + request.params.msnv;
 
    responseDB(response, "staffdetail",
    Staff, { MSNV : strMS}, {}, "stafflist");
}


/// ***************** ***************** *****************
app.get(/.*\.nntu$/, viewSecret);
function viewSecret(request, response) {
    response.send("Web - Secret page ! " + request.url);
}




/// ***************** ***************** *****************
app.get('/review', viewReview);
function viewReview(request, response) {
    response.send("<H1> REVIEW ASSIGNMENT 2 ! </h1>");
}


/// ***************** ***************** *****************
/// ***************** ***************** *****************
/// ***************** ***************** *****************
app.listen(port, () => console.log(`\n\tWeb app listening at http://localhost:${port}`));
