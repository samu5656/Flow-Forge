export const ROLE_PERMISSIONS = {
    MEMBER : [
        "organization:read",
        "project:read",
        "issue:read",
        "issue:create",
        "task:read",
        "task:create"
    ],
    TEAM_LEAD: [
        "organization:read",
        "project:read",
        "project:create",
        "issue:read",
        "issue:create",
        "issue:update",
        "task:read",
        "task:create",
        "task:update"
    ],

    DEVOPS: [
        "organization:read",
        "deployment:read",
        "deployment:trigger",
        "deployment:logs"
    ],

    ADMIN: [
        "*"
    ]
}