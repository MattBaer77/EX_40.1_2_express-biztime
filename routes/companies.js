

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// slugify
const slugify = require('slugify')

/*
GET /companies
Returns list of companies, like {companies: [{code, name}, ...]}
*/
router.get('/', async (req, res, next) => {

    try{

        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({companies: results.rows})

    } catch(e) {

        return next(e);

    }

})


/*
GET /companies/[code]
Return obj of company: {company: {code, name, description}}
If the company given cannot be found, this should return a 404 status response.
Add Invoices
*/
// router.get('/:code', async (req, res, next) => {

//     try{

//         const result = await db.query(
//             `SELECT c.code, c.name, c.description, i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date
//             FROM companies AS c
//             LEFT JOIN invoices AS i
//             ON c.code = i.comp_code
//             WHERE code = $1;`,
//         [req.params.code]);

//         if (result.rows.length === 0) {
//             throw new ExpressError(`Error!: No company found with code "${req.params.code}"`, 404)
//         }

//         const {code, name, description} = result.rows[0];

//         const invoices = result.rows.map((r) => {
            
//             if (r.id != null) {
//                 return {id: r.id, comp_code: r.comp_code, amt: r.amt, paid: r.paid, add_date: r.add_date, paid_date : r.paid_date}
//             }

//         })

//         return res.json({"company" : {code, name, description, invoices}})

//     } catch(e){

//         return next(e);

//     }

// })


/*
GET /companies/[code]
Return obj of company: {company: {code, name, description}}
If the company given cannot be found, this should return a 404 status response.
Add Industry
*/
router.get('/:code', async (req, res, next) => {

    try{

        const result = await db.query(
            `SELECT c.c_code, c.name, c.description, i.i_code, i.industry_name
            FROM companies AS c
            JOIN company_industry AS x ON c.c_code = x.comp_code_ind
            JOIN industries AS i ON x.industry_code = i.i_code
            WHERE c.c_code = $1;`,
        [req.params.code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with code "${req.params.code}"`, 404)
        }

        console.log(result.rows)

        const {c_code, name, description} = result.rows[0];

        const industries = result.rows.map((r) => {
            
            if (r.industry_name != null) {
                return {
                    industry_name : r.industry_name
                }
            }

        })

        return res.json({"company" : {c_code, name, description, industries}})

    } catch(e){

        return next(e);

    }

})


/*
POST /companies
Adds a company.
Needs to be given JSON like: {code, name, description}
Returns obj of new company: {company: {code, name, description}}
*/
router.post('/', async (req, res, next) => {

    try{

        const name = req.body.name

        if (!name) {
            throw new ExpressError(`Error!: Could not create this company. Bad Request - 'companies' must have properties: 'name'`, 400)
        }

        const code = slugify(req.body.name, {replacement:"-", lower:true, strict:true, trim:true})
        console.log(name)
        const description = req.body.description

        const result = await db.query(
            `INSERT INTO companies
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        )

        return res.json(result.rows[0])

    } catch(e){

        if (e.code === '23505') {
            e = new ExpressError(`Error!: Could not create this company`, 400)
        }

        if (e.code === '23502') {
            e = new ExpressError(`Error!: Could not create this company. Bad Request - 'companies' must have properties: 'code' and 'name'`, 400)
        }

        return next(e);
    }

})


/*
PUT /companies/[code]
Edit existing company.

Should return 404 if company cannot be found.

Needs to be given JSON like: {name, description}

Returns update company object: {company: {code, name, description}}
*/
router.put('/:code', async (req, res, next) => {

    try{

        const code = req.params.code
        const name = req.body.name
        const description = req.body.description

        if (!name) {
            throw new ExpressError(`Error!: Could not edit this company. Bad Request - 'companies' must have properties: 'name'`, 400)
        }

        const result = await db.query(
            `UPDATE companies SET name = $2, description = $3 WHERE code = $1
            RETURNING code, name, description`,
            [code, name, description]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with code "${req.params.code}"`, 404)
        }

        return res.json(result.rows[0])

    } catch(e){

        return next(e);

    }

})


/*
DELETE /companies/[code]
Deletes company.

Should return 404 if company cannot be found.

Returns {status: "deleted"}
*/

router.delete('/:code', async (req, res, next) => {

    try{

        const code = req.params.code

        const result = await db.query(
            `DELETE FROM companies WHERE code = $1
            RETURNING code, name, description`,[code]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with code "${req.params.code}"`, 404)
        }

        return res.json({status:"deleted"})

    } catch(e) {

        return next(e);

    }

})


module.exports = router;