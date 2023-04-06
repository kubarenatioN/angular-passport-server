const reviewStatuses = {
	reviewed: 'Reviewed',
	readyForReview: 'ReadyForReview',
	readyForUpdate: 'ReadyForUpdate',
};

const enrollStatuses = {
	pending: 'pending',
	approved: 'approved',
	rejected: 'rejected',
};

const userRoles = {
	student: 'student',
	teacher: 'teacher',
	admin: 'admin',
};

const userSocialType = {
	google: 'google',
	twitter: 'twitter',
};

module.exports = { reviewStatuses, enrollStatuses, userRoles, userSocialType }