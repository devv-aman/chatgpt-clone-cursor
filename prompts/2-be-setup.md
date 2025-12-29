<!-- This prompt is used to setup the backend for the chatgpt-clone-cursor project. -->

<context>
    You're a senior software engineer with 10+ years of experience in backend development.
    You're working on a project to create a backend for the chatgpt-clone-cursor project.
</context>

<goal>
    Create a backend+typescript boilerplate containing following features in "be" directory
</goal>

<features>
    - Node.js
    - TypeScript
    - Supabase (Just DB)
    - Express
    - JWT
    - Zod
    - Pino
</features>

<instructions>
    - Project name will be chatgpt-clone-cursor-be
    - Keep the project structure clean and modular.
    - Keep the code DRY and maintainable.
    - Keep the code readable and easy to understand.
    - Keep the code efficient and performant.
    - Use pnpm as the package manager.
    - Keep tsconfig.json to include the jsons for node, app, and test.
    - Use the latest version of Node.js, TypeScript, Supabase, Express, JWT, Zod, and Pino.
    - Setup a global error handler for the backend.
    - Setup a global authentication middleware for the backend.
    - Setup a global error handling middleware for the backend.
    - Setup a global logging middleware for the backend using Pino.
    - Use Supabase just for the database, do not use Supabase Auth for authentication, use JWT for authentication.
    - 
    - Create Swagger documentation for the backend using swagger-jsdoc and swagger-ui-express.
    - Create a swagger.json file in the root of the project.

    - Setup a user model with the following fields:
        - id
        - name
        - email
        - password
        - role (user, admin)
        - created_at
        - updated_at
        - deleted_at
    - Setup a chat model with the following fields
    - Each chat can have multiple user and ai messages, Create separate message model for each chat
        - id
        - user_id
        - model_id
        - model_name
        - tokens_used
        - message
        - created_at
        - updated_at
        - deleted_at
    - Setup routes for the following endpoints:
        - (Register & Login) POST /api/v1/auth/register
        - (Login)POST /api/v1/auth/login
        - (Refresh Token) POST /api/v1/auth/refresh
        - (Logout) POST /api/v1/auth/logout
        - (Get User Details) GET /api/v1/auth/me

</instructions>

<testing>
    - Setup unit tests for the backend using jest.
    - Setup integration tests for the backend using supertest.
    - Setup end to end tests for the backend using Playwright.
</testing>

<guardrails>
    - Do not use any external libraries or frameworks unless absolutely necessary.
    - Never hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Do not hardcode any api urls in the code. Always use a common constants file for the api urls if common and if local to the component, use a local constants file.
    - Do not use "any" type in the code. Always use the correct type for the variables.
</guardrails>
