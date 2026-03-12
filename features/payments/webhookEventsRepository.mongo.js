const WebhookEvent = require("../../DB/models/webhookEvent");


const getByEventId = async (eventId, session = null) => {
    const targetWebhookEvents = await WebhookEvent.findOne({ eventId }).session(session);
    return targetWebhookEvents;
};

const create = async (webhookEventData, session = null) => {
    const newWebhookEvent = new WebhookEvent(webhookEventData);
    return await newWebhookEvent.save({ session });
};

const updateByEventId = async (eventId, updates, session = null) => {
    const updatedWebhookEvent = await WebhookEvent.findOneAndUpdate({ eventId }, { $set: updates }, { new: true, runValidators: true, session });
    return updatedWebhookEvent;
};


module.exports = {
    getByEventId,
    create,
    updateByEventId
};