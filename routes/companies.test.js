process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app')

const db = require('../db')

let testCompany1 = {code: "test1co", name: "Test1Co", description : "The first test company"};
let testCompany2 = {code: "test2co", name: "Test2Co", description : "The second test company"};

// Malformed testcompanies

// No Code
let testCompany3 = {name: "Test3Co", description : "The third test company"};

// No Name
let testCompany4 = {code: "test4co", description : "The fourth test company"};

// No Description
let testCompany5 = {code: "test5co", name: "Test5Co"};

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
        expect(res.body.companies[0].code).toEqual(testCompany1.code)

    })
})

describe("GET /companies/:code", () => {
    test("Get a company by code", async () => {

        const res = await request(app).get("/companies/test1co")

        expect(res.statusCode).toBe(200)
        expect(res.body.company.code).toEqual(testCompany1.code)
        expect(res.body.company.name).toEqual(testCompany1.name)
        expect(res.body.company.description).toEqual(testCompany1.description)

    })

    test("Get a company by code - does not exist", async () => {

        const res = await request(app).get("/companies/notAValidCompany")

        expect(res.statusCode).toBe(404)
    })

})

describe("POST /companies", () => {
    
    test("Post a new company - SUCCESS", async () => {

        const res = await request(app).post("/companies").send(testCompany2)
        expect(res.statusCode).toBe(200);

    })

    test("Post a new company - SUCCESS - No Description", async () => {

        const res = await request(app).post("/companies").send(testCompany5)
        expect(res.statusCode).toBe(200);
        expect(res.body.code).toEqual(testCompany5.code)
        expect(res.body.name).toEqual(testCompany5.name)
        expect(res.body.description).toEqual(null)

    })

    // ELIMINATE TEST DUE TO SLUGIFY IMPLEMENTATION
    // test("Post a new company - ERROR - No Code", async () => {

    //     const res = await request(app).post("/companies").send(testCompany3)
    //     expect(res.statusCode).toBe(400);
    //     expect(res.body.code).toEqual(undefined)
    //     expect(res.body.name).toEqual(undefined)
    //     expect(res.body.error.message).toEqual("Error!: Could not create this company. Bad Request - 'companies' must have properties: 'code' and 'name'")

    // })

    test("Post a new company - ERROR - No Name", async () => {

        const res = await request(app).post("/companies").send(testCompany4)
        console.log(res.body)
        expect(res.statusCode).toBe(400);
        expect(res.body.code).toEqual(undefined)
        expect(res.body.name).toEqual(undefined)
        expect(res.body.error.message).toEqual("Error!: Could not create this company. Bad Request - 'companies' must have properties: 'name'")

    })


})

describe("PUT /companies/:code", () => {

    test("Put - edit a company - name/description - SUCCESS", async () => {

        const res = await request(app).put(`/companies/${testCompany1.code}`).send(testCompany3)

        expect(res.statusCode).toBe(200)
        expect(res.body.code).toBe(testCompany1.code)
        expect(res.body.name).toBe(testCompany3.name)
        expect(res.body.description).toBe(testCompany3.description)

    })

    test("Put - edit a company - name only - SUCCESS", async () => {

        const res = await request(app).put(`/companies/${testCompany1.code}`).send(testCompany5)

        expect(res.statusCode).toBe(200)
        expect(res.body.code).toBe(testCompany1.code)
        expect(res.body.name).toBe(testCompany5.name)
        expect(res.body.description).toBe(null)

    })

    test("Put - edit a company - name/description - SUCCESS - SENT WITH CODE (Disregarded)", async () => {

        const res = await request(app).put(`/companies/${testCompany1.code}`).send(testCompany2)

        expect(res.statusCode).toBe(200)
        expect(res.body.code).toBe(testCompany1.code)
        expect(res.body.name).toBe(testCompany2.name)
        expect(res.body.description).toBe(testCompany2.description)

    })

    test("Put - edit a company - description only - ERROR", async () => {

        const res = await request(app).put(`/companies/${testCompany1.code}`).send(testCompany4)

        expect(res.statusCode).toBe(400)
        expect(res.body.code).toBe(undefined)
        expect(res.body.name).toBe(undefined)
        expect(res.body.description).toBe(undefined)
        expect(res.body.error.message).toEqual("Error!: Could not edit this company. Bad Request - 'companies' must have properties: 'name'")

    })

    test("Put - edit a company - name/description - ERROR - INCORRECT CODE", async () => {

        const res = await request(app).put(`/companies/notAValidCompany`).send(testCompany3)

        expect(res.statusCode).toBe(404)
        expect(res.body.code).toEqual(undefined)
        expect(res.body.name).toEqual(undefined)
        expect(res.body.error.message).toEqual(`Error!: No company found with code "notAValidCompany"`)

    })

})

describe("DELETE /companies/:code", () => {

    test("Delete - delete a company - SUCCESS", async () => {

        const res = await request(app).delete(`/companies/${testCompany1.code}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.status).toEqual("deleted")

    })

    test("Delete - delete a company - FAIL - DOES NOT EXIST", async () => {

        const res = await request(app).delete(`/companies/notAValidCompany`)

        expect(res.statusCode).toBe(404)
        expect(res.body.error.message).toEqual(`Error!: No company found with code "notAValidCompany"`)

    })

})