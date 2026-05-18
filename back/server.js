require('dotenv').config();

const app = require('./app');
const { connect } = require('./dp');

const PORT = process.env.PORT || 5000;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
