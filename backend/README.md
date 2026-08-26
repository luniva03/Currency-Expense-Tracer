# Currency & Expense Tracker - Backend

The backend of the Currency & Expense Tracker is built using Node.js and Express. It handles expense management, validation, and currency conversion requests from the frontend.

## Technologies Used

- Node.js
- Express
- CORS
- Frankfurter API

## Setup and Run

Install the dependencies:
npm install

Start the backend server:
npm start

The backend will run at:
http://localhost:5000

## API Endpoints

- GET `/expenses` - Returns all expenses
- POST `/expenses` - Adds a new expense
- DELETE `/expenses/:id` - Deletes an expense
- GET `/convert` - Converts an amount between currencies

## Currency Conversion

The backend uses the Frankfurter API to get exchange rates. The frontend sends the conversion request to the backend, and the backend communicates with the external API.
No API key is required.

## Data Storage

The expenses are stored in memory using a JavaScript array. Therefore, the expense data is cleared when the backend server is restarted.

## Assumptions and Future Improvements

The project currently uses in-memory storage and a limited list of currencies. With more time, a database could be added for permanent storage, along with more currencies, automated tests, and improved error handling.