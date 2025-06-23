export function createBridgeMessage(reason, eventName, data = {}) {
    const priorities = {
        chat: 1,
        health: 3,
        death: 1,
        kicked: 2,
        idle: 4,
        self_defense: 2,
        hunting: 2,
        cowardice: 3
    };

    if (!priorities[eventName]) {
        console.warn(`Unknown event name: ${eventName}. Valid events are: ${Object.keys(priorities).join(', ')}`);
        return null; 
    }

    return {
        priority: priorities[eventName],
        reason,
        eventName,
        timestamp: Date.now(),
        data: data,
    };
}
