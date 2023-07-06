\c biztime

DROP TABLE IF EXISTS company_industry;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    c_code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code_inv text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    i_code text PRIMARY KEY,
    industry_name text NOT NULL
);

CREATE TABLE company_industry (
    id serial PRIMARY KEY,
    comp_code_ind text NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code_inv, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES ('acct', 'Accounting'),
         ('id', 'Industrial Design'),
         ('prty', 'Party Planning'),
         ('pet', 'Pet Petting');

INSERT INTO company_industry (comp_code_ind, industry_code)
  VALUES ('apple', 'pet'),
         ('ibm', 'prty'),
         ('ibm', 'pet'),
         ('ibm', 'acct');