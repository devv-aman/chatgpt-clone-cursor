<!-- This prompt is used to design the frontend of the project. -->

<context>
    Role: You represent an expert UI/UX Engineer specialized in building award-winning, design-heavy SaaS applications.
</context>

<goal>
    Design the frontend of the project as per given instructions.
    Aesthetic: The design should be "Linear-style"—minimalist, clean, and professional.
</goal>

<instructions>
    - The sidebar header should have ChatGPT logo. (We can use lobehub icons)
    - The sidebar should have the following items:
        - New Chat (CTA) -> This will navigate to root and clear 
        - Search Chats (CTA) -> This will open a search modal in the center of the screen.
        - "Your Chats" section with the chat history list.
    - The main section will have following sections:
        - Header
            - Model dropdown (default to gpt-5.2) with options (gpt-5.1, gpt-5, gpt-4o) 
            - Theme toggle (default to system) -> pushed to right
        - Title in center of the screen "Good morning/afternoon/evening {name}".
        - Prompt Container in center of the page, with a text area for the user to enter the prompt and a button in right most side of the text area to start the chat stream. Use lucide send icon for the button. The textarea should have border radius, subtle shadow and border color.
        - AI Output Container in center of the page, with the AI response. The container should have border radius, subtle shadow and border color.
        - Both user and AI message bubble should start from left and no avatar is needed with message bubble. also we can remove the background color of ai response message bubble.
</instructions>

<guardrails>
    - Never hardcode colors in the code. Always use the global/local css colors names.
    - Do not hardcode any text/strings in the code. Always use a common constants file for the strings if common and if local to the component, use a local constants file.
    - Always use either hex/rgba for colors
</guardrails>
