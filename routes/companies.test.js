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

// TESTS

describe("GET /companies", () => {
    test("Get all companies", async () => {

        const res = await request(app).get("/companies")

        expect(res.statusCode).toBe(200)
        expect(res.body.companies[0].code).toEqual(testcompany.code)

    })
})

describe("GET /companies/:code", () => {
    test("Get a company by code", async () => {

        const res = await request(app).get("/companies/test1co")

        expect(res.statusCode).toBe(200)
        expect(res.body.company.code).toEqual(testcompany.code)
        expect(res.body.company.name).toEqual(testcompany.name)
        expect(res.body.company.description).toEqual(testcompany.description)

    })

    test("Get a company by code - does not exist", async () => {

        const res = await request(app).get("/companies/notAValidCompany")

        expect(res.statusCode).toBe(404)
    })

})

describe("POST /companies", () => {
    
    test("Post a new company - SUCCESS", async () => {

        const res = await request(app).post("/companies").send(testcompany2)
        expect(res.statusCode).toBe(200);

    })

    test("Post a new company - SUCCESS - No Description", async () => {

        const res = await request(app).post("/companies").send(testcompany5)
        expect(res.statusCode).toBe(200);
        expect(res.body.code).toEqual(testcompany5.code)
        expect(res.body.name).toEqual(testcompany5.name)
        expect(res.body.description).toEqual(null)

    })

    test("Post a new company - ERROR - No Code", async () => {

        const res = await request(app).post("/companies").send(testcompany3)
        expect(res.statusCode).toBe(400);
        expect(res.body.code).toEqual(undefined)
        expect(res.body.name).toEqual(undefined)
        expect(res.body.error.message).toEqual("Error!: Could not create this company. Bad Request - 'companies' must have properties: 'code' and 'name'")

    })

    test("Post a new company - ERROR - No Name", async () => {

        const res = await request(app).post("/companies").send(testcompany4)
        expect(res.statusCode).toBe(400);
        expect(res.body.code).toEqual(undefined)
        expect(res.body.name).toEqual(undefined)
        expect(res.body.error.message).toEqual("Error!: Could not create this company. Bad Request - 'companies' must have properties: 'code' and 'name'")

    })


})
