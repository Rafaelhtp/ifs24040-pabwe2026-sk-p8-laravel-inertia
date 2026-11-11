<?php

return [
    'endpoint' => rtrim(env('OPENAI_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'), '/'),
    'key' => env('OPENAI_KEY', ''),
    'model' => env('OPENAI_MODEL', 'gemini-2.5-flash'),
];

