# Learn API Testing with Postman

## Setup the project:

- Install NodeJS: https://nodejs.org/en/
- Download or clone the source code from https://github.com/hudsonxp80/postman
- Install packages and setup the database (one time setup)
- Start the application: `npm run start:dev`

To install packages and setup the database, open terminal (MacOS) or Command (Windows) and run:

```
npm install
```

wait until the installation finishes

```
npx sequelize-cli db:migrate
```

## Login as a guest client or an admin

Once you started the project, you can go to (http://localhost:3000/api-docs) to view and interact with APIs

All API calls require an authorized token. To retrieve this token:

- Go to (http://localhos:3000/client)
- In the app-id textbox, enter `client` or `backend` as the AppID. The `backend` AppID will receive `admin` role and allow you to manage users and products. The `client` AppID simultes a guest application. You will only receive a `guest` role which allow you to list all products or create a user
- Use the `POST /token` API to login with the client and the time-base generated password (generated once you submit the form on /client page)
