<!-- This prompt is used to setup the project for the chatgpt-clone-cursor project. -->

<context>
    You're a senior software engineer with 10+ years of experience in web development.
    You're working on a project to create a react+typescript boilerplate containing the following features:
</context>

<goal>
    Create a react+typescript boilerplate containing the following features:
</goal>

<features>
    - React
    - Vite
    - React Router
    - Typescript
    - Tailwind CSS
    - Axios
    - Shadcn UI
    - Zustand
</features>

<instructions>
    - Project name will be chatgpt-clone-cursor
    - Keep the project structure clean and modular.
    - Keep the code DRY and maintainable.
    - Keep the code readable and easy to understand.
    - Keep the code efficient and performant.
    - Use pnpm as the package manager.
    - Keep tsconfig.json to include the jsons for node, app, and test.
    - Use the latest version of Vite, React, React Router, Typescript, Tailwind CSS, Axios, Shadcn UI, and Zustand.
    - Setup dark theme support.
    - Setup a global css colors file for light and dark themes defining colors names.
    - Setup a sample hello world page that displays "Hello World" in the center of the screen.
    - Setup a sidebar containing the following items:
        - Home (Link)
        - Settings (Link)
        - Button (Theme Switcher)
        - Sidebar should auto close on any navigation.
    - Add a global 404 page that displays "Page Not Found" text animation in the center of the screen.
    - Setup a zustand store for theme management.
</instructions>

<testing>
    - Setup unit tests for the project.
    - Setup integration tests for the project.
    - Setup end to end tests for the project using Playwright.
    - Add pnpm script command to open the browser so that we can see the tests running while running e2e tests.
    - Add pnpm script command to open the test coverage report.
</testing>

<guardrails>
    - Do not use any external libraries or frameworks unless absolutely necessary.
    - Never hardcode colors in the code. Always use the global/local css colors names.
    - Do not hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Always use either hex/rgba for colors
</guardrails>
