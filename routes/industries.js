

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// slugify
const slugify = require('slugify')

/*
GET /industries
Shows all industries
*/

router.get('/', async (req, res, next) => {

    try{

        const results = await db.query(`SELECT i_code, industry_name FROM industries`);
        return res.json({industries: results.rows})

    } catch(e) {

        return next(e);

    }

})


/*
POST /industries
Add an industry.

Needs to be given JSON like: {industry_name}
Returns obj of new industry: {industry: {i_code, industry_name}}
*/

router.post('/', async (req, res, next) => {

    try{

        console.log(req.body.industry_name)

        const industryName = req.body.industry_name

        console.log(industryName)

        if (!industryName) {
            throw new ExpressError(`Error!: Could not create this industry. Bad Request - 'industry' must have properties: 'industry_name'`, 400)
        }

        const code = slugify(req.body.industry_name, {replacement:"-", lower:true, strict:true, trim:true})
        console.log(industryName)

        const result = await db.query(
            `INSERT INTO industries
            VALUES ($1, $2)
            RETURNING i_code, industry_name;`,
            [code, industryName]
        )

        return res.json(result.rows[0])

    } catch(e){

        if (e.code === '23505') {
            e = new ExpressError(`Error!: Could not create this industry - industry already exists`, 400)
        }

        return next(e);

    }

})

module.exports = router;