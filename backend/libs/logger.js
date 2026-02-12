// ActivityLog model removed - logging disabled

const logActivity = async ({ action, description, entity, entityId, userId, ipAddress }) => {
  // Activity logging disabled - ActivityLog model was removed
  // This is now a no-op function to maintain backward compatibility
  return;
};

module.exports = logActivity;
