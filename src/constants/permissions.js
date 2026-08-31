export const ROLE_PERMISSIONS = {
    MEMBER: [
        "organization:read",

        "project:read",

        "team:read",

        "issue:read",
        "issue:create",
        "issue:update",
        
        "task:read",
        "task:create",
        "task:update",

        "label:read",

        "milestone:read"
    ],
    TEAM_LEAD: [
        "organization:read",

        "project:read",
        "project:create",
        "project:update",

        "issue:read",
        "issue:create",
        "issue:update",
        "issue:delete",

        "task:read",
        "task:create",
        "task:update",
        "task:delete",

        "team:read",
        "team:create",
        "team:update",
        "team:delete",

        "label:read",
        "label:create",
        "label:update",
        "label:delete",

        "milestone:read",
        "milestone:create",
        "milestone:update",
        "milestone:delete"
    ],

    DEVOPS: [
        "organization:read",
        "team:read",
        "project:read",

        "issue:read",

        "task:read",

        "label:read",

        "milestone:read",
        "deployment:read",
        "deployment:trigger",
        "deployment:logs"
    ],

    ADMIN: [
        "*"
    ]
}