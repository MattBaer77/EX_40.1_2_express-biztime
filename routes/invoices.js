

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


/*
GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}
*/
router.get('/', async (req, res, next) => {

    try{

        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({invoices: results.rows})

    } catch(e) {

        return next(e);

    }

})


/*
GET /invoices/[id]
Returns obj on given invoice.
If invoice cannot be found, returns 404.
Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
*/
router.get('/:id', async (req, res, next) => {

    try{

        const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [req.params.id])

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with id "${req.params.id}"`, 404)
        }

        return res.json({company: result.rows[0]})

    } catch(e){

        return next(e);

    }

})


/*
POST /invoices
Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.post('/', async (req, res, next) => {

    try{

        const id = req.body.id
        const comp_code = req.body.comp_code
        const amt = req.body.amt

        const result = await db.query(
            `INSERT INTO invoices
            VALUES ($1, $2, $3)
            RETURNING id, comp_code, amt`,
            [id, comp_code, amt]
        )

        return res.json(result.rows[0])

    } catch(e){

        if (e.id === '23505') {
            e = new ExpressError(`Error!: Could not create this company`, 403)
        }

        return next(e);
    }

})


/*
PUT /invoices/[id]
Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.put('/:id', async (req, res, next) => {

    try{

        const id = req.params.id
        const comp_code = req.body.comp_code
        const amt = req.body.amt

        const result = await db.query(
            `UPDATE invoices SET comp_code = $2, amt = $3 WHERE id = $1
            RETURNING id, comp_code, amt`,
            [id, comp_code, amt]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with id "${req.params.id}"`, 404)
        }

        return res.json(result.rows[0])

    } catch(e){

        return next(e);

    }

})


/*
DELETE /invoices/[id]
Deletes an invoice.
If invoice cannot be found, returns a 404.
Returns: {status: "deleted"}
*/

router.delete('/:id', async (req, res, next) => {

    try{

        const id = req.params.id

        const result = await db.query(
            `DELETE FROM invoices WHERE id = $1
            RETURNING id, comp_code, amt`,[id]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with id "${req.params.id}"`, 404)
        }

        return res.json(result.rows[0])

    } catch(e) {

        return next(e);

    }

})


module.exports = router;

/*
Also, one route from the previous part should be updated:

GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response.
*/