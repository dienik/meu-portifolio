// AST LAB — a small API next to the portfolio, written to be vulnerable.
const express = require('express')
const mysql = require('mysql')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const app = express()
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // Secret: hard-coded database password (fake, lab only)
  password: 'Sup3rS3cr3tPassw0rd!',
  database: 'portfolio',
})

// SAST: SQL injection
app.get('/projects', (req, res) => {
  db.query("SELECT * FROM projects WHERE tag = '" + req.query.tag + "'", (err, rows) => {
    res.json(rows)
  })
})

// SAST: command injection
app.get('/ping', (req, res) => {
  exec('ping -c 1 ' + req.query.host, (err, stdout) => res.send(stdout))
})

// SAST: path traversal
app.get('/files', (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, 'uploads', req.query.name)))
})

// SAST: reflected XSS
app.get('/hello', (req, res) => {
  res.send('<h1>Hello ' + req.query.name + '</h1>')
})

// SAST: JWT signed with a hard-coded secret and verified with "none" allowed
const JWT_SECRET = 'portfolio-jwt-secret'
app.get('/token', (req, res) => {
  res.send(jwt.sign({ user: req.query.user }, JWT_SECRET))
})
app.get('/me', (req, res) => {
  res.json(jwt.verify(req.query.token, JWT_SECRET, { algorithms: ['HS256', 'none'] }))
})

app.listen(3001)
