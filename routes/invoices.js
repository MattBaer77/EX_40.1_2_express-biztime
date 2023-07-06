

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

        const result = await db.query( `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
                                        FROM invoices AS i
                                        JOIN companies AS c
                                        ON i.comp_code = c.code
                                        WHERE id = $1`,
                                        [req.params.id]
                                    )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No invoice found with id "${req.params.id}"`, 404)
        }

        const {id, amt, paid, add_date, paid_date, code, name} = result.rows[0]
        const invoice = {invoice: id, amt, paid, add_date, paid_date, company : {code, name}}

        return res.json(invoice)

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

        const comp_code = req.body.comp_code
        const amt = req.body.amt

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
            [comp_code, amt]
        )

        return res.json(result.rows[0])

    } catch(e){

        if (e.code === '23502') {
            e = new ExpressError(`Error!: Must include comp_code and amt in request`, 400)
        }

        if (e.code === '23503') {
            e = new ExpressError(`Error!: No company with code '${req.body.comp_code}'`, 403)
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
// router.put('/:id', async (req, res, next) => {

//     try{

//         const reqId = req.params.id
//         const reqAmt = req.body.amt

//         const result = await db.query(
//             `UPDATE invoices SET amt = $2 WHERE id = $1
//             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
//             [reqId, reqAmt]
//         )

//         if (result.rows.length === 0) {
//             throw new ExpressError(`Error!: No company found with id "${req.params.id}"`, 404)
//         }

//         const {id, comp_code, amt, paid, add_date, paid_date} = result.rows[0]

//         return res.json({invoice : {id, comp_code, amt, paid, add_date, paid_date}})

//     } catch(e){

//         if (e.code === '23502') {
//             e = new ExpressError(`Error!: Must include amt in request`, 400)
//         }
//         return next(e);

//     }

// })


/*
PUT /invoices/[id]
Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

MODIFIED

Needs to be passed in a JSON body of {amt, paid}
If paying an unpaid invoice - sets paid_date to today
if un-paying: sets paid_date to null
Else: keep current paid_date

*/
router.put('/:id', async (req, res, next) => {

    try{

        const reqId = req.params.id;
        const reqAmt = req.body.amt;
        const reqPaid = req.body.paid;
        let reqPaidDate = null

        if (reqPaid === undefined | reqPaid === null) {
            throw new ExpressError(`Error!: Request must include {amt, paid}`, 400)
        }

        if (reqPaid === false) {

            reqPaidDate = null

        }

        else {

            // Check for existing paid_date - move to standalone function later
            const checkResult = await db.query(
                `SELECT paid_date FROM invoices WHERE id = $1`, [reqId]
            )

            if (checkResult.rows[0].paid_date === null) {

                reqPaidDate = new Date

            }

            else {

                reqPaidDate = checkResult.rows[0].paid_date

            }

        }

        const result = await db.query(
            `UPDATE invoices SET amt = $2, paid = $3, paid_date = $4 WHERE id = $1
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [reqId, reqAmt, reqPaid, reqPaidDate]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Error!: No company found with id "${req.params.id}"`, 404)
        }

        const {id, comp_code, amt, paid, add_date, paid_date} = result.rows[0]

        return res.json({invoice : {id, comp_code, amt, paid, add_date, paid_date}})

    } catch(e){

        if (e.code === '23502') {
            e = new ExpressError(`Error!: Must include amt in request`, 400)
        }
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
            throw new ExpressError(`Error!: No company found with id '${req.params.id}'`, 404)
        }

        return res.json({status:"deleted"})

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