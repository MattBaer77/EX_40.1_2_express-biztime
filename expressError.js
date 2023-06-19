/** ExpressError extends the normal JS error so we can easily
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 * 
 *  Modified to not console.error if in test mode to avoid nuisance notifications.
 */

if (process.env.NODE_ENV === 'test') {

  class ExpressError extends Error {
    constructor(message, status) {
      super();
      this.message = message;
      this.status = status;
    }
  }

  module.exports = ExpressError;

} else {

  class ExpressError extends Error {
    constructor(message, status) {
      super();
      this.message = message;
      this.status = status;
      console.error(this.stack);
    }
  }

  module.exports = ExpressError;

}

