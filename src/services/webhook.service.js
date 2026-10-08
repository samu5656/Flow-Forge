import {
    createWebhookEvent,
    findWebhookEventByDeliveryId,
    markWebhookEventFailed,
    markWebhookEventPending,
    markWebhookEventProcessed,
    markWebhookEventSkipped
} from '../repositories/webhookEvent.repository.js';

/**
 * Process an incoming GitHub webhook event.
 *
 * Returns an object: { alreadyProcessed: boolean }
 * so the controller knows whether to skip processing.
 */

export const processWebhookEvent = async ({ deliveryId, eventType, action, payload }) => {
    //idempotency
    const existingEvent = await findWebhookEventByDeliveryId(deliveryId);

    if (existingEvent) {
        console.log("Duplicate webhook event");
        return { alreadyProcessed: true };
    }

    const repositoryFullName = payload.repository?.full_name || null;

    const webhookEvent = await createWebhookEvent({
        deliveryId,
        eventType,
        action: action || null,
        payload,
        repositoryFullName,
        status: "PENDING"
    });

    //process
    try {
        await handleEvent(eventType, action, payload);
        await markWebhookEventProcessed(webhookEvent.id);
    } catch (error) {
        console.error("Failed to process webhook event", error);
        await markWebhookEventFailed(webhookEvent.id, error);
    }

    return { alreadyProcessed: false };
};

const handleEvent = async (eventType, action, payload) => {
    switch (eventType) {
        case 'ping':
            console.log(`Ping received! Webhook ID: ${payload.hook_id}`);
            break;
        case 'push':
            console.log(`Push to ${payload.ref} by ${payload.pusher?.name}`);
            console.log(`   Commits: ${payload.commits?.length || 0}`);
            break;
        case 'issues':
            console.log(`Issue ${action}: "${payload.issue?.title}"`);
            break;
        case 'pull_request':
            console.log(`PR ${action}: "${payload.pull_request?.title}"`);
            break;
        default:
            console.log(`Received event: ${eventType} (${action || 'no action'})`);
    }
}