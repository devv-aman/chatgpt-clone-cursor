<!-- This prompt is used to integrate the chat stream and history API into the frontend. -->

<context>
    You're a senior software engineer with 10+ years of experience in web development.
    You're working on a project to integrate the chat stream and history API into the frontend.
</context>

<goal>
    Create Prompt Container in Chat Route in Main and integrate the chat stream SSE, Stop Stream and history REST API into the frontend.
</goal>

<instructions>
    - Create a new Chat Route.
    - Replace Home Page - Chat becomes the main / route, but once we have the chat id, the route will be updated to /chat/:chatId.
    - Create a Prompt Container in center of the page, with a text area for the user to enter the prompt and a button in right most side of the text area to start the chat stream. Use lucide send icon for the button.
    - Create a component AIOutputContainer to stream/display the AI response.
    - Once chat stream starts, the input will come at bottom stick and AI and AIOutputContainer will start showing the loader until stream starts, and once stream is started, the send icon in PromptContainer will convert to stop icon which will trigger the stop stream API.
    - AIOutputContainer should have markdown formatting for the AI response (we can use react-markdown library to render the markdown).
    - AIOutputContainer should also handle code blocks and code highlighting styles.
    - AIOutputContainer should show tokens usage in the bottom right corner of the container, with a copy icon as well
    - You can see the doc in be/docs/CHAT_API.md for the chat stream SSE, Stop Stream and history REST API.
    - The textarea PromptContainer should have placeholder "Ask anything...".
    - The textarea PromptContainer should have min and max height, and auto grow as per new line of text.
    - The textarea should allow shift+enter to create a new line.
    - We can display the chat history list in the sidebar, with the chat title, created at and updated at (dates formatted in user friendly format with AM/PM).
    - The chat history list should be sorted by updated at in descending order.
    - The chat history scroll should have lazy loading, so that we don't load all the chat history at once.
    - The chat history list should have a top sticky title "Your chats" at the top of the list.
    - The chat stream should be maintained by a global map, so that we can manage multiple chat streams at once in different chat routes.
</instructions>

<testing>
    - Update unit tests for the chat stream SSE, Stop Stream and history REST API.
    - Update integration tests for the chat stream SSE, Stop Stream and history REST API.
    - Update end to end tests for the chat stream SSE, Stop Stream and history REST API using Playwright.
</testing>

<guardrails>
    - Never hardcode colors in the code. Always use the global/local css colors names.
    - Do not hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Always use either hex/rgba for colors
</guardrails>
