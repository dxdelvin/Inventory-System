# ReportRepo WebsiteAdd commentMore actions
(current update - connect to moongese to make sure it works fully properly)
![image](https://github.com/user-attachments/assets/fdd861d9-8e2a-41bc-aadc-d1b63920f954)

## Description
The ReportRepo Website is a Node.js-based web application designed for handling user reports with features like:
- User authentication via OTP.
- Image metadata extraction (e.g., geotags).
- Admin panel for managing and viewing user-submitted data.
- Secure data handling using encryption for email storage.

The application supports MongoDB as the database, Sequelize for session handling, and integrates external services like AWS Lambda and OpenAI.

## Features
- User authentication with OTP.
- ![image](https://github.com/user-attachments/assets/de44351b-51ae-4818-8521-a8210237855d)

- Image geotag extraction from uploaded images.
- Report Crime privately
![image](https://github.com/user-attachments/assets/6ade650a-42eb-4fb4-8f40-43620da28ef0)

- Admin panel for managing reports and user messages. (/admin) 
  ![image](https://github.com/user-attachments/assets/5c3cced7-4a6f-4129-990b-f7daa5de4fe3)

- Encrypted email storage to ensure user data privacy.

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dxdelvin/reportrepo-website.git
   cd reportrepo-website
   ```

2. Install the dependencies:
   ```bash
   npm i -a
   ```

3. **Important:** If you're testing locally, comment out the `mongoose.connect` line at **line 345** in `server.js` to prevent MongoDB connection errors:
   ```js
   // mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
   ```

4. Start the server:
   ```bash
   npm start
   ```

6. The application will run on `http://localhost:3000`.

## Folder Structure
```
reportrepo-website/
├── public/             # Static files (CSS, JS, images)
├── views/              # EJS templates for rendering HTML
├── database.js         # Sequelize database configuration
├── session.js          # Session model definition
├── server.js           # Main application file
└── .env.example        # Environment variable example file
```

## Contribution Guidelines
We welcome contributions to enhance the functionality and fix issues. Here's how you can contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with clear messages:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push your branch to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request to the `main` branch of the original repository with a detailed description of your changes.

Feel free to open issues for bug reports, feature requests, or questions.

## Author
Delvin Dsouza  
Contact: [dxdelvin@gmail.com](mailto:dxdelvin@gmail.com)

## Repository
GitHub: [ReportRepo Website](https://github.com/dxdelvin/reportrepo-website)
