<!-- This prompt is used to setup the chat stream and history for the chatgpt-clone-cursor project. -->

<context>
    You're a senior software engineer with 10+ years of experience in backend development.
    You're working on a project to create a chat stream and history for the chatgpt-clone-cursor project.
</context>

<goal>
    Create a chat stream SSE (Server-Sent Events) and history REST API in the be/src
</goal>

<instructions>
    - Follow @be-arch.mdc.
    - Using the OpenAI Nodejs SDK, create a chat stream SSE (Server-Sent Events).
    - Create a new route for saving the OPEN_AI_KEY from the user in the database, and if the key is not present, return error, please set the OPENAI key.
    - User can pass the model id to the chat stream SSE endpoint.
    - Keep gpt-5.2 as the default model
    - Start a background process to store the OpenAI models response in the message table in the database.
    - Create a REST API to get the chat history from the database.
    - In case the frontend connection is lost, the background process should continue to store the OpenAI models response in the message table in the database, so that user can fetch the chat session history.
    - There should be a separate route to stop the running stream and related background process.
    - We can setup redis to track the active stream for stopping theme if required.
    - Auto-create a new chat session when streaming starts without chat_id and return the chat_id as first chunk of the stream.
    - After completing the tasks, create a concise doc containing flow, curls and responses which can be used by the frontend. Keep it in the be/docs directory. Keep it concise and to the point.
</instructions>

<testing>
    - Unit tests for chat stream SSE.
    - Unit tests for chat history REST API.
    - Unit tests for stopping the running stream and related background process.
    - E2E test for start new chat stream, stop it and fetch the saved session history.
</testing>

<guardrails>
    - Do not use any external libraries or frameworks unless absolutely necessary.
    - Never hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Do not hardcode any api urls in the code. Always use a common constants file for the api urls if common and if local to the component, use a local constants file.
    - Do not use "any" type in the code. Always use the correct type for the variables.
</guardrails>
