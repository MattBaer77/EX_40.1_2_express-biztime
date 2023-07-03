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
let testInvoice1 = {comp_code: testCompany1.code, amt: 1}
let testInvoice2 = {comp_code: testCompany1.code, amt: 2}

let testInvoice;

// beforeAll(async() => {
//     await db.query(
//         `DELETE FROM companies
//         WHERE code = 'test1co'
//         RETURNING code, name, description`
//         )
// })

// beforeAll(async () => {

//     await db.query(
//         `INSERT INTO companies
//         VALUES ('${testCompany1.code}', '${testCompany1.name}', '${testCompany1.description}')
//         RETURNING code, name, description`
//         )

// })

beforeEach(async() => {

    await db.query(
        `INSERT INTO companies
        VALUES ('${testCompany1.code}', '${testCompany1.name}', '${testCompany1.description}')
        RETURNING code, name, description`
        )

   const result= await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('${testCompany1.code}', ${testInvoice1.amt})
        RETURNING id, comp_code, amt, paid, add_date, paid_date;`
        )

   await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('${testCompany1.code}', ${testInvoice2.amt})
        RETURNING id, comp_code, amt, paid, add_date, paid_date;`
        )

    
    testInvoice = result.rows[0]

})

afterEach(async() => {
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM companies`)

})

afterAll(async() => {
    await db.end()
})

// Tests

describe("GET /invoices", () => {
    

    test("Get all invoices", async() => {

        const res = await request(app).get("/invoices")
        expect(res.statusCode).toBe(200)
        expect(res.body.invoices[0].comp_code).toEqual(testCompany1.code)
        expect(res.body.invoices[1].comp_code).toEqual(testCompany1.code)

    })

})

describe("GET /invoices/:id", () => {

    test("Get invoice by: id", async() => {

        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.amt).toEqual(testInvoice.amt)
        expect(res.body.company.code).toEqual(testInvoice.comp_code)

    })

    test("Get invoice by: id - NO INVOICE WITH THAT ID", async() => {

        const res = await request(app).get(`/invoices/${(testInvoice.id)-1}`)
        expect(res.statusCode).toBe(404)
        expect(res.body.error.message).toEqual(`Error!: No invoice found with id "${(testInvoice.id)-1}"`)

    })

})

