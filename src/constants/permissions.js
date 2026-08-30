export const ROLE_PERMISSIONS = {
    MEMBER: [
        "organization:read",
        "project:read",
        "issue:read",
        "issue:create",
        "task:read",
        "task:create",
        "team:read",
        "project:read"
    ],
    TEAM_LEAD: [
        "organization:read",
        "project:read",
        "project:create",
        "project:update",
        "issue:read",
        "issue:create",
        "issue:update",
        "task:read",
        "task:create",
        "task:update",
        "team:read",
        "team:create",
        "team:update",
    ],

    DEVOPS: [
        "organization:read",
        "team:read",
        "project:read",
        "deployment:read",
        "deployment:trigger",
        "deployment:logs"
    ],

    ADMIN: [
        "*"
    ]
}