const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config()


const dbConnectionString = process.env.DB_CONNECTION_STRING
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(dbConnectionString);

const productSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    amountPerBox: Number,
    programId: String
});

const Product = mongoose.model('Product', productSchema);

const programSchema = new mongoose.Schema({
    name: String,
    backingProgram: Number,
});

const Program = mongoose.model('Program', programSchema);

app.use(bodyParser.json());
app.use(cors());

//
//  PROGRAM
//

app.get('/programs', async (req, res) => {
    try {
        const programs = await Program.find();
        res.json(programs);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/program', async (req, res) => {
    const {name, backingProgram} = req.body;
    const newProgram = new Program({
        name: name,
        backingProgram: backingProgram,
    });

    newProgram.save()
    .then(response => {
        res.status(200).send(JSON.stringify(newProgram));
    })
    .catch(error => {
        res.status(500).send(error);
    });
});

app.delete('/program/:id', async (req, res) => {
    const id = req.params.id;
    Program.findByIdAndDelete(id)
    .then((response) => {
        Product.deleteMany({programId: id}).then((result) => {
            console.log("Removing: " + result);
        })
        res.status(200).send("Removed program");
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

//
// Products
//

app.get('/product/:id', async (req, res) => {
    const programId = req.params.id;

    const products = Product.find({
        programId: programId
    }).then((result) => {
        res.status(200).send(JSON.stringify(result))
    });
});

app.post('/product', async (req, res) => {
    const {name, amount, amountPerBox, programId} = req.body;
    const newProduct = new Product({
        name: name,
        amount: amount,
        amountPerBox: amountPerBox,
        programId: programId
    });

    console.log(newProduct);

    newProduct.save()
    .then(response => {
        res.status(200).send(JSON.stringify(newProduct));
    })
    .catch(error => {
        res.status(500).send(error);
    });
});

app.put('/product/:id/:newAmount', async (req, res) => {
    const id = req.params.id;
    const newAmount = req.params.newAmount;

    const updatedProduct = Product.findByIdAndUpdate(id, { $set: {amount: newAmount}})
    .then((result) => {
        res.status(200).send(result);
    })
});

app.delete('/product/:id', async (req, res) => {
    const id = req.params.id;
    Product.findByIdAndDelete(id)
    .then((response) => {
        res.status(200).send("Removed program");
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});