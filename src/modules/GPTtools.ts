const tools = [
    {
        type: "function",
        function: {
            name: "createReminder",
            description: "allow the user to create a reminder ",
            parameters: {
                type: "object",
                properties: {
                    order_id: {
                        type: "string",
                        description: "The customer's order ID.",
                    },
                },
                required: ["order_id"],
                additionalProperties: false,
            },
        }
    }
];