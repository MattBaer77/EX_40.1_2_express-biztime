

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

        const industryName = req.body.industry_name

        if (!industryName) {
            throw new ExpressError(`Error!: Could not create this industry. Bad Request - 'industry' must have properties: 'industry_name'`, 400)
        }

        const code = slugify(req.body.industry_name, {replacement:"-", lower:true, strict:true, trim:true})

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

/*
POST /industries/:id
Adds companies to that industry.

Needs to be given JSON like: {companies: [c_code...]}
Returns obj of that industry with its associated companies: {industry_name, [companies.name ...]}
*/

// router.post('/:i_code', async (req, res, next) => {

//     try{

//         let message = "All of your company codes were valid."

//         const validCompanies = await db.query(`SELECT c_code, name FROM companies`);

//         const validCompaniesCodes = validCompanies.rows.map((r) => {
//             return r.c_code
//         })

//         console.log(validCompaniesCodes)

//         companies = req.body.companies

//         console.log(companies)

//         const verifiedCompaniesCodes = companies.filter((c) => {
//             if (validCompaniesCodes.indexOf(c) != -1){
//                 return c
//             }
//         })

//         console.log(verifiedCompaniesCodes)

//         if (companies.length === 0) {
//             throw new ExpressError(`Error!: None of the company codes in your request are valid!`, 400)
//         }

//         if (companies.length != verifiedCompaniesCodes.length) {

//             message = "Note: some of your company codes were not valid and were not added to this industry."

//         }

//         const result = await db.query(
//             ``
//             )





//     }catch(e){

//         return next(e);

//     }







// })

/*
PUT /industries/:id
Adds companies to that industry.

Needs to be given JSON like: {company: c_code}
Returns obj of that industry with its associated companies: {industry_name, [companies.name ...]}
*/

router.put('/:i_code', async (req, res, next) => {

    try{

        const validCompanies = await db.query(`SELECT c_code, name FROM companies`);

        const validCompaniesCodes = validCompanies.rows.map((r) => {
            return r.c_code;
        })

        const requestedCcode = req.body.company;

        if (validCompaniesCodes.indexOf(requestedCcode) < 0) {
            throw new ExpressError("Requested company code is not valid!", 400);
        }

        const requestedIndustry = req.params.i_code;

        const result = await db.query(
            `INSERT INTO company_industry (comp_code_ind, industry_code )
            VALUES ($1, $2)
            RETURNING comp_code_ind, industry_code
            `,[requestedCcode, requestedIndustry]
            )

        return res.json(result.rows)
 
    }catch(e){

        return next(e);

    }

})




module.exports = router;