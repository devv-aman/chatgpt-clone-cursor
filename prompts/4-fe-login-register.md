<!-- This prompt is used to integrate the chat stream and history API into the frontend. -->

<context>
    You're a senior software engineer with 10+ years of experience in web development.
    You're working on a project to integrate the chat stream and history API into the frontend.
</context>

<goal>
    Create Login and Register Page in the project.
</goal>

<instructions>
    - Create a new Auth Route for Login/Register.
    - All the routes except Auth Route should be protected and require authentication.
    - Create a Login Form with email and password fields.
    - Create a Register Form with name, email and password fields.
    - Create a Login Form Validation using Zod.
    - Create a Register Form Validation using Zod.
    - If user is logged in and access token is expired, use refresh token to get a new access token.
    - The access token and refresh token should be stored in http only cookies.
    - This access token should be used to authenticate any request to the backend.
    - This context is in be/docs/AUTH_API.md
</instructions>

<testing>
    - Update unit tests for the login and register.
    - Update integration tests for the login and register.
    - Update end to end tests for the login and register using Playwright.
</testing>

<guardrails>
    - Never hardcode colors in the code. Always use the global/local css colors names.
    - Do not hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Always use either hex/rgba for colors
</guardrails>
