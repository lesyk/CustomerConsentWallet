"use strict";

const Solc = require('solc');
const express = require('express');
const cors = require('cors');

let app = express()
app.use(cors());
app.options('*', cors());

app.post('/', function (req, res) {
  console.log(`Source:\n`, req.query.source);

  if(req.query.source.length > 0) {
    let compiledSource = Solc.compile(req.query.source, 1);
    
    console.log(`Compiled Source:\n`, compiledSource);
    res.send(compiledSource);
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})