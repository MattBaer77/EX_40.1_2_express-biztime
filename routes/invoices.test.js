process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app')

const db = require('../db')

let testcompany1 = {code: "test1co", name: "Test1Co", description : "The first test company"};
let testcompany2 = {code: "test2co", name: "Test2Co", description : "The second test company"};

// Malformed testcompanies

// No Code
let testcompany3 = {name: "Test3Co", description : "The third test company"};

// No Name
let testcompany4 = {code: "test4co", description : "The fourth test company"};

// No Description
let testcompany5 = {code: "test5co", name: "Test5Co"};

// beforeAll(async() => {
//     await db.query(
//         `DELETE FROM companies
//         WHERE code = 'test1co'
//         RETURNING code, name, description`
//         )
// })

beforeEach(async() => {
    const result = await db.query(
        `INSERT INTO companies
        VALUES ('${testcompany1.code}', '${testcompany1.name}', '${testcompany1.description}')
        RETURNING code, name, description`
        )

    testcompany = result.rows[0]
})

afterEach(async() => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async() => {
    await db.end()
})