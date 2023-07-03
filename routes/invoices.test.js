process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app')

const db = require('../db')

// Companies
let testCompany1 = {code: "test1co", name: "Test1Co", description : "The first test company"};
let testCompany2 = {code: "test2co", name: "Test2Co", description : "The second test company"};

// Malformed testcompanies

// No Code
let testCompany3 = {name: "Test3Co", description : "The third test company"};

// No Name
let testCompany4 = {code: "test4co", description : "The fourth test company"};

// No Description
let testCompany5 = {code: "test5co", name: "Test5Co"};

// Invoices
let testInvoice1 = {}

// beforeAll(async() => {
//     await db.query(
//         `DELETE FROM companies
//         WHERE code = 'test1co'
//         RETURNING code, name, description`
//         )
// })

beforeEach(async() => {
    await db.query(
        `INSERT INTO companies
        VALUES ('${testCompany1.code}', '${testCompany1.name}', '${testCompany1.description}')
        RETURNING code, name, description`
        )

    await db.query(
        `INSERT INTO invoices
        VALUES ('${testCompany1.code}', '${testCompany1.name}', '${testCompany1.description}')
        RETURNING code, name, description`
        )
})

afterEach(async() => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async() => {
    await db.end()
})